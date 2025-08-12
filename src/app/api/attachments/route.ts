import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { attachments } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, deleteFromS3, generateS3Key, validateFile, getPresignedUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;
    const commentId = formData.get('commentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate S3 key
    const prefix = taskId ? `tasks/${taskId}` : `comments/${commentId}`;
    const s3Key = generateS3Key(prefix, file.name);

    // Upload to S3
    const uploadResult = await uploadToS3(file, s3Key);
    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    // Save to database
    const attachmentId = uuidv4();
    const [attachment] = await db
      .insert(attachments)
      .values({
        id: attachmentId,
        taskId: taskId || null,
        commentId: commentId || null,
        fileName: file.name.split('.')[0],
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        s3Key,
        uploadedBy: session.user.id,
      })
      .returning();

    // Generate presigned URL for immediate use
    const url = await getPresignedUrl(s3Key);

    return NextResponse.json({
      ...attachment,
      url,
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const commentId = searchParams.get('commentId');

    let query = db.select().from(attachments);

    if (taskId) {
      query = query.where(eq(attachments.taskId, taskId));
    } else if (commentId) {
      query = query.where(eq(attachments.commentId, commentId));
    }

    const results = await query;

    // Generate presigned URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      results.map(async (attachment) => ({
        ...attachment,
        url: await getPresignedUrl(attachment.s3Key),
      }))
    );

    return NextResponse.json(attachmentsWithUrls);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 });
    }

    // Get attachment details
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check permission (only uploader can delete)
    if (attachment.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this attachment' }, { status: 403 });
    }

    // Delete from S3
    const deleted = await deleteFromS3(attachment.s3Key);
    if (!deleted) {
      console.error('Failed to delete from S3:', attachment.s3Key);
    }

    // Delete from database
    await db.delete(attachments).where(eq(attachments.id, attachmentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
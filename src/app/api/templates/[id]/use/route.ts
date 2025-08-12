import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { projectTemplates, projects, tasks, templateUsageStats } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const useTemplateSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1).max(10),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templateId = params.id;
    const body = await request.json();
    const projectData = useTemplateSchema.parse(body);

    // Get the template
    const template = await db.query.projectTemplates.findFirst({
      where: eq(projectTemplates.id, templateId),
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check access (template must be public or from same organization)
    if (!template.isPublic && template.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create project from template
    const [project] = await db
      .insert(projects)
      .values({
        name: projectData.name,
        key: projectData.key,
        description: projectData.description || template.description,
        color: template.color,
        icon: template.icon,
        organizationId: session.user.organizationId,
        ownerId: session.user.id,
        startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
        endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
      })
      .returning();

    // Create tasks from template
    if (template.taskTemplates && Array.isArray(template.taskTemplates)) {
      const tasksToCreate = template.taskTemplates.map((taskTemplate: any, index: number) => ({
        projectId: project.id,
        key: `${project.key}-${index + 1}`,
        title: taskTemplate.title,
        description: taskTemplate.description,
        type: taskTemplate.type,
        priority: taskTemplate.priority,
        status: "To Do",
        storyPoints: taskTemplate.estimatedHours ? Math.ceil(taskTemplate.estimatedHours / 2) : null,
        reporterId: session.user.id,
      }));

      if (tasksToCreate.length > 0) {
        await db.insert(tasks).values(tasksToCreate);
      }
    }

    // Track template usage
    await db.insert(templateUsageStats).values({
      templateId,
      projectId: project.id,
      usedBy: session.user.id,
    });

    return NextResponse.json({
      project,
      message: "Project created successfully from template",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error using template:", error);
    return NextResponse.json(
      { error: "Failed to create project from template" },
      { status: 500 }
    );
  }
}
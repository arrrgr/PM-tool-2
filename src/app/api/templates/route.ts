import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { projectTemplates, projects, tasks } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  key: z.string().min(1).max(10),
  color: z.string().optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  taskTemplates: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.string(),
    priority: z.string(),
    estimatedHours: z.number().optional(),
    subtasks: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
  })).optional(),
  workflowStates: z.array(z.string()).optional(),
  customFields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).optional(),
});

const createFromProjectSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  includeTasks: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const isPublic = searchParams.get("public") === "true";

    // Get templates for the organization or public templates
    let query = db
      .select()
      .from(projectTemplates)
      .where(
        isPublic
          ? eq(projectTemplates.isPublic, true)
          : eq(projectTemplates.organizationId, session.user.organizationId)
      );

    if (category) {
      query = query.where(eq(projectTemplates.category, category));
    }

    const templates = await query;

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if creating from existing project
    if ('projectId' in body) {
      const { projectId, name, description, includeTasks } = createFromProjectSchema.parse(body);

      // Get the project
      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, projectId),
          eq(projects.organizationId, session.user.organizationId)
        ),
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Get tasks if requested
      let taskTemplates = [];
      if (includeTasks) {
        const projectTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.projectId, projectId));

        taskTemplates = projectTasks.map(task => ({
          title: task.title,
          description: task.description,
          type: task.type || 'task',
          priority: task.priority || 'medium',
          estimatedHours: task.storyPoints ? task.storyPoints * 2 : undefined,
          labels: [],
        }));
      }

      // Create template from project
      const [template] = await db
        .insert(projectTemplates)
        .values({
          name,
          description: description || project.description,
          key: project.key,
          color: project.color,
          taskTemplates,
          organizationId: session.user.organizationId,
          createdBy: session.user.id,
        })
        .returning();

      return NextResponse.json(template);
    } else {
      // Create new template from scratch
      const templateData = createTemplateSchema.parse(body);

      const [template] = await db
        .insert(projectTemplates)
        .values({
          ...templateData,
          organizationId: session.user.organizationId,
          createdBy: session.user.id,
        })
        .returning();

      return NextResponse.json(template);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { db } from "@/lib/db";
// import { prisma } from "@/app/data/database";

export async function POST(request: NextRequest) {
  try {
    const user = await userRequired();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, workspaceId } = await request.json();

    if (!projectId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the project exists and is public
    const originalProject = await db.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            attachments: true,
          },
        },
        documentation: true,
      },
    });

    if (!originalProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (originalProject.visibility !== "PUBLIC") {
      return NextResponse.json(
        { error: "Project is not public" },
        { status: 403 }
      );
    }

    // Verify user has access to the workspace
    const workspaceMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.user.id,
          workspaceId: workspaceId,
        },
      },
    });

    if (!workspaceMember) {
      return NextResponse.json(
        { error: "No access to workspace" },
        { status: 403 }
      );
    }

    // Create the cloned project
    const clonedProject = await db.project.create({
      data: {
        name: `${originalProject.name} (Clone)`,
        description: originalProject.description,
        workspaceId: workspaceId,
        visibility: "PERSONAL",
        difficulty: originalProject.difficulty,
        role: originalProject.role,
        createdById: user.user.id,
      },
    });

    // Grant access to the cloned project
    await db.projectAccess.create({
      data: {
        workspaceMemberId: workspaceMember.id,
        projectId: clonedProject.id,
        hasAccess: true,
      },
    });

    // Clone tasks
    for (const task of originalProject.tasks) {
      const clonedTask = await db.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: "TODO", // Reset to TODO
          priority: task.priority,
          startDate: task.startDate,
          dueDate: task.dueDate,
          position: task.position,
          projectId: clonedProject.id,
          workspaceId: workspaceId,
          // Don't assign to anyone initially
        },
      });

      // Clone attachments
      for (const attachment of task.attachments) {
        await db.file.create({
          data: {
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
            taskId: clonedTask.id,
          },
        });
      }
    }

    // Clone documentation if it exists
    if (originalProject.documentation) {
  await db.documentation.create({
    data: {
      content: originalProject.documentation.content,
      projectId: clonedProject.id,
      updatedBy: user.user.id,
    },
  });
}

    // Create activity record
    await db.activity.create({
      data: {
        type: "PROJECT_CREATED",
        description: `Cloned project "${originalProject.name}"`,
        userId: user.user.id,
        projectId: clonedProject.id,
        metadata: {
          originalProjectId: originalProject.id,
          originalProjectName: originalProject.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project cloned successfully",
      clonedProjectId: clonedProject.id,
    });
  } catch (error) {
    console.error("Error cloning project:", error);
    return NextResponse.json(
      { error: "Failed to clone project" },
      { status: 500 }
    );
  }
}
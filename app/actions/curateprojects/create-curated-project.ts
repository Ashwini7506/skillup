"use server";

import { db } from "@/lib/db";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  visibility: z.enum(["PERSONAL", "PUBLIC"]),
  role: z.string().optional(),
  difficulty: z.enum(["NOOB", "INTERMEDIATE", "ADVANCED"]).optional(),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      attachments: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
            type: z.enum(["IMAGE", "PDF"]),
          })
        )
        .optional(),
    })
  ),
});

export async function createCuratedProject(raw: unknown, workspaceId: string) {
  const { user } = await userRequired();
  const data = schema.parse(raw);

  // ✅ Create project
  const project = await db.project.create({
    data: {
      name: data.name,
      description: data.description,
      workspaceId,
      visibility: data.visibility,
      role: data.visibility === "PUBLIC" ? data.role : null,
      difficulty: data.visibility === "PUBLIC" ? data.difficulty : null,
      createdById: user!.id,
    },
  });

  // ✅ Give the creator access to their own project (needed for deletion etc.)
  const workspaceMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user?.id as string,
        workspaceId,
      },
    },
  });

  if (workspaceMember) {
    await db.projectAccess.create({
      data: {
        workspaceMemberId: workspaceMember.id,
        projectId: project.id,
        hasAccess: true,
      },
    });
  }

  // ✅ Create tasks and files
  let pos = 1000;
  for (const t of data.tasks) {
    const task = await db.task.create({
      data: {
        title: t.title,
        description: t.description,
        projectId: project.id,
        workspaceId,
        status: "TODO",
        priority: "LOW",
        position: pos,
        startDate: new Date(),
        dueDate: new Date(),
        assigneeId: user!.id,
      },
    });

    pos += 1000;

    if (t.attachments?.length) {
      await db.file.createMany({
        data: t.attachments.map((f) => ({
          ...f,
          taskId: task.id,
        })),
      });
    }
  }

  // ✅ Refresh project list page
  revalidatePath(`/workspace/${workspaceId}/`);

  return project.id;
}

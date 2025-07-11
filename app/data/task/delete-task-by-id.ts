import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";

export const deleteTaskById = async (
  taskId: string,
  workspaceId: string,
  projectId: string
) => {
  const { user } = await userRequired();

  const workspaceMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user?.id as string,
        workspaceId,
      },
    },
  });

  if (!workspaceMember) {
    throw new Error("You are not a member of this Growthspace");
  }

  const projectAccess = await db.projectAccess.findUnique({
    where: {
      workspaceMemberId_projectId: {
        workspaceMemberId: workspaceMember.id,
        projectId,
      },
    },
  });

  // Delete the task
  await db.task.delete({
    where: { id: taskId },
  });
};

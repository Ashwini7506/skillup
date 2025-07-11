import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";

export const deleteProjectById = async (
  projectId: string,
  workspaceId: string
) => {
  const { user } = await userRequired();

  const workspaceMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user!.id,
        workspaceId,
      },
    },
  });
  if (!workspaceMember) throw new Error("Not a member of this workspace");

  const projectAccess = await db.projectAccess.findUnique({
    where: {
      workspaceMemberId_projectId: {
        workspaceMemberId: workspaceMember.id,
        projectId,
      },
    },
  });
  if (!projectAccess) throw new Error("Not allowed to delete this project");

  await db.project.delete({ where: { id: projectId } });
};

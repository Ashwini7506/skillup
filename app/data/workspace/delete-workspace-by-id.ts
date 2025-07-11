import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";

export const deleteWorkspaceById = async (workspaceId: string) => {
  const { user } = await userRequired();

  // make sure the user actually belongs to this workspace
  const member = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user!.id,
        workspaceId,
      },
    },
  });

  if (!member) throw new Error("You are not a member of this workspace");

  // optional: check role if you only want owners / admins
  // if (member.role !== "OWNER") throw new Error("Not enough permissions");

  await db.workspace.delete({
    where: { id: workspaceId },
  });
};

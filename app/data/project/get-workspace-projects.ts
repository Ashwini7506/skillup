import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";
import { AccessLevel, Prisma } from "@prisma/client";

export const getWorkspaceProjectByWorkspaceId = async (workspaceId: string) => {
  try {
    const { user } = await userRequired();
     console.log('Checking workspace access:', { workspaceId, userId: user?.id });

    const isUserMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user?.id as string,
          workspaceId,
        },
      },
    });

    if (!isUserMember) {
      throw new Error('User is not a member of workspace');
    }

    const query: Prisma.ProjectWhereInput =
      isUserMember.accessLevel === AccessLevel.OWNER
        ? { workspaceId }
        : {
            projectAccess: {
              some: {
                hasAccess: true,
                workspaceMember: { userId: user?.id, workspaceId },
              },
            },
          };

    const [projects, workspaceMembers] = await Promise.all([
      db.project.findMany({
        where: query,
        select: { id: true, name: true, workspaceId: true, description: true },
      }),
      db.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
    ]);

    return { projects, workspaceMembers };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: true,
      message: "Internal Server Error",
    };
  }
};

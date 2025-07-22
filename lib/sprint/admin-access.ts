// lib/sprint/admin-access.ts
import { db } from '../db';

export async function requireWorkspaceAdmin(userId: string, workspaceId: string) {
  // Super admin bypass
  if (userId === process.env.SKILLUP_TEAM_USER_ID) {
    return true;
  }

  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { accessLevel: true },
  });

  if (!member || member.accessLevel !== 'OWNER') {
    throw new Error('Not authorized (admin only).');
  }

  return true;
}

export async function checkWorkspaceAdmin(userId: string, workspaceId: string): Promise<boolean> {
  try {
    await requireWorkspaceAdmin(userId, workspaceId);
    return true;
  } catch {
    return false;
  }
}

export async function promoteWorkspaceMember(
  adminUserId: string,
  workspaceId: string,
  targetUserId: string,
  accessLevel: 'OWNER' | 'MEMBER'
) {
  // Verify admin access
  await requireWorkspaceAdmin(adminUserId, workspaceId);

  // If demoting to MEMBER, ensure we don't remove the last OWNER
  if (accessLevel === 'MEMBER') {
    const currentOwners = await db.workspaceMember.count({
      where: {
        workspaceId,
        accessLevel: 'OWNER',
      },
    });

    const targetMember = await db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      select: { accessLevel: true },
    });

    if (targetMember?.accessLevel === 'OWNER' && currentOwners <= 1) {
      throw new Error('Cannot remove the last workspace owner');
    }
  }

  // Update the member's access level
  const updated = await db.workspaceMember.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { accessLevel },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return updated;
}

export async function getWorkspaceMembers(workspaceId: string) {
  return await db.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: [
      { accessLevel: 'desc' }, // OWNER first
      { user: { email: 'asc' } },
    ],
  });
}
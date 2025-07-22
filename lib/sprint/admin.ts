// lib/sprint/admin.ts - Debug Version
import { db } from '@/lib/db';
import { SKILLUP_TEAM_USER_ID } from '@/lib/skillup-config';

export async function requireWorkspaceAdmin(userId: string, workspaceId: string) {
  console.log('🔍 requireWorkspaceAdmin called:', { userId, workspaceId });
  console.log('👥 Team user IDs:', SKILLUP_TEAM_USER_ID);
  
  // Super admin bypass - check if userId is in the team array
  if (SKILLUP_TEAM_USER_ID.includes(userId)) {
    console.log('✅ Super admin bypass activated');
    return true;
  }

  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { accessLevel: true },
  });

  console.log('👤 Member found:', member);

  // Allow both OWNER and ADMIN access levels
  if (!member || !['OWNER', 'ADMIN'].includes(member.accessLevel)) {
    console.log('❌ Access denied - not owner or admin');
    throw new Error('Not authorized (admin only).');
  }

  console.log('✅ Access granted');
  return true;
}

export async function isWorkspaceAdmin(userId: string, workspaceId: string): Promise<boolean> {
  console.log('🔍 isWorkspaceAdmin called:', { userId, workspaceId });
  console.log('👥 Team user IDs:', SKILLUP_TEAM_USER_ID);
  
  // Super admin bypass - check if userId is in the team array
  if (SKILLUP_TEAM_USER_ID.includes(userId)) {
    console.log('✅ Super admin bypass - returning true');
    return true;
  }

  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { accessLevel: true },
  });

  console.log('👤 Member found:', member);

  // Allow both OWNER and MEMBER access levels
  const isAdmin = member?.accessLevel === 'OWNER' || member?.accessLevel === 'MEMBER';
  console.log('🔐 Is admin result:', isAdmin);
  
  return isAdmin;
}

export async function validateLastOwnerProtection(workspaceId: string, userIdToChange: string) {
  // Count current owners
  const ownerCount = await db.workspaceMember.count({
    where: {
      workspaceId,
      accessLevel: 'OWNER'
    }
  });

  // Check if the user being changed is currently an owner
  const targetMember = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: userIdToChange, workspaceId } },
    select: { accessLevel: true }
  });

  // If we're trying to demote the last owner, prevent it
  if (ownerCount === 1 && targetMember?.accessLevel === 'OWNER') {
    throw new Error('Cannot remove the last owner from workspace');
  }

  return true;
}
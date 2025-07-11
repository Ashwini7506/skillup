'use server';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { userRequired } from '../data/user/is-user-authenticated';

export const acceptInvitation = async (token: string) => {
  try {
    const { user } = await userRequired();

    const invitation = await db.invitationToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        project: {
          include: {
            Workspace: true
          }
        }
      }
    });

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.email.toLowerCase() !== user?.email?.toLowerCase()) {
  throw new Error('This invitation is not for your email address');
}

    // Check if user is already a workspace member
    let workspaceMember = await db.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspaceId: invitation.project?.workspaceId
      }
    });

    // If not a workspace member, add them
    if (!workspaceMember) {
      workspaceMember = await db.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invitation.project?.workspaceId!,
          accessLevel: 'MEMBER'
        }
      });
    }

    // Add project access
    await db.projectAccess.create({
      data: {
        workspaceMemberId: workspaceMember.id,
        projectId: invitation.projectId!,
        hasAccess: true
      }
    });

    // Mark invitation as used
    await db.invitationToken.update({
      where: { id: invitation.id },
      data: { used: true }
    });

    // Create activity
    await db.activity.create({
      data: {
        type: 'PROJECT_INVITATION_ACCEPTED', // Use the correct ActivityType value as defined in your Prisma schema
        description: `joined the project via invitation`,
        userId: user.id,
        projectId: invitation.projectId!
      }
    });

    const workspaceId = invitation.project?.workspaceId;
    const projectId = invitation.projectId;
    return { 
      success: true, 
      redirectTo: `/workspace/${workspaceId}/projects/${projectId}` 
    };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to accept invitation' 
    };
  }
};
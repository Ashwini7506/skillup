'use server';

import { userRequired } from '@/app/data/user/is-user-authenticated';
import { createProjectInvitation, createOTPVerification, verifyOTP } from '@/lib/invitation-service';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  projectId: z.string().min(1, 'Project ID is required')
});

export const inviteUserToProject = async (formData: FormData) => {
  try {
    const { user } = await userRequired();
    
    const data = {
      email: formData.get('email') as string,
      projectId: formData.get('projectId') as string
    };

    const validatedData = inviteSchema.parse(data);

    // Check if user has permission to invite to this project
    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        projectAccess: {
          some: {
            workspaceMember: {
              userId: user?.id
            },
            hasAccess: true
          }
        }
      },
      include: {
        Workspace: {
          include: {
            members: {
              where: {
                userId: user?.id
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found or you do not have permission to invite users');
    }

    // Check if user is already invited or is a member
    const existingInvitation = await db.invitationToken.findFirst({
      where: {
        email: validatedData.email,
        projectId: validatedData.projectId,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingInvitation) {
      throw new Error('User is already invited to this project');
    }

    // Check if user is already a member
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      const existingMember = await db.workspaceMember.findFirst({
        where: {
          userId: existingUser.id,
          workspaceId: project.workspaceId
        }
      });

      if (existingMember) {
        // Check if already has project access
        const hasAccess = await db.projectAccess.findFirst({
          where: {
            workspaceMemberId: existingMember.id,
            projectId: validatedData.projectId
          }
        });

        if (hasAccess) {
          throw new Error('User is already a member of this project');
        }
      }
    }

    const result = await createProjectInvitation(
      validatedData.email,
      validatedData.projectId,
      user?.id as string,
    );

    if (result.success) {
      await db.activity.create({
        data: {
          type: 'PROJECT_INVITATION_SENT',
          description: `invited ${validatedData.email} to the project`,
          userId: user?.id as string,
          projectId: validatedData.projectId
        }
      });

      revalidatePath(`/workspace/${project.workspaceId}/project/${validatedData.projectId}`);
      return { success: true, message: 'Invitation sent successfully' };
    }

    throw new Error('Failed to send invitation');
  } catch (error) {
    console.error('Invitation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send invitation' 
    };
  }
};

export const sendOTPAction = async (email: string) => {
  try {
    const result = await createOTPVerification(email);
    return result;
  } catch (error) {
    console.error('OTP generation error:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
};

export const verifyOTPAction = async (email: string, otp: string) => {
  try {
    const result = await verifyOTP(email, otp);
    return result;
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: 'Failed to verify OTP' };
  }
};
'use server';

import { db } from '@/lib/db';
import { userRequired } from '../data/user/is-user-authenticated';

export const acceptSprintCohortInvitation = async (token: string) => {
    try {
        const { user } = await userRequired();

        const invitation = await db.sprintInvitationToken.findFirst({
            where: {
                token,
                used: false,
                expiresAt: {
                    gt: new Date()
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
                workspaceId: invitation.workspaceId
            }
        });

        // If not a workspace member, add them
        if (!workspaceMember) {
            workspaceMember = await db.workspaceMember.create({
                data: {
                    userId: user.id,
                    workspaceId: invitation.workspaceId,
                    accessLevel: 'MEMBER'
                }
            });
        }

        // Check if already enrolled in this cohort
        const existingEnrollment = await db.sprintEnrollment.findFirst({
            where: {
                userId: user.id,
                cohortId: invitation.cohortId
            }
        });

        if (existingEnrollment) {
            // Mark invitation as used even if already enrolled
            await db.sprintInvitationToken.update({
                where: { id: invitation.id },
                data: { used: true }
            });

            throw new Error('You are already enrolled in this sprint cohort');
        }

        // Create sprint enrollment directly into the cohort
        await db.sprintEnrollment.create({
            data: {
                userId: user.id,
                cohortId: invitation.cohortId,
                intendedRole: invitation.intendedRole
            }
        });

        // Mark invitation as used
        await db.sprintInvitationToken.update({
            where: { id: invitation.id },
            data: { used: true }
        });

        // Create activity log
        await db.activity.create({
            data: {
                type: 'JOIN_REQUEST_ACCEPTED' as any, // Replace 'any' with the correct ActivityType if known
                description: `joined sprint cohort via invitation`,
                userId: user.id,
                workspaceId: invitation.workspaceId
            }
        });

        return {
            success: true,
            redirectTo: `/workspace/${invitation.workspaceId}/sprint/`
        };

    } catch (error) {
        console.error('Accept sprint invitation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to accept invitation'
        };
    }
};
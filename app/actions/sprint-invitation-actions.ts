'use server';

import { userRequired } from '@/app/data/user/is-user-authenticated';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { sendInvitationEmail } from '@/lib/email-service';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

const sprintInviteSchema = z.object({
    emails: z.array(z.string().email('Invalid email address')),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    cohortId: z.string().min(1, 'Cohort ID is required'),
    intendedRole: z.string().min(1, 'Role is required')
});

export const inviteUsersToSprintCohort = async (formData: FormData) => {
    try {
        const { user } = await userRequired();

        const emails = JSON.parse(formData.get('emails') as string);
        const data = {
            emails,
            workspaceId: formData.get('workspaceId') as string,
            cohortId: formData.get('cohortId') as string,
            intendedRole: formData.get('intendedRole') as string
        };

        const validatedData = sprintInviteSchema.parse(data);

        // Check if user has permission to invite to this workspace/sprint
        const workspace = await db.workspace.findFirst({
            where: {
                id: validatedData.workspaceId,
                members: {
                    some: {
                        userId: user?.id,
                        accessLevel: {
                            in: ['OWNER', 'MEMBER']
                        }
                    }
                }
            }
        });

        if (!workspace) {
            throw new Error('Workspace not found or you do not have permission to invite users');
        }

        // Get cohort details
        const cohort = await db.sprintCohort.findFirst({
            where: {
                id: validatedData.cohortId,
                activated: true
            }
        });

        if (!cohort) {
            throw new Error('Cohort not found or not activated');
        }

        const results = [];

        for (const email of validatedData.emails) {
            try {
                // Check if user is already invited
                const existingInvitation = await db.sprintInvitationToken.findFirst({
                    where: {
                        email: email,
                        cohortId: validatedData.cohortId,
                        used: false,
                        expiresAt: {
                            gt: new Date()
                        }
                    }
                });

                if (existingInvitation) {
                    results.push({ email, status: 'already_invited', error: 'User is already invited to this sprint cohort' });
                    continue;
                }
                
                if (email.toLowerCase() === user?.email?.toLowerCase()) {
                    results.push({ email, status: 'error', error: 'Cannot invite yourself' });
                    continue;
                }

                // Check if user already exists and is enrolled in this cohort
                const existingUser = await db.user.findUnique({
                    where: { email: email },
                    include: {
                        sprintEnrollments: {
                            where: {
                                cohortId: validatedData.cohortId
                            }
                        }
                    }
                });

                if (existingUser && existingUser.sprintEnrollments.length > 0) {
                    results.push({ email, status: 'already_enrolled', error: 'User is already enrolled in this sprint cohort' });
                    continue;
                }

                // Create sprint invitation token
                const token = crypto.randomUUID();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

                const invitation = await db.sprintInvitationToken.create({
                    data: {
                        token,
                        email: email,
                        cohortId: validatedData.cohortId,
                        workspaceId: validatedData.workspaceId,
                        intendedRole: validatedData.intendedRole,
                        invitedById: user?.id as string,
                        expiresAt,
                        used: false
                    }
                });

                // Send invitation email
                const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sprint/invitation/${token}`;
                const inviterName = (user?.given_name as string) || (user?.email as string) || 'Project Admin';
                const projectName = `${cohort.name} Sprint Cohort`;

                await sendInvitationEmail(
                    email,
                    inviterName,
                    projectName,
                    invitationUrl
                );

                results.push({ email, status: 'success', invitationId: invitation.id });

            } catch (error) {
                console.error(`Failed to invite ${email}:`, error);
                results.push({
                    email,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Failed to send invitation'
                });
            }
        }

        revalidatePath(`/workspace/${validatedData.workspaceId}/sprint/admin/enrollments`);

        return {
            success: true,
            results,
            message: `Processed ${results.length} invitations`
        };

    } catch (error) {
        console.error('Sprint invitation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send invitations'
        };
    }
};
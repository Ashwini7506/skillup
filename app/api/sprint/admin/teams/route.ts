// app/api/sprint/admin/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

// GET handler for fetching teams
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // First get all cohorts for this workspace to get their IDs
    const workspaceCohorts = await db.sprintCohort.findMany({
      where: {
        enrollments: {
          some: {
            user: {
              workspace: {
                some: {
                  workspaceId: workspaceId
                }
              }
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    const cohortIds = workspaceCohorts.map(c => c.id);

    // Fetch teams for these cohorts
    const teams = await db.sprintTeam.findMany({
      where: {
        cohortId: {
          in: cohortIds
        }
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            activated: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Enhance teams with member details
    const enhancedTeams = await Promise.all(
      teams.map(async (team) => {
        // Get member details
        const memberDetails = await db.user.findMany({
          where: {
            id: {
              in: team.members
            }
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        });

        // Get sprint roles from enrollments
        const enrollments = await db.sprintEnrollment.findMany({
          where: {
            userId: {
              in: team.members
            },
            cohortId: team.cohortId
          },
          select: {
            userId: true,
            intendedRole: true
          }
        });

        const roleMap = enrollments.reduce((acc, enrollment) => {
          acc[enrollment.userId] = enrollment.intendedRole;
          return acc;
        }, {} as Record<string, string>);

        const memberDetailsWithRoles = memberDetails.map(member => ({
          ...member,
          sprintRole: roleMap[member.id]
        }));

        return {
          id: team.id,
          name: team.name,
          cohortId: team.cohortId,
          cohort: {
            id: team.cohort.id,
            activated: team.cohort.activated
          },
          members: team.members,
          projectId: team.projectId,
          project: team.project ? {
            id: team.project.id,
            name: team.project.name
          } : null,
          memberDetails: memberDetailsWithRoles,
          createdAt: team.createdAt
        };
      })
    );

    return NextResponse.json({ teams: enhancedTeams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for creating teams
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, cohortId, mode, teams, templateProjectId } = body;

    if (!workspaceId || !cohortId || !mode) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify cohort exists and belongs to this workspace
    const cohort = await db.sprintCohort.findFirst({
      where: {
        id: cohortId,
        enrollments: {
          some: {
            user: {
              workspace: {
                some: {
                  workspaceId: workspaceId
                }
              }
            }
          }
        }
      }
    });

    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found or not accessible' }, { status: 404 });
    }

    if (mode === 'auto') {
      // Auto-generate teams
      const enrollments = await db.sprintEnrollment.findMany({
        where: {
          cohortId: cohortId,
          // Only include users not already on teams
          userId: {
            notIn: await db.sprintTeam.findMany({
              where: { cohortId },
              select: { members: true }
            }).then(teams => teams.flatMap(t => t.members))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        }
      });

      if (enrollments.length === 0) {
        return NextResponse.json({ error: 'No available users to form teams' }, { status: 400 });
      }

      // Auto-balance teams by intended role
      const teamSize = 4; // Configurable
      const numTeams = Math.ceil(enrollments.length / teamSize);
      const autoTeams: string[][] = [];

      // Group by intended role for balanced distribution
      const roleGroups = enrollments.reduce((groups, enrollment) => {
        const role = enrollment.intendedRole || 'MEMBER';
        if (!groups[role]) groups[role] = [];
        groups[role].push(enrollment);
        return groups;
      }, {} as Record<string, typeof enrollments>);

      // Distribute users across teams
      for (let i = 0; i < numTeams; i++) {
        autoTeams.push([]);
      }

      // Round-robin distribution by role
      Object.entries(roleGroups).forEach(([role, users]) => {
        users.forEach((user, index) => {
          const teamIndex = index % numTeams;
          autoTeams[teamIndex].push(user.userId);
        });
      });

      // Create teams in database
      const createdTeams = [];
      for (let i = 0; i < autoTeams.length; i++) {
        if (autoTeams[i].length > 0) {
          // Create or clone project for team
          let teamProject = null;
          if (templateProjectId) {
            teamProject = await cloneProjectForTeam(templateProjectId, workspaceId, `Team ${i + 1} Project`);
          }

          const team = await db.sprintTeam.create({
            data: {
              name: `Team ${i + 1}`,
              members: autoTeams[i],
              cohortId: cohortId,
              projectId: teamProject?.id || null
            }
          });

          // Create initial story state
          await db.sprintTeamStoryState.create({
            data: {
              teamId: team.id,
              state: {
                introSeen: false,
                currentChapter: 1,
                currentSegment: 1,
                completedSegments: []
              }
            }
          });

          createdTeams.push(team);
        }
      }

      return NextResponse.json({
        teams: createdTeams,
        message: `Successfully created ${createdTeams.length} teams`
      });

    } else if (mode === 'manual') {
      // Manual team creation
      if (!teams || !Array.isArray(teams)) {
        return NextResponse.json({ error: 'Teams array required for manual mode' }, { status: 400 });
      }

      const createdTeams = [];
      for (const teamData of teams) {
        const { name, members } = teamData;

        if (!name || !members || !Array.isArray(members)) {
          continue;
        }

        // Create or clone project for team
        let teamProject = null;
        if (templateProjectId) {
          teamProject = await cloneProjectForTeam(templateProjectId, workspaceId, `${name} Project`);
        }

        const team = await db.sprintTeam.create({
          data: {
            name,
            members,
            cohortId: cohortId,
            projectId: teamProject?.id || null
          }
        });

        // Create initial story state
        await db.sprintTeamStoryState.create({
          data: {
            teamId: team.id,
            state: {
              introSeen: false,
              currentChapter: 1,
              currentSegment: 1,
              completedSegments: []
            }
          }
        });

        createdTeams.push(team);
      }

      return NextResponse.json({
        teams: createdTeams,
        message: `Successfully created ${createdTeams.length} teams`
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Error creating teams:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler for deleting teams
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const teamId = searchParams.get('teamId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify team exists and belongs to a cohort in this workspace
    const team = await db.sprintTeam.findFirst({
      where: {
        id: teamId,
        cohort: {
          enrollments: {
            some: {
              user: {
                workspace: {
                  some: {
                    workspaceId: workspaceId
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Delete related story state first (if exists)
    await db.sprintTeamStoryState.deleteMany({
      where: { teamId: teamId }
    });

    // Delete the team
    await db.sprintTeam.delete({
      where: { id: teamId }
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler for updating teams
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, teamId, name, members, action, userId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Handle member management actions
    if (action === 'addMember' && userId) {
      // Add member to team
      const team = await db.sprintTeam.findUnique({
        where: { id: teamId }
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      if (!team.members.includes(userId)) {
        const updatedMembers = [...team.members, userId];

        const updatedTeam = await db.sprintTeam.update({
          where: { id: teamId },
          data: { members: updatedMembers },
          include: {
            cohort: {
              select: {
                id: true,
                name: true,
                activated: true
              }
            },
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        return NextResponse.json({ team: updatedTeam });
      }
    } else if (action === 'removeMember' && userId) {
      // Remove member from team
      const team = await db.sprintTeam.findUnique({
        where: { id: teamId }
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      const updatedMembers = team.members.filter(id => id !== userId);

      const updatedTeam = await db.sprintTeam.update({
        where: { id: teamId },
        data: { members: updatedMembers },
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
              activated: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return NextResponse.json({ team: updatedTeam });
    } else {
      // Update team name or other properties
      const updatedTeam = await db.sprintTeam.update({
        where: { id: teamId },
        data: {
          ...(name && { name }),
          ...(members && { members })
        },
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
              activated: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return NextResponse.json({ team: updatedTeam });
    }
  } catch (error) {
    console.error('Error updating team:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function cloneProjectForTeam(templateProjectId: string, workspaceId: string, projectName: string) {
  try {
    // Get template project with tasks
    const templateProject = await db.project.findUnique({
      where: { id: templateProjectId },
      include: {
        tasks: true
      }
    });

    if (!templateProject) {
      throw new Error('Template project not found');
    }

    // Create new project
    const newProject = await db.project.create({
      data: {
        name: projectName,
        description: templateProject.description,
        workspaceId: workspaceId,
        visibility: templateProject.visibility,
        difficulty: templateProject.difficulty,
        role: templateProject.role,
        createdById: templateProject.createdById
      }
    });

    // Clone tasks
    for (const task of templateProject.tasks) {
      await db.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: 'TODO',
          priority: task.priority,
          projectId: newProject.id,
          workspaceId: workspaceId,
          startDate: task.startDate,
          dueDate: task.dueDate,
          position: task.position,
          assigneeId: null // Teams will assign themselves
        }
      });
    }

    return newProject;
  } catch (error) {
    console.error('Error cloning project:', error);
    return null;
  }
}
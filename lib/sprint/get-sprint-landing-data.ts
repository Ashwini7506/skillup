// lib/sprint/get-sprint-landing-data.ts
import { db } from '@/lib/db';

// Remove the old type definition - we'll use the one from types/sprint-hub.ts
export async function getSprintLandingData(
  userId: string,
  // workspaceId: string
) {
  try {
    // First, find if user has any active enrollment
    const enrollment = await db.sprintEnrollment.findFirst({
      where: {
        userId: userId,
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            activated: true,
            workspaceId: true, // Now available since you updated the Prisma model
            teams: {
              where: {
                members: {
                  has: userId,
                },
              },
              include: {
                project: {
                  include: {
                    tasks: {
                      select: {
                        id: true,
                        title: true,
                        status: true,
                        assigneeId: true,
                      },
                    },
                  },
                },
                cohort: true,
                storyState: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!enrollment) {
      return {
        enrollment: null,
        cohort: null,
        team: null,
        storyState: null,
        project: null,
        teamMembers: [],
      };
    }

    const team = enrollment.cohort.teams[0];
    
    // Get team members with their stats if team exists
    interface TeamMember {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      sprintRole: string;
      taskCount: number;
      completedTasks: number;
    }
    let teamMembers: TeamMember[] = [];
    if (team) {
      const members = await db.user.findMany({
        where: {
          id: {
            in: team.members,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          sprintEnrollments: {
            where: {
              cohortId: team.cohortId,
            },
            select: {
              intendedRole: true,
            },
          },
          tasks: {
            where: {
              projectId: team.projectId || '',
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      teamMembers = members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email || '',
        image: member.image,
        sprintRole: member.sprintEnrollments[0]?.intendedRole || 'Member',
        taskCount: member.tasks.length,
        completedTasks: member.tasks.filter(task => task.status === 'COMPLETED').length,
      }));
    }

    return {
      enrollment: {
        id: enrollment.id,
        cohortId: enrollment.cohortId,
        intendedRole: enrollment.intendedRole,
        enrolledAt: enrollment.createdAt,
      },
      cohort: enrollment.cohort ? {
        id: enrollment.cohort.id,
        name: enrollment.cohort.name,
        startDate: enrollment.cohort.startDate,
        endDate: enrollment.cohort.endDate,
        activated: enrollment.cohort.activated,
        workspaceId: enrollment.cohort.workspaceId, // Now directly available from the model
      } : null,
      team: team ? {
        id: team.id,
        name: team.name,
        members: team.members,
        projectId: team.projectId || '',
        cohortId: team.cohortId,
      } : null,
      storyState: team?.storyState ? {
        id: team.storyState.id,
        state: team.storyState.state,
        // Parse the state to extract the required properties or provide defaults
        introComplete: (team.storyState.state as any)?.introComplete || false,
        currentChapter: (team.storyState.state as any)?.currentChapter || 0,
        currentSegment: (team.storyState.state as any)?.currentSegment || 0,
      } : null,
      project: team?.project ? {
        id: team.project.id,
        name: team.project.name,
        tasks: team.project.tasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'COMPLETED',
          assignedTo: task.assigneeId ? [task.assigneeId] : [],
        })),
      } : null,
      teamMembers, // Uncommented this since it's expected in the return type
    };
  } catch (error) {
    console.error('Error fetching sprint landing data:', error);
    return {
      enrollment: null,
      cohort: null,
      team: null,
      storyState: null,
      project: null,
      teamMembers: [],
    };
  }
}

// lib/sprint/sprint-utils.ts
export function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Started';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getRoleColor(role: string): string {
  const colors: { [key: string]: string } = {
    'Product Manager': 'bg-purple-100 text-purple-800',
    'Designer': 'bg-pink-100 text-pink-800',
    'Frontend Developer': 'bg-blue-100 text-blue-800',
    'Backend Developer': 'bg-green-100 text-green-800',
    'Full Stack Developer': 'bg-indigo-100 text-indigo-800',
    'DevOps Engineer': 'bg-gray-100 text-gray-800',
    'QA Engineer': 'bg-yellow-100 text-yellow-800',
    'Data Scientist': 'bg-red-100 text-red-800',
    'Mobile Developer': 'bg-cyan-100 text-cyan-800',
    'Member': 'bg-gray-100 text-gray-600',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-600';
}

export function getFileIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'zip':
    case 'rar':
      return '📦';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📽️';
    default:
      return '📁';
  }
}

export function truncateFileName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  
  const extension = name.split('.').pop();
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
  const maxNameLength = maxLength - (extension ? extension.length + 1 : 0) - 3; // -3 for "..."
  
  if (nameWithoutExt.length <= maxNameLength) return name;
  
  return `${nameWithoutExt.substring(0, maxNameLength)}...${extension ? '.' + extension : ''}`;
}
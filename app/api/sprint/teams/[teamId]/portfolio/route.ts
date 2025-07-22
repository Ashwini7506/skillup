// app/api/sprint/teams/[teamId]/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Get team with all related data
    const team = await db.sprintTeam.findFirst({
      where: {
        id: teamId,
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            workspaceId: true
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

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify user has access to this workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspaceId: team.cohort.workspaceId
      }
    });

    if (!workspaceMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get team members
    const members = await db.user.findMany({
      where: {
        id: {
          in: team.members
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        githubUrl: true,
        linkedinUrl: true,
        // Add more fields as needed
      }
    });

    // Get member roles from enrollments
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

    // Get files (videos and documents)
    let files: any[] = [];
    let videos: any[] = [];

    if (team.projectId) {
      const projectFiles = await db.file.findMany({
        where: {
          OR: [
            {
              task: {
                projectId: team.projectId
              }
            },
            {
              taskId: null // Files uploaded without specific tasks
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Separate videos and other files
      files = projectFiles.filter(file => 
        file.type !== 'VIDEO'
      ).map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        url: file.url,
        uploadedAt: file.createdAt,
        uploaderName: 'Team Member' // You might want to track this better
      }));

      videos = projectFiles.filter(file => 
        file.type === 'VIDEO'
      ).map(file => ({
        id: file.id,
        title: file.name,
        description: null,
        url: file.url,
        thumbnail: null,
        uploadedAt: file.createdAt
      }));
    }

    // Format response
    const portfolioData = {
      id: team.id,
      name: team.name,
      cohortName: team.cohort.name,
      description: null, // Add this field to your schema if needed
      members: members.map(member => ({
        id: member.id,
        name: member.name || 'Unknown',
        email: member.email,
        role: roleMap[member.id] || 'Team Member',
        image: member.image,
        githubUrl: member.githubUrl,
        linkedinUrl: member.linkedinUrl,
        phone: null, // Add these fields to User model if needed
        location: null
      })),
      videos,
      files,
      projectId: team.projectId,
      projectName: team.project?.name
    };

    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Error fetching team portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

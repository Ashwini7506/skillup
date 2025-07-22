// app/api/sprint/admin/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const cohortId = searchParams.get('cohortId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Get all workspace members with complete user data
    const workspaceMembers = await db.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        }
      }
    });

    console.log('Found workspace members:', workspaceMembers.length);

    // Get all sprint enrollments for workspace members
    // Since cohorts don't have workspaceId, we need to get enrollments for all workspace users
    const workspaceUserIds = workspaceMembers.map(m => m.user.id);
    
    const enrollments = await db.sprintEnrollment.findMany({
      where: {
        userId: {
          in: workspaceUserIds
        },
        ...(cohortId && { cohortId }) // Filter by cohort if specified
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        cohort: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Found enrollments:', enrollments.length);

    // Create enrollment map for quick lookup
    const enrollmentMap = new Map();
    enrollments.forEach(enrollment => {
      enrollmentMap.set(enrollment.userId, enrollment);
    });

    // Transform data to match frontend expectations
    const members = workspaceMembers.map(member => ({
      id: member.id,           // WorkspaceMember ID
      userId: member.user.id,  // User ID
      user: {
        id: member.user.id,
        email: member.user.email,
        Name: member.user.name || '',
      },
      accessLevel: member.accessLevel,
      isEnrolled: enrollmentMap.has(member.user.id),
      enrollmentId: enrollmentMap.get(member.user.id)?.id,
      intendedRole: enrollmentMap.get(member.user.id)?.intendedRole,
      cohortName: enrollmentMap.get(member.user.id)?.cohort?.name
    }));

    console.log('Transformed members:', members.length);
    console.log('Sample member:', members[0]);

    return NextResponse.json({ 
      members,
      totalMembers: workspaceMembers.length,
      enrolledCount: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, cohortId, userIds, intendedRole } = body;

    console.log('Bulk enrollment request:', { workspaceId, cohortId, userIds, intendedRole });

    if (!workspaceId || !cohortId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify cohort exists and is activated
    const cohort = await db.sprintCohort.findFirst({
      where: {
        id: cohortId,
        activated: true
      }
    });

    if (!cohort) {
      return NextResponse.json({ error: 'Active cohort not found' }, { status: 404 });
    }

    // Verify all users are workspace members
    const workspaceMembers = await db.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
        userId: {
          in: userIds
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true, // Ensure name is included
          }
        }
      }
    });

    if (workspaceMembers.length !== userIds.length) {
      const foundUserIds = workspaceMembers.map(m => m.userId);
      const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));
      console.log('Missing users:', missingUserIds);
      return NextResponse.json({ 
        error: 'Some users are not workspace members',
        missingUsers: missingUserIds 
      }, { status: 400 });
    }

    // Create enrollments (upsert to handle duplicates)
    const enrollmentPromises = userIds.map(userId => 
      db.sprintEnrollment.upsert({
        where: {
          cohortId_userId: {
            userId,
            cohortId
          }
        },
        create: {
          userId,
          cohortId,
          intendedRole: intendedRole || 'participant'
        },
        update: {
          intendedRole: intendedRole || 'participant'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true // Ensure name is included
            }
          },
          cohort: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    );

    const enrollments = await Promise.all(enrollmentPromises);
    console.log('Created enrollments:', enrollments.length);

    return NextResponse.json({ 
      success: true,
      enrollments,
      message: `Successfully enrolled ${enrollments.length} users in ${cohort.name}` 
    });
  } catch (error) {
    console.error('Error creating enrollments:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ 
        error: 'Some users are already enrolled in this cohort' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
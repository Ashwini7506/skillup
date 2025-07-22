// app/api/sprint/admin/cohorts/route.ts
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
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Get cohorts filtered by workspaceId
    const cohorts = await db.sprintCohort.findMany({
      where: {
        workspaceId: workspaceId
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            teams: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedCohorts = cohorts.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      activated: cohort.activated,
      createdAt: cohort.createdAt,
      enrollmentCount: cohort._count.enrollments,
      teamCount: cohort._count.teams,
      status: getSprintStatus(cohort.startDate, cohort.endDate, cohort.activated)
    }));

    return NextResponse.json({ cohorts: formattedCohorts });
  } catch (error) {
    console.error('Error fetching cohorts:', error);
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
    const { workspaceId, name, startDate, endDate, activated } = body;

    if (!workspaceId || !name) {
      return NextResponse.json({ error: 'Workspace ID and name are required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Create cohort with workspaceId field
    const cohort = await db.sprintCohort.create({
      data: {
        name,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        activated: activated || false,
        workspaceId: workspaceId // Add the workspaceId field
      }
    });

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error('Error creating cohort:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSprintStatus(startDate: Date, endDate: Date, activated: boolean) {
  if (!activated) return 'inactive';
  
  const now = new Date();
  if (now < startDate) return 'scheduled';
  if (now > endDate) return 'completed';
  if (now >= startDate && now <= endDate) return 'active';
  return 'draft';
}
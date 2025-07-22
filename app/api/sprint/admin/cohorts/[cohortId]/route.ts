// app/api/sprint/admin/cohorts/[cohortId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cohortId } = await params;
    const { workspaceId, name, startDate, endDate, activated } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify cohort exists (without workspaceId filter since it doesn't exist in schema)
    const existingCohort = await db.sprintCohort.findUnique({
      where: {
        id: cohortId
      }
    });

    if (!existingCohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : new Date();
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : new Date();
    if (activated !== undefined) updateData.activated = activated;

    const updatedCohort = await db.sprintCohort.update({
      where: { id: cohortId },
      data: updateData
    });

    return NextResponse.json({ cohort: updatedCohort });
  } catch (error) {
    console.error('Error updating cohort:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const { cohortId } = await params;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify cohort exists (without workspaceId filter since it doesn't exist in schema)
    const existingCohort = await db.sprintCohort.findUnique({
      where: {
        id: cohortId
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            teams: true
          }
        }
      }
    });

    if (!existingCohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    // Check if cohort has enrollments or teams
    if (existingCohort._count.enrollments > 0 || existingCohort._count.teams > 0) {
      return NextResponse.json({
        error: 'Cannot delete cohort with existing enrollments or teams'
      }, { status: 400 });
    }

    await db.sprintCohort.delete({
      where: { id: cohortId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
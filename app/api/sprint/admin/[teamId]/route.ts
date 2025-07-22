// app/api/sprint/admin/teams/[teamId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = await params; // Await params
    const { workspaceId, name, members, projectId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify team exists and belongs to workspace
    const existingTeam = await db.sprintTeam.findFirst({
      where: {
        id: teamId,
        cohort: {
          workspaceId: workspaceId
        }
      }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify members are workspace members (if updating members)
    if (members && Array.isArray(members)) {
      const workspaceMembers = await db.workspaceMember.findMany({
        where: {
          workspaceId: workspaceId,
          userId: {
            in: members
          }
        }
      });

      if (workspaceMembers.length !== members.length) {
        return NextResponse.json({ error: 'Some users are not workspace members' }, { status: 400 });
      }
    }

    // Verify project belongs to workspace (if updating project)
    if (projectId) {
      const project = await db.project.findFirst({
        where: {
          id: projectId,
          workspaceId: workspaceId
        }
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found in workspace' }, { status: 404 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (members !== undefined) updateData.members = members;
    if (projectId !== undefined) updateData.projectId = projectId;

    const updatedTeam = await db.sprintTeam.update({
      where: { id: teamId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true
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

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error('Error updating team:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const { teamId } = await params; // Await params

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify team exists and belongs to workspace
    const existingTeam = await db.sprintTeam.findFirst({
      where: {
        id: teamId,
        cohort: {
          workspaceId: workspaceId
        }
      }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Delete related story state first
    await db.sprintTeamStoryState.deleteMany({
      where: { teamId: teamId }
    });

    // Delete team
    await db.sprintTeam.delete({
      where: { id: teamId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

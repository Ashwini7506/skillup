import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { userRequired } from '@/app/data/user/is-user-authenticated';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; workspaceMemberId: string }> }
) {
  try {
    const { projectId, workspaceMemberId } = await params;
    const { user } = await userRequired();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { createdById: true, workspaceId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const accessRecord = await db.projectAccess.findFirst({
      where: { projectId, workspaceMemberId },
      include: { workspaceMember: true },
    });

    if (!accessRecord) {
      return NextResponse.json({ error: 'Member not part of project' }, { status: 404 });
    }

    const isOwner = project.createdById === user.id;
    const isSelf = accessRecord.workspaceMember.userId === user.id;

    if (!isOwner && !isSelf) {
      return NextResponse.json({ error: 'Not authorized to remove member' }, { status: 403 });
    }

    // 1. Delete project access
    await db.projectAccess.delete({
      where: {
        workspaceMemberId_projectId: {
          workspaceMemberId,
          projectId,
        },
      },
    });

    // 2. Also remove the member from workspace
    await db.workspaceMember.delete({
      where: { id: workspaceMemberId },
    });

    return NextResponse.json({
      success: true,
      redirectWorkspaceId: project.workspaceId,
    });
  } catch (err) {
    console.error('[KICK_MEMBER]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
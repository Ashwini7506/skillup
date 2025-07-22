// app/api/sprint/admin/assign-project/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { workspaceId, teamId, projectId } = await req.json();
    if (!workspaceId) 
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    if (!teamId) 
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Ensure team belongs to this workspace
    const team = await db.sprintTeam.findFirst({
      where: { id: teamId, cohort: { workspaceId } }
    });
    if (!team) 
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // If assigning, ensure project in same workspace
    if (projectId) {
      const proj = await db.project.findFirst({
        where: { id: projectId, workspaceId }
      });
      if (!proj) 
        return NextResponse.json({ error: 'Project not found in workspace' }, { status: 404 });
    }

    const updated = await db.sprintTeam.update({
      where: { id: teamId },
      data: { projectId: projectId || null },
      include: {
        project: { select: { id: true, name: true } },
        cohort:  { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ team: updated });
  } catch (e: any) {
    console.error('assign-project error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

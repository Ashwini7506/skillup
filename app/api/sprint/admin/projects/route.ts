import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const workspaceId = new URL(req.url).searchParams.get('workspaceId');
    if (!workspaceId)
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

    await requireWorkspaceAdmin(user.id, workspaceId);

    const projects = await db.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true, description: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('projects route error 👉', err);
    if (err.message?.includes('Forbidden'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

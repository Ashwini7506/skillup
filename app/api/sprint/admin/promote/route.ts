// app/api/sprint/admin/promote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin, validateLastOwnerProtection } from '@/lib/sprint/admin';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, userId, accessLevel } = body;

    if (!workspaceId || !userId || !accessLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['OWNER', 'MEMBER'].includes(accessLevel)) {
      return NextResponse.json({ error: 'Invalid access level' }, { status: 400 });
    }

    await requireWorkspaceAdmin(user.id, workspaceId);

    // Verify target user is a workspace member
    const targetMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId
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

    if (!targetMember) {
      return NextResponse.json({ error: 'User not found in workspace' }, { status: 404 });
    }

    // Check if we're trying to demote the last owner
    if (accessLevel === 'MEMBER' && targetMember.accessLevel === 'OWNER') {
      await validateLastOwnerProtection(workspaceId, userId);
    }

    // Update access level
    const updatedMember = await db.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId
        }
      },
      data: {
        accessLevel: accessLevel
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

    return NextResponse.json({ 
      member: updatedMember,
      message: `Successfully updated ${updatedMember.user.email} to ${accessLevel}` 
    });
  } catch (error) {
    console.error('Error updating member access:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes('Cannot remove the last owner')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
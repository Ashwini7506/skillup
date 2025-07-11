import { NextRequest, NextResponse } from 'next/server';
import { sendJoinRequest } from '@/app/actions/members';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUserId, workspaceId, projectId } = body;

    if (!targetUserId || !workspaceId) {
      return NextResponse.json(
        { error: 'Target user ID and workspace ID are required' },
        { status: 400 }
      );
    }

    await sendJoinRequest(targetUserId, workspaceId, projectId || null);
    return NextResponse.json({ success: true, message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Send join request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send join request' },
      { status: 500 }
    );
  }
}
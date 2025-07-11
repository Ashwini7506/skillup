import { NextRequest, NextResponse } from 'next/server';
import { listJoinRequests, acceptRequest, rejectRequest } from '@/app/actions/members';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const requests = await listJoinRequests(workspaceId);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, workspaceId } = body;

    if (!requestId || !action || !workspaceId) {
      return NextResponse.json(
        { error: 'Request ID, action, and workspace ID are required' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      await acceptRequest(requestId, workspaceId);
      return NextResponse.json({ success: true, message: 'Request accepted' });
    } else if (action === 'reject') {
      await rejectRequest(requestId, workspaceId);
      return NextResponse.json({ success: true, message: 'Request rejected' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "accept" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Request action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
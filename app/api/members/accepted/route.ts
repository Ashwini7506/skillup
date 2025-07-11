import { NextRequest, NextResponse } from 'next/server';
import { listAcceptedMembers } from '@/app/actions/members';

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

    const acceptedMembers = await listAcceptedMembers(workspaceId);
    return NextResponse.json(acceptedMembers);
  } catch (error) {
    console.error('Accepted members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accepted members' },
      { status: 500 }
    );
  }
}
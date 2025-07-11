import { NextRequest, NextResponse } from 'next/server';
import { searchMembers } from '@/app/actions/members';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const job = searchParams.get('job') || '';
    const role = searchParams.get('role') || '';

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const members = await searchMembers(workspaceId, job, role);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Search members error:', error);
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    );
  }
}
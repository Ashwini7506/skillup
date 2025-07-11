import { NextRequest, NextResponse } from 'next/server';
import { listMessagesWithUser } from '@/app/actions/members';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const messages = await listMessagesWithUser(userId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
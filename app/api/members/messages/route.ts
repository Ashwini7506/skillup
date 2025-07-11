import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToUser } from '@/app/actions/members';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiverId, content, workspaceId } = body;

    if (!receiverId || !content || !workspaceId) {
      return NextResponse.json(
        { error: 'Receiver ID, content, and workspace ID are required' },
        { status: 400 }
      );
    }

    await sendMessageToUser(workspaceId, receiverId, content);
    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
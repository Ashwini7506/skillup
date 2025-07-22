import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userRequired } from '@/app/data/user/is-user-authenticated';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, workspaceId, projectId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const auth = await userRequired();
    
    if (!auth.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    // First, check if the message exists and if the current user is the sender
    const message = await db.message.findUnique({
      where: {
        id: messageId
      },
      select: {
        id: true,
        senderId: true,
        content: true
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Verify that the current user is the sender of the message
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Verify it's a team chat message
    if (!message.content.startsWith('[Team Chat]')) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }

    // Delete the message
    await db.message.delete({
      where: {
        id: messageId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });

  } catch (error) {
    console.error('Delete group message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete message' },
      { status: 500 }
    );
  }
}
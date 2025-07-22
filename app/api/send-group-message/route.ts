import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userRequired } from '@/app/data/user/is-user-authenticated';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, workspaceId, projectId, teamMembers } = body;

    if (!content || !workspaceId || !teamMembers || !Array.isArray(teamMembers)) {
      return NextResponse.json(
        { error: 'Content, workspace ID, and team members array are required' },
        { status: 400 }
      );
    }

    if (teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one team member is required' },
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

    // For team group chat, we'll create a simple group message record
    // You might want to create a separate GroupMessage table for this,
    // but for now, let's create a group chat entry or just return success
    
    // Option 1: Create individual message records for each team member
    // This allows the existing message system to work with group messages
    const messagePromises = teamMembers
      .filter(memberId => memberId !== userId) // Don't send to yourself
      .map(async (memberId: string) => {
        try {
          await db.message.create({
            data: {
              senderId: userId,
              receiverId: memberId,
              content: `[Team Chat] ${content.trim()}`,
            },
          });
          return { memberId, success: true };
        } catch (error) {
          console.error(`Failed to create message for member ${memberId}:`, error);
          return { 
            memberId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

    if (messagePromises.length === 0) {
      // Only sender in the team, just return success
      return NextResponse.json({ 
        success: true, 
        message: 'Message sent to group chat (you are the only member)',
        successfulSends: 0,
        totalMembers: teamMembers.length
      });
    }

    const results = await Promise.allSettled(messagePromises);
    
    // Count successful and failed sends
    const successfulSends = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failedSends = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    );

    // Return success even if some sends failed (group chat should be resilient)
    return NextResponse.json({ 
      success: true, 
      message: `Group message sent successfully to ${successfulSends} out of ${messagePromises.length} team members`,
      successfulSends,
      totalMembers: teamMembers.length,
      ...(failedSends.length > 0 && {
        partialFailure: true,
        failedSends: failedSends.length,
        note: 'Some team members may not have received the message'
      })
    });

  } catch (error) {
    console.error('Send group message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send group message' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userRequired } from '@/app/data/user/is-user-authenticated';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamMembers, workspaceId, projectId } = body;

    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'Team members array is required' },
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

    // Fetch all messages between team members that contain [Team Chat] prefix
    // This gets all team chat messages where current user is either sender or receiver
    const messages = await db.message.findMany({
      where: {
        content: {
          startsWith: '[Team Chat]'
        },
        OR: [
          {
            senderId: userId,
            receiverId: {
              in: teamMembers.filter(id => id !== userId)
            }
          },
          {
            receiverId: userId,
            senderId: {
              in: teamMembers.filter(id => id !== userId)
            }
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get team member details for roles - using separate queries approach
    const teamMemberDetails = await db.user.findMany({
      where: {
        id: {
          in: teamMembers
        }
      },
      select: {
        id: true,
        email: true,
      }
    });

    // Get workspace memberships separately
    const workspaceMemberships = await db.workspaceMember.findMany({
      where: {
        userId: {
          in: teamMembers
        },
        workspaceId: workspaceId
      },
      include: {
        // sprintEnrollments: {
        //   where: {
        //     sprint: {
        //       projectId: projectId
        //     }
        //   },
        //   select: {
        //     sprintRole: true
        //   }
        // }
      }
    });

    // Create a map for easy lookup
    const memberDetailsMap = new Map();
    
    // First, populate with basic user info
    teamMemberDetails.forEach(member => {
      memberDetailsMap.set(member.id, {
        email: member.email,
        sprintRole: 'Member' // default role
      });
    });

    // Then, update with workspace membership info
    workspaceMemberships.forEach(membership => {
      const existingDetails = memberDetailsMap.get(membership.userId);
      if (existingDetails) {
        // const sprintRole = membership.sprintEnrollments[0]?.sprintRole || 'Member';
        memberDetailsMap.set(membership.userId, {
          ...existingDetails,
        //   sprintRole: sprintRole
        });
      }
    });

    // Transform messages to match frontend format and deduplicate
    const seenMessages = new Set();
    const transformedMessages = messages
      .filter(message => {
        // Create a unique key for deduplication (same content + timestamp should be unique)
        const messageKey = `${message.content}-${message.createdAt.getTime()}`;
        if (seenMessages.has(messageKey)) {
          return false;
        }
        seenMessages.add(messageKey);
        return true;
      })
      .map(message => {
        const senderDetails = memberDetailsMap.get(message.senderId);
        const isCurrentUser = message.senderId === userId;
        
        return {
          id: message.id,
          senderId: message.senderId,
        //   senderEmail: isCurrentUser ? 'You' : (senderDetails?.email || message.sender.email),
          senderRole: senderDetails?.sprintRole || 'Member',
          content: message.content.replace('[Team Chat] ', ''), // Remove prefix for display
          timestamp: message.createdAt
        };
      });

    return NextResponse.json(transformedMessages);

  } catch (error) {
    console.error('Get group messages error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch group messages' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/lib/db';


// Mock database - replace with your actual database calls
// const mockNotifications = [
//   {
//     id: '1',
//     type: 'PROJECT_MEMBER_JOINED',
//     description: 'Sarah joined your project "React Dashboard"',
//     read: false,
//     createdAt: new Date().toISOString(),
//     metadata: {
//       actorId: 'user123',
//       actorName: 'Sarah Johnson',
//       projectName: 'React Dashboard'
//     },
//     project: {
//       id: 'project123',
//       name: 'React Dashboard'
//     }
//   },
//   {
//     id: '2',
//     type: 'TASK_ASSIGNED',
//     description: 'You were assigned to task "Fix authentication bug"',
//     read: false,
//     createdAt: new Date(Date.now() - 3600000).toISOString(),
//     metadata: {
//       actorId: 'user456',
//       actorName: 'John Doe',
//       taskTitle: 'Fix authentication bug'
//     }
//   },
//   {
//     id: '3',
//     type: 'JOIN_REQUEST_SENT',
//     description: 'Alex requested to join your project',
//     read: true,
//     createdAt: new Date(Date.now() - 86400000).toISOString(),
//     metadata: {
//       actorId: 'user789',
//       actorName: 'Alex Smith'
//     },
//     joinRequest: {
//       id: 'req123',
//       requester: {
//         id: 'user789',
//         name: 'Alex Smith'
//       }
//     }
//   },
//   {
//     id: '4',
//     type: 'ACHIEVEMENT_UNLOCKED',
//     description: 'You unlocked "Task Master" achievement!',
//     read: false,
//     createdAt: new Date(Date.now() - 172800000).toISOString(),
//     metadata: {
//       achievementName: 'Task Master',
//       achievementDescription: 'Complete 10 tasks in a week'
//     }
//   }
// ];

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Replace this with actual database query
    const notifications = await db.activity.findMany({
      where: { userId: user.id },
      include: {
        project: { select: { id: true, name: true } },
        joinRequest: {
          include: {
            requester: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const Notifications = notifications.slice(offset, offset + limit);
    const total = Notifications.length;
    const unread = Notifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications,
      stats: { total, unread }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, markAsRead } = await request.json();

    // Replace with actual database update
    await db.activity.update({
      where: { 
        id: notificationId,
        userId: user.id 
      },
      data: { read: markAsRead }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'markAllAsRead') {
      // Replace with actual database update
       await db.activity.updateMany({
         where: { 
           userId: user.id,
           read: false
        },
        data: { read: true }
       });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing notification action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
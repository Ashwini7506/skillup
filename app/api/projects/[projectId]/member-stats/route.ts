// app/api/projects/[projectId]/member-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify user has access to this project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        Workspace: {
          members: {
            some: {
              userId: user.id
            }
          }
        }
      },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all tasks for this project with assignee info
    const tasks = await db.task.findMany({
      where: { projectId },
      select: {
        id: true,
        status: true,
        assigneeId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Aggregate stats
    const userStats = new Map();

    for (const task of tasks) {
      if (!task.assigneeId || !task.assignedTo) continue; // skip unassigned tasks

      const userId = task.assigneeId;
      
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId: userId,
          name: task.assignedTo.name,
          email: task.assignedTo.email,
          image: task.assignedTo.image,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0
        });
      }

      const stats = userStats.get(userId);
      stats.totalTasks++;

      switch (task.status) {
        case 'COMPLETED':
          stats.completedTasks++;
          break;
        case 'IN_PROGRESS':
          stats.inProgressTasks++;
          break;
        case 'TODO':
          stats.todoTasks++;
          break;
      }
    }

    // Convert to array and add completion rate
    const memberStats = Array.from(userStats.values()).map(stats => ({
      ...stats,
      completionRate: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
    }));

    return NextResponse.json({ memberStats });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
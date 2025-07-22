// app/api/sprint/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

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

    // Get all files - both those linked to tasks AND those uploaded without tasks
    const files = await db.file.findMany({
      where: {
        OR: [
          // Files linked to tasks in this project
          {
            task: {
              projectId: projectId
            }
          },
          // Files uploaded without tasks (taskId is null)
          // For now, we'll get all files without tasks - you might want to add
          // project association logic later
          {
            taskId: null
          }
        ]
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            assignedTo: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the files for the UI
    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      fileType: file.type, // Add this for your UI
      type: file.type, // Add this for your UI  
      size: null,
      url: file.url,
      createdAt: file.createdAt,
      uploadedAt: file.createdAt, // UI expects this field
      task: {
        id: file.task?.id || '',
        title: file.task?.title || 'No specific task',
        assignedTo: file.task?.assignedTo
      },
      taskTitle: file.task?.title || 'No specific task', // UI expects this
      uploaderName: 'Unknown User' // You might want to add uploader info to File model
    }));

    console.log('uploads route returning:', formattedFiles.length, 'items');
    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

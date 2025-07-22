// app/api/sprint/uploads/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Find the file and verify user has access
    const file = await db.file.findFirst({
      where: {
        id: fileId,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                Workspace: {
                  include: {
                    members: {
                      where: {
                        userId: user.id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify user has access - handle the case where file has no task (uploaded directly)
    let hasAccess = false;
    
    if (file.task?.project?.Workspace) {
      // File is linked to a task in a project - check workspace membership
      hasAccess = (file.task.project.Workspace.members?.length ?? 0) > 0;
    } else {
      // File uploaded without task - allow deletion for now
      // You might want to add additional logic here based on your requirements
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the file from database
    await db.file.delete({
      where: {
        id: fileId
      }
    });

    // Note: UploadThing files are automatically deleted from storage
    // when not referenced in your database (based on your UploadThing settings)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

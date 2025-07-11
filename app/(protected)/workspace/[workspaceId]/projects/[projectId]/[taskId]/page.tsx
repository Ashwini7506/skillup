import { getTaskById } from '@/app/data/task/get-task-by-id';
import { userRequired } from '@/app/data/user/is-user-authenticated';
import { TaskComment } from '@/components/task/task-comment';
import { TaskDetails } from '@/components/task/task-details';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'


interface PageProps {
  params: Promise<{
    taskId: string;
    workspaceId: string;
    projectId: string;
  }>;
}

const TaskIdpage = async ({ params }: PageProps) => {

  const { user } = await userRequired()
  const { taskId, workspaceId, projectId } = await params


  const member = await db.workspaceMember.findFirst({
    where: {
      userId: user?.id,
      workspaceId,
    },
  });

  if (!member || member.accessLevel === 'MEMBER') {
    redirect(`/workspace/${workspaceId}`);
  }


  const { task, comments } = await getTaskById(taskId, workspaceId, projectId)

  if (!task) redirect("/not-found");

  return (<>
    <div className="flex justify-between items-center mb-6 px-2">
      {/* Left aligned: Go Back */}
      <Link href={`/workspace/${workspaceId}/projects/${projectId}`}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg px-4 py-2 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </Link>

      {/* Right aligned: Kanban */}
      <Link href={`/workspace/${workspaceId}/projects/${projectId}/?view=kanban`}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg px-4 py-2 shadow-sm"
        >
          Go To Kanban Board
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
    <div className='flex flex-col lg:flex-row gap-6 md:px-6 pb-6'>

      <div className='flex-1'>
        <TaskDetails task={task as any} />
      </div>

      <div className='w-full lg:w-[400px]'>
        <TaskComment taskId={taskId} comments={comments as any} />
      </div>
    </div>
  </>
  )
}

export default TaskIdpage

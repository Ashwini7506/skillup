'use client';

import { useRouter } from 'next/navigation';
import { CommentProps, ProjectProps } from "@/utils/types";
import { Activity, Task } from "@prisma/client";
import { ProjectHeader } from "./project-header";
import { Card } from "../ui/card";
import { TaskDistributionChart } from "./task-distribution-chart";
import { ActivityFeed } from "./activity-feed";
import { CommentList } from "./comment-list";
import { CircleProgress } from "./circle-progress";
import { InviteMemberForm } from "@/components/forms/invite-member-form";
import { Button } from "../ui/button";
import { toast } from 'sonner';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface ProjectDashboardProps {
  project: ProjectProps;
  tasks: {
    completed: number;
    inProgress: number;
    overdue: number;
    total: number;
    items: Task[];
  };
  activities: Activity[];
  totalWorkspaceMembers: number;
  comments: CommentProps[];
  accessLevel: "OWNER" | "MEMBER" | "VIEWER";
}

export const ProjectDashboard = ({
  project,
  tasks,
  activities,
  totalWorkspaceMembers,
  comments,
  accessLevel,
}: ProjectDashboardProps) => {
  const { user } = useKindeBrowserClient();
  const router = useRouter();

  const handleRemoveMember = async (workspaceMemberId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${project.id}/members/${workspaceMemberId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      toast.success('Removed from project');

      // If current user removed themself, redirect them out of the project
      if (data.redirectWorkspaceId) {
        router.push(`/workspace/${data.redirectWorkspaceId}`);
      } else {
        router.refresh(); // for OWNER removing someone else
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error removing member');
    }
  };

  return (
    <div className="flex flex-col gap-6 px-2 md:px-4 2xl:px-6 py-0">
      <ProjectHeader project={project as unknown as ProjectProps} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CircleProgress
            title="Task Completed"
            value={(tasks.completed / tasks.total) * 100}
            subTitle={`${tasks.completed} / ${tasks.total} Completed`}
            variant="success"
          />
        </Card>
        <Card className="p-4">
          <CircleProgress
            title="In Progress"
            value={(tasks.inProgress / tasks.total) * 100}
            subTitle={`${tasks.inProgress} Ongoing`}
            variant="inProgress"
          />
        </Card>
        <Card className="p-4">
          <CircleProgress
            title="Overdue"
            value={(tasks.overdue / tasks.total) * 100}
            subTitle={`${tasks.overdue} Overdue`}
            variant="warning"
          />
        </Card>
        <Card className="p-4">
          <CircleProgress
            title="Team members"
            value={project.members?.length || 0}
            subTitle={`${project.members?.length || 0} Members`}
            variant="default"
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Team Members</h3>
          {accessLevel === "OWNER" && (
            <InviteMemberForm projectId={project.id} />
          )}
        </div>
        <ul className="text-sm space-y-3">
          {project?.members?.map((member) => {
            const isSelf = member.user.id === user?.id;

            return (
              <li key={member.id} className="flex justify-between items-center text-gray-700">
                <span>{member.user.name}</span>

                {accessLevel === "OWNER" && !isSelf && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                )}

                {accessLevel === "MEMBER" && isSelf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Leave Project
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaskDistributionChart tasks={tasks} />

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Activities</h3>
          <ActivityFeed activities={activities?.slice(0, 5) as any} />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Comments</h3>
          <CommentList comments={comments?.slice(0, 5) as any} />
        </Card>
      </div>
    </div>
  );
};

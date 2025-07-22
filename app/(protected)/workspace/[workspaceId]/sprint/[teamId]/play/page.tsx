import { getCurrentUserServer } from "@/lib/get-current-user";
import { db } from "@/lib/db";
import { getCurrentTeamSegment } from "@/lib/sprint/story-logic";
import { StoryEngineWrapper } from "@/components/sprint/StoryEngineWrapper";
import Link from "next/link";

interface Props {
  params: Promise<{ workspaceId: string; teamId: string }>;
}

export default async function SprintPlayPage({ params }: Props) {
  const user = await getCurrentUserServer();
  const { workspaceId, teamId } = await params;

  const team = await db.sprintTeam.findUnique({
    where: { id: teamId },
    include: { cohort: true },
  });
  if (!team) {
    return <div className="p-8">Team not found.</div>;
  }
  if (!team.members.includes(user.id)) {
    return (
      <div className="p-8">
        You are not a member of this team.
        <div className="mt-4">
          <Link
            href={`/workspace/${workspaceId}/sprint`}
            className="underline"
          >
            Back to Sprint
          </Link>
        </div>
      </div>
    );
  }

  const started = new Date() >= team.cohort.startDate;
  if (!started) {
    return (
      <div className="p-8">
        Sprint hasn’t started yet.
        <div className="mt-4">
          <Link
            href={`/workspace/${workspaceId}/sprint`}
            className="underline"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  const initialSegment = await getCurrentTeamSegment(teamId);

  return (
    <div className="p-8">
      <div className="mb-6 flex gap-4">
        <Link
          href={`/workspace/${workspaceId}/sprint`}
          className="text-sm underline"
        >
          ← Sprint Home
        </Link>
        {team.projectId && (
          <Link
            href={`/workspace/${workspaceId}/projects/${team.projectId}`}
            className="text-sm underline"
          >
            Team Workspace
          </Link>
        )}
      </div>
      <StoryEngineWrapper teamId={teamId} initialSegment={initialSegment} />
    </div>
  );
}

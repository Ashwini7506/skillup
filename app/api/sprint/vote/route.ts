import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserServer } from "@/lib/get-current-user";

/**
 * GET -> list ALL teams from ALL active cohorts + vote counts (Global voting)
 * POST { teamId, score }
 */
export async function GET(req: Request) {
  const user = await getCurrentUserServer();
  
  // ✅ Get ALL teams from ALL active cohorts (cross-workspace voting)
  const teams = await db.sprintTeam.findMany({
    where: {
      cohort: {
        activated: true, // Only from active cohorts
      },
    },
    include: {
      votes: true,
      cohort: {
        select: {
          name: true,
          workspaceId: true,
        },
      },
    },
  });

  const result = teams.map((team) => {
    const totalVotes = team.votes.reduce((sum, v) => sum + v.score, 0);
    const userVote = team.votes.find((v) => v.voterId === user?.id)?.score ?? null;

    return {
      id: team.id,
      name: team.name,
      cohortName: team.cohort.name,
      workspaceId: team.cohort.workspaceId,
      votes: totalVotes,
      userVote,
    };
  });

  // ✅ Sort by total votes (highest first)
  result.sort((a, b) => b.votes - a.votes);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUserServer();
  const { teamId, score } = await req.json();

  if (!teamId) {
    return NextResponse.json({ error: "teamId required" }, { status: 400 });
  }

  // ✅ Check if the user has already voted on *any* team
  const existingVote = await db.sprintVote.findFirst({
    where: {
      voterId: user.id,
    },
  });

  if (existingVote && existingVote.teamId !== teamId) {
    return NextResponse.json(
      { error: "You've already voted for another team." },
      { status: 403 }
    );
  }

  // ✅ Only allow creating or updating for the same team
  const vote = await db.sprintVote.upsert({
    where: {
      voterId_teamId: {
        voterId: user.id,
        teamId: teamId,
      },
    },
    update: { score },
    create: { voterId: user.id, teamId, score },
  });

  return NextResponse.json(vote);
}

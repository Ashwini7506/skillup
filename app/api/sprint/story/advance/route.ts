import { NextResponse } from "next/server";
import { advanceTeamSegment } from "@/lib/sprint/story-logic";

export async function POST(req: Request) {
  const { teamId, segmentId, choiceId } = await req.json();
  if (!teamId || !segmentId) {
    return NextResponse.json({ error: "teamId & segmentId required" }, { status: 400 });
  }
  const { nextSegment, unlockedTasks } = await advanceTeamSegment(teamId, segmentId, choiceId);
  return NextResponse.json({ nextSegment, unlockedTasks });
}

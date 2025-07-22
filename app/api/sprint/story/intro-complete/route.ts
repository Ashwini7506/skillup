import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { teamId } = await req.json();
  if (!teamId) {
    return NextResponse.json({ error: "teamId required" }, { status: 400 });
  }

  const baseState = {
    started: true,
    seenIntro: true,
    currentChapter: null,
    currentSegment: null,
    history: [],
  };

  const existing = await db.sprintTeamStoryState.findUnique({ where: { teamId } });

  const result = existing
    ? await db.sprintTeamStoryState.update({
        where: { teamId },
        data: { state: baseState },
      })
    : await db.sprintTeamStoryState.create({
        data: { teamId, state: baseState },
      });

  return NextResponse.json(result);
}

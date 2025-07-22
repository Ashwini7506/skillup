import { getCurrentTeamSegment } from "@/lib/sprint/story-logic";
import { NextResponse } from "next/server";
// import { getCurrentTeamSegment } from "@/lib/sprint/story-logic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) {
    return NextResponse.json({ error: "teamId required" }, { status: 400 });
  }
  const segment = await getCurrentTeamSegment(teamId);
  return NextResponse.json({ segment });
}

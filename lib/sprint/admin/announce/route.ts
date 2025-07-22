import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  if (!pusherServer) {
    return NextResponse.json({ error: "Pusher not configured" }, { status: 500 });
  }
  const { message } = await req.json();
  await pusherServer.trigger("sprint-updates", "announcement", { message });
  return NextResponse.json({ ok: true });
}

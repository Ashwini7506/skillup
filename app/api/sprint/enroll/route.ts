import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserServer } from "@/lib/get-current-user";

export async function POST(req: Request) {
  const user = await getCurrentUserServer();
  const { cohortId, intendedRole } = await req.json();

  const enrollment = await db.sprintEnrollment.upsert({
    where: { cohortId_userId: { cohortId, userId: user.id } },
    update: { intendedRole },
    create: { cohortId, userId: user.id, intendedRole },
  });

  return NextResponse.json(enrollment);
}

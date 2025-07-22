import { NextRequest, NextResponse } from "next/server";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { Difficulty } from "@prisma/client";
import { SKILLUP_TEAM_USER_ID } from "@/lib/skillup-config";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await userRequired();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const rawRole = searchParams.get("role");
    const level = searchParams.get("level");
    const filter = searchParams.get("filter") || "team";

    // Normalize the role: "web-development" → "Web Development"
    const role = rawRole
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    if (!workspaceId || !role || !level) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const difficulty = level.toUpperCase() as Difficulty;

    // 🧠 DEBUG LOGS
    // console.log("➡️ Discover Request:");
    // console.log("• Workspace:", workspaceId);
    // console.log("• Role:", role);
    // console.log("• Level:", level, "| Difficulty enum:", difficulty);
    // console.log("• Filter:", filter);
    // console.log("• SKILLUP_TEAM_USER_ID:", SKILLUP_TEAM_USER_ID);

    const whereClause: any = {
      visibility: "PUBLIC",
      role: role,
      difficulty: difficulty,
    };

    if (filter === "team") {
      whereClause.createdById = {
        in: SKILLUP_TEAM_USER_ID,
      };
    } else if (filter === "community") {
      whereClause.NOT = {
        createdById: {
          in: SKILLUP_TEAM_USER_ID,
        },
      };
    }

    // console.log("🧾 Final whereClause:", JSON.stringify(whereClause, null, 2));

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await db.project.count({
      where: whereClause,
    });

    console.log(`${projects.length} project(s) found`);

    return NextResponse.json({
      projects,
      total,
    });
  } catch (error) {
    console.error("Error fetching discover projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
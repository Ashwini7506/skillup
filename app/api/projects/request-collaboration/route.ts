import { NextRequest, NextResponse } from "next/server";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { db } from "@/lib/db";
// import { prisma } from "@/app/data/database";

export async function POST(request: NextRequest) {
  try {
    const user = await userRequired();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, userId, requesterId } = await request.json();

    if (!projectId || !userId || !requesterId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the project exists and is public
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.visibility !== "PUBLIC") {
      return NextResponse.json(
        { error: "Project is not public" },
        { status: 403 }
      );
    }

    // Check if join request already exists
    const existingRequest = await db.joinRequest.findUnique({
      where: {
        requesterId_userId_projectId: {
          requesterId: requesterId,
          userId: userId,
          projectId: projectId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Collaboration request already exists" },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await db.joinRequest.create({
      data: {
        projectId: projectId,
        userId: userId,
        requesterId: requesterId,
        status: "PENDING",
      },
    });

    // Create activity for the project owner
    await db.activity.create({
      data: {
        type: "JOIN_REQUEST_SENT",
        description: `${user.user?.given_name || user.user?.email} requested to collaborate on "${project.name}"`,
        userId: userId,
        projectId: projectId,
        joinRequestId: joinRequest.id,
        metadata: {
          requesterName: user.user?.given_name || user.user?.email,
          projectName: project.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collaboration request sent successfully",
    });
  } catch (error) {
    console.error("Error requesting collaboration:", error);
    return NextResponse.json(
      { error: "Failed to send collaboration request" },
      { status: 500 }
    );
  }
}
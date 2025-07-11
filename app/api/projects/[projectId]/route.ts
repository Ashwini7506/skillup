import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRequired } from "@/app/data/user/is-user-authenticated";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { visibility, workspaceId } = body;

    // Validate required fields
    if (!projectId || !visibility || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields (projectId, visibility, or workspaceId)" },
        { status: 400 }
      );
    }

    // Validate visibility value
    const validVisibilities = ["PERSONAL", "PUBLIC", "TEAM"];
    if (!validVisibilities.includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility value. Must be PERSONAL, PUBLIC, or TEAM" },
        { status: 400 }
      );
    }

    // Check user authentication
    const { user } = await userRequired();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the project and verify ownership/access
    const project = await db.project.findUnique({
      where: { 
        id: projectId,
        workspaceId: workspaceId 
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to the specified workspace" },
        { status: 404 }
      );
    }

    // Update the project visibility
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: { visibility: visibility as "PERSONAL" | "PUBLIC" },
    });

    return NextResponse.json({ 
      success: true, 
      project: updatedProject 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating project visibility:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to update visibility" },
      { status: 500 }
    );
  }
}

// Handle DELETE requests for project deletion
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');

    if (!projectId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields (projectId or workspaceId)" },
        { status: 400 }
      );
    }

    // Check user authentication
    const { user } = await userRequired();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the project and verify ownership/access
    const project = await db.project.findUnique({
      where: { 
        id: projectId,
        workspaceId: workspaceId 
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to the specified workspace" },
        { status: 404 }
      );
    }

    // Delete the project
    await db.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ 
      success: true,
      message: "Project deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to delete project" },
      { status: 500 }
    );
  }
}

// Handle GET request for fetching project details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');

    if (!projectId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields (projectId or workspaceId)" },
        { status: 400 }
      );
    }

    // Check user authentication
    const { user } = await userRequired();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the project and verify ownership/access
    const project = await db.project.findUnique({
      where: { 
        id: projectId,
        workspaceId: workspaceId 
      },
      include: {
        // Include related data if needed
        Workspace: {
          select: {
            id: true,
            name: true,
          }
        },
        // Add other relations as needed
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to the specified workspace" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      project: project 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to fetch project" },
      { status: 500 }
    );
  }
}

import { deleteTaskById } from "@/app/data/task/delete-task-by-id";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const projectId = searchParams.get("projectId");

  if (!workspaceId || !projectId) {
    return NextResponse.json(
      { error: "Missing workspaceId or projectId" },
      { status: 400 }
    );
  }

  try {
    await deleteTaskById(params.taskId, workspaceId, projectId);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("[TASK_DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { deleteWorkspaceById } from "@/app/data/workspace/delete-workspace-by-id";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string } >}
) {
  try {
    const { workspaceId } = await params;
    await deleteWorkspaceById(workspaceId);
    return new NextResponse(null, { status: 204 }); // no body with 204
  } catch (err) {
    console.error("[WORKSPACE_DELETE]", err);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}

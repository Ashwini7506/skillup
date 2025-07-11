"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteTaskProps {
  taskId: string;
  projectId: string;
  workspaceId: string;
  refreshPath?: string;
  // accessLevel: "OWNER" | "MEMBER" | "VIEWER";
}

export function DeleteTask({
  taskId,
  projectId,
  workspaceId,
  refreshPath,
  // accessLevel,
}: DeleteTaskProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {

      try {
      const res = await fetch(
        `/api/task/${taskId}?workspaceId=${workspaceId}&projectId=${projectId}`,
        { method: "DELETE" }
      );

      if (!res.ok ) throw new Error("Failed to delete task");
      toast.success("Task deleted");
      refreshPath ? router.push(refreshPath) : router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    }

    

    
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600 w-full">
          <Trash2 className="h-4 w-4" />
          Delete
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Delete this project?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            This action is permanent. You won't be able to recover the project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-full px-4 py-1 text-sm hover:bg-gray-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isPending}
            onClick={() => startTransition(handleDelete)}
          >
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full px-4 py-1 text-sm hover:bg-red-600 transition-colors duration-200"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
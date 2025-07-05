"use client"

import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Comment } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CommentList } from "../project/comment-list";
import { postComments } from "@/app/actions/project";
import { toast } from "sonner";

type CommentWithUser = Comment & {
    user: User;
}

interface TaskCommentsProps {
    taskId: string;
    comments: CommentWithUser[];
}

export const TaskComment = ({ taskId, comments }: TaskCommentsProps) => {
    // console.log("Task Comments:", comments);
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const router = useRouter();

    const [newComment, setNewComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {

        try {
            setIsSubmitting(true)

            await postComments(
                workspaceId as string, projectId, newComment
            )

            toast.success("Comment posted successfully")
            setNewComments("")
            router.refresh()
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false)
        }

    }

    return <Card>
        <CardHeader>
            <CardTitle>Comment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
            <div className="space-y-4">
                <Textarea placeholder="Add a comment..." className="min-h-[100px]" value={newComment} onChange={(e) => setNewComments(e.target.value)}>
                </Textarea>

                <Button
                    disabled={isSubmitting || !newComment.trim()}
                    onClick={handleSubmit}
                    className="bg-black text-white hover:bg-black/80
             dark:bg-white dark:text-black dark:hover:bg-white/80"
                >
                    Post Comment
                </Button>

                <CommentList comments={comments as any} />

            </div>
        </CardContent>
    </Card>
}
import { formatDistanceToNow } from "date-fns";
import { ProfileAvatar } from "../profile-avatar";
import { Comment } from "@prisma/client";

export interface CommentProps extends Comment {
  user: { id: string; name: string; image: string };
}

export const CommentList = ({
  comments,
}: {
  comments: CommentProps[];
}) => {
  if (!comments?.length) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-4">
          <ProfileAvatar
            url={comment.user.image || undefined}
            name={comment.user.name}
            numOfChars={2}
            size="lg"
            className="bg-blue-600"
          />

          {/* flex-col stacks lines; break-words lets long text wrap */}
          <div className="flex flex-col flex-1 break-words">
            <div className="flex items-center gap-2">
              <p>{comment.user.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* comment body */}
            <p className="text-sm text-muted-foreground mt-1">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

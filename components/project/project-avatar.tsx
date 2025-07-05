import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

export const ProjectAvatar = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  return (
    <Avatar
      className={cn("size-9 2xl:size-10 rounded-full border-2 border-background shadow", className)}
    >
      <AvatarFallback className="bg-blue-600 text-white text-sm 2xl:text-base font-semibold rounded-full">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"

export const WorkspaceAvatar = ({ name }: { name: string }) => {
  return (
    <Avatar className="w-8 h-8">
      <AvatarFallback className="flex items-center justify-center w-full h-full bg-blue-600 text-white font-bold rounded-full text-sm">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

"use client"

import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { WorkspaceProps } from "@/utils/types"
import { useEffect, useState } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { WorkspaceAvatar } from "../workspace/workspace-avatar"
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { DeleteWorkspace } from "../workspace/delete-workspace"

export const WorkspaceSelector = ({ workspaces }: { workspaces: WorkspaceProps[] }) => {

    const router = useRouter()
    const workspaceId = useWorkspaceId();
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceProps | undefined>(undefined)

    const onWorkspaceSelect = (id: string) => {
        setSelectedWorkspace(
            workspaces.find((workspace) => workspace.workspaceId === id)
        )
        router.push(`/workspace/${id}`);
    }

    useEffect(() => {
        if (workspaceId && workspaces) {
            setSelectedWorkspace(workspaces.find((workspace) => workspace.workspaceId === workspaceId))
        }
    }, [workspaceId, workspaces])


    return <>
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state-open]:text-sidebar-accent-foreground">
                            <WorkspaceAvatar name={selectedWorkspace?.workspace.name as string || "W"} />

                            <div className="font-semibold">
                                {selectedWorkspace?.workspace.name}
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                        {workspaces?.map((workspace) => (
                            <DropdownMenuItem key={workspace.id} onSelect={() => onWorkspaceSelect(workspace?.workspaceId!)}>
                                <div className="flex flex-row items-center gap-2 w-full">
                                    <WorkspaceAvatar name={workspace?.workspace.name as string} />
                                    <p className="flex-1">{workspace?.workspace.name}</p>
                                    
                                    {workspace.workspaceId === workspaceId ? (
                                        <Check className="ml-auto" />
                                    ) : (
                                        <div className="py-1" onClick={(e) => e.stopPropagation()}>
                                            <DeleteWorkspace workspaceId={workspace.workspaceId} />
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    </>
}
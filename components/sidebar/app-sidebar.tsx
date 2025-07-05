import { ProjectProps, WorkspaceMembersProps } from "@/utils/types";
import { AppSidebarDataProps } from "./app-sidebar-container";
import { User } from "@prisma/client";
import { Sidebar, SidebarContent, SidebarGroupLabel, SidebarHeader } from "../ui/sidebar";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { WorkspaceSelector } from "./workspace-selector";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-project-list";

export const AppSidebar = ({
    data,
    projects,
    workspaceMembers,
    user,
}: {
    data: AppSidebarDataProps;
    projects: ProjectProps[];
    workspaceMembers: WorkspaceMembersProps[];
    user: User;
}) => {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="bg-background">
                <div className="flex items-center gap-x-2">
                    <Avatar>
                        <AvatarImage src="/skillup.png" />
                    </Avatar>
                    <SidebarGroupLabel>
                        <span className="text-xl font-bold">SkillUp</span>
                    </SidebarGroupLabel>
                </div>

                <div className="flex justify-between mb-4 mt-4">
                    <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
                        Growthspace
                    </SidebarGroupLabel>
                    <Button asChild size = {"icon"} className="size-5">
                        <Link href = "/create-workspace">
                        <Plus/>
                        </Link>
                    </Button>
                </div>

                <WorkspaceSelector workspaces = {data.workspace}/>
            </SidebarHeader>

            <SidebarContent>
                <NavMain/>
                <NavProjects
                projects ={projects} workspaceMembers={workspaceMembers}
                />
            </SidebarContent>
        </Sidebar>
    );
};

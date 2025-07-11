import { ProjectProps, WorkspaceMembersProps } from "@/utils/types";
import { AppSidebarDataProps } from "./app-sidebar-container";
import { User } from "@prisma/client";
import { Sidebar, SidebarContent, SidebarGroupLabel, SidebarHeader } from "../ui/sidebar";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus, Sparkles } from "lucide-react";
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
        <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="bg-background border-b border-border">
                <div className="flex items-center gap-x-3 p-2">
                    <Avatar>
                        <AvatarImage src="/skillup.png" className="object-cover" />
                    </Avatar>
                    <SidebarGroupLabel>
                        <span className="text-xl font-bold text-foreground">
                            SkillUp
                        </span>
                    </SidebarGroupLabel>
                </div>

                <div className="flex justify-between items-center mb-4 mt-4 px-2">
                    <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
                        Growthspace
                    </SidebarGroupLabel>
                    <Button 
                        asChild 
                        size="icon" 
                        className="size-8 hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    >
                        <Link href="/create-workspace">
                            <Plus className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                <div className="px-2 pb-2">
                    <WorkspaceSelector workspaces={data.workspace} />
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-background">
                <NavMain />
                <NavProjects
                    projects={projects} 
                    workspaceMembers={workspaceMembers}
                />
            </SidebarContent>
        </Sidebar>
    );
};
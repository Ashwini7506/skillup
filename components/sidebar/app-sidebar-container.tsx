import { getWorkspaceProjectByWorkspaceId } from "@/app/data/project/get-workspace-projects";
import { getUserById } from "@/app/data/user/get-user";
import { $Enums, User } from "@prisma/client"
import { AppSidebar } from "./app-sidebar";
import { ProjectProps, WorkspaceMembersProps } from "@/utils/types";



export interface AppSidebarDataProps extends User {
    workspace: {
        id: string;
        name : string;
        createdAt: Date;
        userId: string;
        workspaceId: string;
        accessLevel : $Enums.AccessLevel;
        workspace: {
            name: string
        }
    }[];
}

export const AppSidebarContainer = async ({ data, workspaceId }: { data: AppSidebarDataProps, workspaceId: string }) => {

    const { projects, workspaceMembers } = await getWorkspaceProjectByWorkspaceId(workspaceId);
    const user = await getUserById();

    return <AppSidebar

        data={data}
        projects={projects as unknown as ProjectProps[]}
        workspaceMembers={workspaceMembers as unknown as WorkspaceMembersProps[]}
        user={user as User}
    />

}
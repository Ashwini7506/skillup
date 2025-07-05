"use server"

import { ProjectDataType } from "@/components/project/create-project-form"
import { userRequired } from "../data/user/is-user-authenticated"
import { db } from "@/lib/db"
import { projectSchema } from "@/lib/schema"

export const createNewProject = async (data: ProjectDataType) => {

    const { user } = await userRequired()

    const workspace = await db.workspace.findUnique({
        where: { id: data?.workspaceId },
        include: {
            projects: {
                select: { id: true }
            },
        }
    })

    const validatedata = projectSchema.parse(data)

    const workspaceMemberMembers = await db.workspaceMember.findMany({
        where:{
            
                workspaceId:data.workspaceId,
            }
        })
    


    const isUserMember = workspaceMemberMembers.some((member) => member.userId === user?.id)

    if(!isUserMember){
        throw new Error("Unauthorized to create project in this workspace");
    }

    if(validatedata.memberAccess?.length===0){
        validatedata.memberAccess=[user?.id as string];
    }else if (!validatedata.memberAccess?.includes(user?.id as string)){
        validatedata?.memberAccess?.push(user?.id as string)
    }

   await db.project.create({
        data: {
            name: validatedata.name,
            description: validatedata.description || "",
            workspaceId:validatedata.workspaceId,
            projectAccess: {
                create: validatedata.memberAccess?.map((memberId) => ({
                    workspaceMemberId: workspaceMemberMembers.find((member) => member.userId === memberId)?.id!,
                    hasAccess: true,
                }))
            },
            activities:{
                create:{
                    type:"PROJECT_CREATED",
                    description:`created project ${validatedata.name}`,
                    userId: user?.id as string
                }
            }
        }
    })

}

export const postComments = async(workspaceId:string,
    projectId:string,
    content:string
) => {

    const {user} = await userRequired()

    const isUserMember = await db.workspaceMember.findUnique({
        where:{
            userId_workspaceId:{
                userId:user?.id as string,
                workspaceId,
            }
        }
    })

    if(!isUserMember){
        throw new Error("You donot have access to this project");
    }

    const comment = await db.comment.create({
        data:{
            content,
            projectId,
            userId:user?.id as string,
        }
    })

    return comment
}
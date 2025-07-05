import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";


export const getTaskById = async(taskId : string,
    workspaceId: string,
    projectId:string
)=>{
    const {user} = await userRequired()
    
    const isUserMember = await db.workspaceMember.findUnique({
        where:{
            userId_workspaceId:{
                userId:user?.id as string,
                workspaceId,
            }
        }
    })

    if(!isUserMember) throw new Error("you are not the member of this growthspace");

    const projectAccess = await db.projectAccess.findUnique({
        where:{
            workspaceMemberId_projectId:{
                workspaceMemberId:isUserMember.id,
                projectId,
            }
        }
    })

    if(!projectAccess){
        throw new Error("you are not allowed to view this Project");
    }

    const [task, comments] = await Promise.all([
        db.task.findUnique({
            where:{id:taskId},
            include:{
                assignedTo:{select:{id:true, name:true, image:true}},
                attachments:{select:{id:true, name:true, url:true}},
                project:{
                    include:{
                        projectAccess:{
                            include:{
                                workspaceMember:{
                                    include:{
                                        user:{select: {id:true, name:true, image:true}},
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }),
        db.comment.findMany({
            where:{ projectId },
            include:{ user:{select: {id:true, name:true, image:true}}},
            orderBy:{createdAt:"asc"}
        })
    ])

    const project ={
        ...task?.project,
        members:task?.project.projectAccess.map((access)=> access.workspaceMember)
    }

    return {
        task:{...task, project},
        comments
    }
}
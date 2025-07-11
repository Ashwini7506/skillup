"use server"

import { TaskFormValues } from "@/components/task/create-task-dialog"
import { userRequired } from "../data/user/is-user-authenticated"
import { db } from "@/lib/db"
import { taskFormSchema } from "@/lib/schema"
import { _success } from "zod/v4/core"
import { TaskStatus } from "@prisma/client"

export const createNewTask = async (data: TaskFormValues, projectId: string, workspaceId:string) => {

    const { user } = await userRequired()

    const validateData = taskFormSchema.parse(data)

    const isUserMember = await db.workspaceMember.findUnique({
        where:{
            userId_workspaceId:{
                userId:user?.id as string,
                workspaceId,
            }
            }
        })

    if(!isUserMember){
        throw new Error("Unauthorized to create project in this workspace");
    }


const tasks = await db.task.findMany({
    where:{projectId},
})

const lastTask = tasks?.filter(task=>task.status === data.status).sort((a,b)=>b.position - a.position)[0]

const position = lastTask? lastTask.position+1000:1000;
   const task = await db.task.create({
        data: {
            title: validateData.title,
            description: validateData.description || "",
            startDate: new Date(validateData.startDate),
            dueDate: new Date(validateData.dueDate),
            projectId,
            workspaceId,
            assigneeId: validateData.assigneeId,
            status:validateData.status,
            priority: validateData.priority,
            position,
            },
        include : {
                project:true,
            }
        })
if(validateData.attachments && validateData?.attachments?.length>0){
    await db.file.createMany({
        data:validateData.attachments.map((file)=>({
            ...file,
            taskId:task.id
        }))
    })
}
        await db.activity.create({
            data:{
                type:"TASK_CREATED",
                description:`created task "${validateData.title}"`,
                projectId,
                userId:user?.id as string,
            }
        })
        return {success:true}
    }

export const updateTaskPosition = async(taskId:string, newPosition:number, status: TaskStatus) => {
    await userRequired();

    return await db.task.update({
        where :{id:taskId},
        data: {position:newPosition, status}
    })
} 


export const updateTask = async (taskId:string, data: TaskFormValues, projectId: string, workspaceId:string) => {

    const { user } = await userRequired()

    const validateData = taskFormSchema.parse(data)

    const isUserMember = await db.workspaceMember.findUnique({
        where:{
            userId_workspaceId:{
                userId:user?.id as string,
                workspaceId,
            }
            }
        })

    if(!isUserMember){
        throw new Error("Unauthorized to create project in this workspace");
    }

    const projectAccess = await db.projectAccess.findUnique({
        where:{
            workspaceMemberId_projectId:{
                workspaceMemberId:isUserMember.id,
                projectId
            }
        }
    })

    if (!projectAccess){
        throw new Error ("You do not have access to this project")
    }

   const task = await db.task.update({
    where:{id:taskId},
        data: {
            title: validateData.title,
            description: validateData.description || "",
            startDate: new Date(validateData.startDate),
            dueDate: new Date(validateData.dueDate),
            assigneeId: validateData.assigneeId,
            status:validateData.status,
            priority: validateData.priority,
            },
        })

        await db.activity.create({
            data:{
                type:"TASK_CREATED",
                description:`Updated task "${validateData.title}"`,
                projectId,
                userId:user?.id as string,
            }
        })
        return {success:true}
    }
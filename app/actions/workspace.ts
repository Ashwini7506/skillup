"use server"

import { CreateWorkspaceDataType } from "@/components/workspace/create-workspace-form"
import { workspaceSchema } from "@/lib/schema"
import { userRequired } from "../data/user/is-user-authenticated"
import { db } from "@/lib/db"
import { generateInviteCode } from "@/utils/get-invite-code"

export const createNewWorkspace = async(data : CreateWorkspaceDataType) => {
    try{
        const {user } = await userRequired()

        const validateData = workspaceSchema.parse(data)

        const res = await db.workspace.create({
            data:{
                name: validateData.name,
                description : validateData.description,
                ownerId: user?.id,
                inviteCode:generateInviteCode(),
                members : {
                    create :{
                        userId: user?.id as string,
                        accessLevel: "OWNER",
                    }
                }
            }
        })
        return {data:res};
    }catch(error){
        console.log(error)
        return {
            status : 500,
            message : "An error occured while creating growthspace"
        }
    }
}
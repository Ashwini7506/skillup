"use server"

import { UserDataType } from "@/components/onboarding-form"
import { userRequired } from "../data/user/is-user-authenticated"
import { userSchema } from "@/lib/schema"
import { db } from "@/lib/db"
// import { tr } from "date-fns/locale"
import { redirect } from "next/navigation"

export const createUser = async (data: UserDataType)=> {
    const {user} = await userRequired()

    const validatedData = userSchema.parse(data)

    const userData = await db.user.create({
        data:{
            id: user?.id as string,
            email : user?.email as string,
            name : validatedData.name,
            about: validatedData.about,
            job : validatedData.job,
            role : validatedData.role,
            onboardingCompleted : true,
            image: user?.picture || "",
            subscription: {
                create :{
                    plan: "FREE",
                    status: "ACTIVE",
                    currentPeriodEnd : new Date(),
                    cancelAtPeriodEnd : false,
                }
            }
        },

        select:{
            id : true,
            name:true,
            email:true,
            workspace:true,

        }
    })

    // TODO : send user welcome email

    if(userData.workspace.length ===0){
        redirect("/create-workspace")
    }

    redirect("/workspace")

}
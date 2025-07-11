import { db } from "@/lib/db"
import { userRequired } from "./is-user-authenticated"
import { User } from "@prisma/client"

export const getUserById = async()=> {
    try{
        const {user} = await userRequired()

        const data = await db.user.findUnique({
            where : {id: user?.id}
        })
        return data
    }
    catch(error){
        console.log(error)
        return{
            success : false,
            error : true,
            message : "Failed to get User",
            status :500,
        }
    };
    
}
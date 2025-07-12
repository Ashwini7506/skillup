import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace'
import Tracker from '@/components/Tracker'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async() => {
    const{data} = await getUserWorkspaces()

    // if(!data) return null
    if (data?.onboardingCompleted && data?.workspace?.length === 0){
        redirect("/create-workspace");
    }else if(!data?.onboardingCompleted){
        redirect("/onboarding")
    }else{
        redirect(`/workspace/${data?.workspace[0].workspaceId}`)
    }
}
<Tracker />
export default page

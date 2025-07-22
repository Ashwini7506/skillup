import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace'
import Tracker from '@/components/Tracker'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
    const { data } = await getUserWorkspaces()

    // Handle case where data is not available
    // if (!data) {
    //     redirect("/onboarding")
    //     return null
    // }

    // If onboarding not completed, go to onboarding
    
    // If onboarding completed but no workspaces, create one
    if (data?.onboardingCompleted && data.workspace?.length === 0) {
        redirect("/create-workspace")
        return null
    }
    if (!data?.onboardingCompleted) {
        redirect("/onboarding")
        return null
    }

    // If exactly one workspace exists, show make-a-wish page
    if (data?.workspace?.length === 1) {
        redirect("/make-a-wish")
        return null
    }

    // If multiple workspaces, go to the first one
    if (data.workspace && data.workspace.length > 1) {
        redirect(`/workspace/${data.workspace[0].workspaceId}`)
        return null
    }

    // Fallback - render the tracker component
    return <Tracker />
}

export default page

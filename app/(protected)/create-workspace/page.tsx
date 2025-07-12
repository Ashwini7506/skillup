import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace'
import Tracker from '@/components/Tracker'
import { CreateWorkspaceform } from '@/components/workspace/create-workspace-form'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async() => {
  const {data} = await getUserWorkspaces()

  if(!data?.onboardingCompleted) redirect("/onboarding")
  return (
    <div>
      <Tracker />
      <CreateWorkspaceform/>
    </div>
  )
}

export default page

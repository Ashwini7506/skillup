import { userRequired } from '@/app/data/user/is-user-authenticated'
import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace'
import { Onboardingform } from '@/components/onboarding-form'
import Tracker from '@/components/Tracker'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async() => {
  const {data} = await getUserWorkspaces()
const {user} = await userRequired()
  if(data?.onboardingCompleted && data?.workspace.length > 0){
    redirect("/workspace")
  }else if(data?.onboardingCompleted){
    redirect("/create-workspace")
  }

  const name = `${user?.given_name || ""} ${user?.family_name ||""}`
  return (
    <div className=''>
      <Onboardingform
      name = {name} email = {user?.email as string} image = {user?.picture || ""}
      />
      <Tracker />
    </div>
  )
}

export default page

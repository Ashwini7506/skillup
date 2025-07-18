import { ProjectTableContainer } from '@/components/project/project-table-container';
import { ProjectDashboard } from '@/components/project/project-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentProps, ProjectProps, ProjectTaskProps } from '@/utils/types';
import Link from 'next/link';
import React from 'react'
import { Projectkanban } from '@/components/project/project-kanban';
import { getProjectDetails } from '@/app/data/project/get-project-details';
import Tracker from '@/components/Tracker';

interface ProjectPageProps{
  params : Promise<{workspaceId : string; projectId:string}>;
  searchParams : Promise<{[key:string]:string | string[]|undefined}>
}
const ProjectPage = async(props:ProjectPageProps) => {
  const { workspaceId,projectId } = await props.params;

  const searchParams = await props.searchParams;
  

  const {project, tasks, comments,activities,totalWorkspaceMembers,accessLevel}  = await getProjectDetails(workspaceId, projectId)
  
  return (
    <div className='flex flex-col gap-6 pb-3 px-3'>
      <Tracker />
      <Tabs defaultValue = {(searchParams.view as string) || "dashboard"}
      className = "w-full">
        <TabsList className='mb-4'>
          <Link href="?view = dashboard">
          <TabsTrigger
          value = "dashboard" className='px-1.5 md:px-3'>Dashboard</TabsTrigger>
          </Link>
          <Link href="?view = table">
          <TabsTrigger
          value = "table" className='px-1.5 md:px-3'>Table</TabsTrigger>
          </Link>
          <Link href="?view = kanban">
          <TabsTrigger
          value = "kanban" className='px-1.5 md:px-3'>Kanban</TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value='dashboard'>
        <ProjectDashboard
        
        project ={ project as unknown as ProjectProps }
        tasks ={ tasks as any }
        activities = {activities!}
        totalWorkspaceMembers = {totalWorkspaceMembers!}
        comments = { comments as CommentProps[] }
        accessLevel={accessLevel ?? "MEMBER"} // Provide default value to avoid undefined
        />
        </TabsContent>
        <TabsContent value='table'>
        <ProjectTableContainer projectId = {projectId}/>
        </TabsContent>
        <TabsContent value='kanban'>
        <Projectkanban initialTasks = {tasks?.items as unknown as ProjectTaskProps[]}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProjectPage

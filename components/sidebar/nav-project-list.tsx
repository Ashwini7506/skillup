"use client"

import { ProjectProps, WorkspaceMembersProps } from "@/utils/types"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar"
import Link from "next/link"
import { CreateProjectForm } from "../project/create-project-form"

export const NavProjects = ({
  projects,
  workspaceMembers,
}: {
  projects: ProjectProps[]
  workspaceMembers: WorkspaceMembersProps[]
}) => {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <SidebarGroup className="group-data-[collapsible='icon']:hidden">
        <SidebarGroupLabel className="flex justify-between">
          <span className="text-sm font-semibold text-muted-foreground uppercase">
            Projects
          </span>

          <CreateProjectForm workspaceMembers={workspaceMembers} />
        </SidebarGroupLabel>
      </SidebarGroup>

      <SidebarMenu>
        {projects.map((proj) => {
          const href = `/workspace/${proj.workspaceId}/projects/${proj.id}`

          return (
            <SidebarMenuItem key={proj.id}>
              {/* Make the *button* the link */}
              <SidebarMenuButton>
                <Link
                  href={href}
                  className={
                    pathname === href
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {proj.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </>
  )
}

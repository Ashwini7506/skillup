"use client"

import { useState } from "react";
import { ProjectProps, WorkspaceMembersProps } from "@/utils/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { CreateProjectForm } from "../project/create-project-form";
import { DeleteProject } from "../project/delete-project";
import { EditProjectVisibility } from "../project/edit-project-visibility";
import {
  Folder,
  FolderOpen,
  Circle,
  Users,
  Filter,
  Lock,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";

export const NavProjects = ({
  projects,
  workspaceMembers,
}: {
  projects: ProjectProps[];
  workspaceMembers: WorkspaceMembersProps[];
}) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PUBLIC' | 'PERSONAL'>('ALL');

  const projectColors = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-blue-500",
    "from-teal-500 to-green-500",
  ];

  const filteredProjects = projects.filter(project => {
    if (visibilityFilter === 'ALL') return true;
    return project.visibility === visibilityFilter;
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="w-3 h-3" />;
      case 'PERSONAL':
        return <Lock className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'PERSONAL':
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Public';
      case 'PERSONAL':
        return 'Personal';
      default:
        return 'Team';
    }
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible='icon']:hidden px-2 mt-6">
        <SidebarGroupLabel className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
            Projects ({filteredProjects.length})
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVisibilityFilter('ALL')}
                className={`p-1 rounded-md transition-all duration-200 ${
                  visibilityFilter === 'ALL'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Show all projects"
              >
                <Filter className="w-3 h-3" />
              </button>
            </div>
            <CreateProjectForm workspaceMembers={workspaceMembers} />
          </div>
        </SidebarGroupLabel>
      </SidebarGroup>

      <SidebarMenu className="px-2 space-y-1">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6" />
            </div>
            {projects.length === 0 ? (
              <>
                <p className="text-sm">No projects yet</p>
                <p className="text-xs opacity-75">Create your first project to get started</p>
              </>
            ) : (
              <>
                <p className="text-sm">No {visibilityFilter.toLowerCase()} projects</p>
                <p className="text-xs opacity-75">
                  {visibilityFilter === 'ALL' ? 'Create a new project' : `No ${visibilityFilter.toLowerCase()} projects found`}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredProjects.map((proj, index) => {
            const href = `/workspace/${proj.workspaceId}/projects/${proj.id}`;
            const isActive = pathname === href;
            const colorGradient = projectColors[index % projectColors.length];

            return (
              <SidebarMenuItem key={proj.id} className="relative group">
                <div className={`
                  flex w-full items-center justify-between rounded-lg transition-all duration-300 p-2
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 ring-1 ring-blue-500/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm'
                  }
                `}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <div className={`
                      p-1.5 rounded-md transition-all duration-300 relative
                      ${isActive
                        ? `bg-gradient-to-r ${colorGradient} shadow-lg`
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }
                    `}>
                      {isActive ? (
                        <FolderOpen className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}

                      <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                        <div className={`
                          w-2 h-2 rounded-full flex items-center justify-center
                          ${(proj.visibility === 'PUBLIC') ? 'bg-blue-500' : 'bg-gray-400'}
                        `}>
                          {proj.visibility === 'PUBLIC' ? (
                            <Eye className="w-1.5 h-1.5 text-white" />
                          ) : (
                            <EyeOff className="w-1.5 h-1.5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Circle className={`
                          w-2 h-2 transition-all duration-300
                          ${isActive
                            ? 'text-blue-500 fill-blue-500'
                            : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'
                          }
                        `} />
                        <span className={`
                          text-sm font-medium truncate transition-all duration-300
                          ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground group-hover:text-foreground'
                          }
                        `}>
                          {proj.name}
                        </span>

                        {proj.visibility && (
                          <span className={`
                            text-[10px] font-semibold px-2 py-1 rounded-full border transition-all duration-200
                            flex items-center gap-1 ${getVisibilityColor(proj.visibility)}
                          `}>
                            {getVisibilityIcon(proj.visibility)}
                            {getVisibilityLabel(proj.visibility)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 flex items-center gap-1">
                    <EditProjectVisibility
                      projectId={proj.id}
                      workspaceId={proj.workspaceId}
                      currentVisibility={proj.visibility}
                    />
                    <DeleteProject
                      projectId={proj.id}
                      workspaceId={proj.workspaceId}
                    />
                  </div>
                </div>
              </SidebarMenuItem>
            );
          })
        )}
      </SidebarMenu>
    </>
  );
};

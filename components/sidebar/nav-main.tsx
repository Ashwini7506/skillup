"use client"

import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar"
import { CheckSquare, Home, Settings, Users, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const NavMain = () => {
    const workspaceId = useWorkspaceId()
    const { setOpenMobile } = useSidebar()
    const pathname = usePathname()

    const items = [
        {
            label: "Home",
            href: `/workspace/${workspaceId}`,
            icon: Home,
            path: "home",
            gradient: "from-blue-500 to-cyan-500",
            bgHover: "hover:bg-blue-50 dark:hover:bg-blue-950/50"
        },
        {
            label: "Curate projects",
            href: `/workspace/${workspaceId}/curate-projects`,
            icon: CheckSquare,
            path: "my-tasks",
            gradient: "from-green-500 to-emerald-500",
            bgHover: "hover:bg-green-50 dark:hover:bg-green-950/50"
        },
        {
            label: "Members",
            href: `/workspace/${workspaceId}/members`,
            icon: Users,
            path: "members",
            gradient: "from-purple-500 to-pink-500",
            bgHover: "hover:bg-purple-50 dark:hover:bg-purple-950/50"
        },
        {
            label: "Settings",
            href: `/workspace/${workspaceId}/settings`,
            icon: Settings,
            path: "settings",
            gradient: "from-orange-500 to-red-500",
            bgHover: "hover:bg-orange-50 dark:hover:bg-orange-950/50"
        },
    ]

    const isActiveItem = (href: string) => {
        return pathname === href || pathname.startsWith(href)
    }

    return (
        <SidebarGroup className="px-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Menu
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map(el => {
                    const isActive = isActiveItem(el.href)
                    return (
                        <SidebarMenuItem key={el.label}>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={el.label}
                                className={`
                                    relative group px-3 py-2.5 rounded-lg transition-all duration-300 
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400' 
                                        : `text-muted-foreground ${el.bgHover} hover:text-foreground hover:shadow-sm`
                                    }
                                `}
                            >
                                <Link href={el.href} onClick={() => setOpenMobile(false)}>
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={`
                                            p-1.5 rounded-md transition-all duration-300 
                                            ${isActive 
                                                ? `bg-gradient-to-r ${el.gradient} shadow-lg` 
                                                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                                            }
                                        `}>
                                            <el.icon className={`
                                                w-4 h-4 transition-all duration-300 
                                                ${isActive 
                                                    ? 'text-white' 
                                                    : 'text-muted-foreground group-hover:text-foreground'
                                                }
                                            `} />
                                        </div>
                                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                                            {el.label}
                                        </span>
                                        {isActive && (
                                            <ChevronRight className="w-4 h-4 ml-auto text-blue-500 animate-pulse" />
                                        )}
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
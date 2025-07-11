"use client";

import {
  Plus,
  Users,
  Settings as SettingsIcon,
  Home,
  FolderOpen,
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Trophy,
  Star,
  Eye,
  CreditCard
} from "lucide-react";
import { Button } from "./ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ThemeToggle } from "./theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "./ui/popover";
import { ProfileAvatar } from "./profile-avatar";
import { Separator } from "./ui/separator";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Link from "next/link";

interface Props {
  id: string;
  name: string;
  email: string;
  image: string;
}

export const Navbar = ({ id, email, name, image }: Props) => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  type PageAction = "create" | "notifications";

  const pageConfigs: {
    [key: string]: {
      title: string;
      subtitle: string;
      icon: React.ElementType;
      gradient: string;
      bgPattern: string;
      breadcrumbs: { label: string; href: string }[];
      actions: PageAction[];
    };
  } = {
    "/home": {
      title: "Home",
      subtitle: "Discover and explore what SkillUp offers",
      icon: Home,
      gradient: "from-blue-500 to-purple-600",
      bgPattern:
        "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20",
      breadcrumbs: [{ label: "Home", href: `/workspace/${workspaceId}` }],
      actions: ["create", "notifications"]
    },
    "/members": {
      title: "Members",
      subtitle: "Connect with your learning community",
      icon: Users,
      gradient: "from-pink-500 to-rose-600",
      bgPattern:
        "bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20",
      breadcrumbs: [
        { label: "Home", href: `/workspace/${workspaceId}` },
        { label: "Members", href: `/workspace/${workspaceId}/members` }
      ],
      actions: ["notifications"]
    },
    "/settings": {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      icon: SettingsIcon,
      gradient: "from-slate-500 to-gray-600",
      bgPattern:
        "bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20",
      breadcrumbs: [
        { label: "Home", href: `/workspace/${workspaceId}` },
        { label: "Settings", href: `/workspace/${workspaceId}/settings` }
      ],
      actions: ["notifications"]
    },
    "/curate-projects": {
      title: "Curate Projects",
      subtitle: "Create and manage your learning projects",
      icon: FolderOpen,
      gradient: "from-emerald-500 to-teal-600",
      bgPattern:
        "bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20",
      breadcrumbs: [
        { label: "Home", href: `/workspace/${workspaceId}` },
        { label: "Curate Projects", href: `/workspace/${workspaceId}/curate-projects` }
      ],
      actions: ["create", "notifications"]
    },
    "/subscription": {
      title: "Subscription",
      subtitle: "Manage your subscription and billing",
      icon: CreditCard,
      gradient: "from-amber-500 to-orange-600",
      bgPattern:
        "bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20",
      breadcrumbs: [
        { label: "Home", href: `/workspace/${workspaceId}` },
        { label: "Subscription", href: `/workspace/${workspaceId}/subscription` }
      ],
      actions: ["notifications"]
    }
  };

  const navigationButtons = [
    { 
      label: "Home", 
      href: `/workspace/${workspaceId}`, 
      icon: Home, 
      gradient: "from-blue-500 to-purple-600",
      path: "/home"
    },
    { 
      label: "Curate Projects", 
      href: `/workspace/${workspaceId}/curate-projects`, 
      icon: FolderOpen, 
      gradient: "from-emerald-500 to-teal-600",
      path: "/curate-projects"
    },
    { 
      label: "Members", 
      href: `/workspace/${workspaceId}/members`, 
      icon: Users, 
      gradient: "from-pink-500 to-rose-600",
      path: "/members"
    },
    { 
      label: "Settings", 
      href: `/workspace/${workspaceId}/settings`, 
      icon: SettingsIcon, 
      gradient: "from-slate-500 to-gray-600",
      path: "/settings"
    },
    { 
      label: "Subscription", 
      href: `/workspace/${workspaceId}/subscription`, 
      icon: CreditCard, 
      gradient: "from-amber-500 to-orange-600",
      path: "/subscription"
    }
  ];

  const quickActions = {
    "/home": [
      { label: "Start Learning", icon: BookOpen, action: "start-learning" },
      { label: "View Progress", icon: Target, action: "view-progress" },
      { label: "Achievements", icon: Trophy, action: "achievements" }
    ],
    "/curate-projects": [
      { label: "Templates", icon: Star, action: "templates" },
      { label: "Import Project", icon: Plus, action: "import" }
    ],
    "/members": [
      { label: "Find Mentors", icon: Users, action: "find-mentors" },
      { label: "Study Groups", icon: Users, action: "study-groups" }
    ],
    "/settings": [],
    "/subscription": []
  };

  const currentPage = pageConfigs[pathname as keyof typeof pageConfigs] || pageConfigs["/home"];
  const currentQuickActions = quickActions[pathname as keyof typeof quickActions] || [];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    console.log(`Executing action: ${action}`);
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(`/workspace/${workspaceId}${path}`);
  };

  return (
    <nav
      className={`w-full bg-background border-b border-border transition-all duration-300`}
    >
      <div
        className={`h-1 bg-gradient-to-r ${currentPage.gradient} transition-all duration-500 ${
          isAnimating ? "animate-pulse" : ""
        }`}
      />

      <div className="flex items-center justify-between px-6 py-4">
        {/* Left spacer */}
        <div className="flex-1"></div>

        {/* Navigation Buttons - Centered */}
        <div className="flex items-center space-x-3">
          {navigationButtons.map((navItem) => {
            const NavIcon = navItem.icon;
            const isActive = isActivePath(navItem.path);
            
            return (
              <Link key={navItem.path} href={navItem.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`relative transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${navItem.gradient} text-white shadow-lg hover:opacity-90 transform scale-105`
                      : "hover:bg-accent hover:scale-105"
                  }`}
                >
                  <NavIcon className="h-4 w-4 mr-2" />
                  {navItem.label}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {currentQuickActions.length > 0 && (
            <Popover open={showQuickActions} onOpenChange={setShowQuickActions}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative group">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Quick Actions
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  {currentQuickActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="ghost"
                      className="w-full justify-start text-left hover:bg-accent"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <action.icon className="h-4 w-4 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {currentPage.actions.includes("notifications") && (
            <NotificationDropdown />
          )}

          <ThemeToggle />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <ProfileAvatar name={name} url={image} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <ProfileAvatar name={name} url={image} className="h-12 w-12" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col space-y-2">
                  <Link href={`/workspace/${workspaceId}/portfolio/${id}/`}>
                    <Button variant="ghost" className="justify-start w-full">
                      <Eye className="h-4 w-4 mr-3" />
                      View Portfolio
                    </Button>
                  </Link>
                  <Button variant="ghost" className="justify-start">
                    <SettingsIcon className="h-4 w-4 mr-3" />
                    Account Settings
                  </Button>
                  <LogoutLink>
                    <Button variant="ghost" className="justify-start w-full">
                      <Users className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </LogoutLink>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};
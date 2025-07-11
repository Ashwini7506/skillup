"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
// import { FilterDropdown } from "./FilterDropdown";
// import { ProjectGrid } from "./ProjectGrid";
// import { DiscoverProject, FilterType } from "@/types/discover";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoverProject, FilterType } from "@/utils/types";
import { FilterDropdown } from "./filterDropdown";
import { ProjectGrid } from "./projectGrid";

interface DiscoverClientProps {
  workspaceId: string;
  role: string;
  level: "noob" | "intermediate" | "advanced";
  userId: string;
}

export function DiscoverClient({
  workspaceId,
  role,
  level,
  userId,
}: DiscoverClientProps) {
  const [projects, setProjects] = useState<DiscoverProject[]>([]);
  const [filter, setFilter] = useState<FilterType>("team");
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [isRequestingCollaboration, setIsRequestingCollaboration] =
    useState(false);

  const fetchProjects = async (currentFilter: FilterType) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        workspaceId,
        role,
        level,
        filter: currentFilter,
      });

      const response = await fetch(`/api/projects/discover?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(filter);
  }, [filter, workspaceId, role, level]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleClone = async (projectId: string) => {
    setIsCloning(true);
    try {
      const response = await fetch("/api/projects/clone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clone project");
      }

      const data = await response.json();
      toast.success(data.message || "Project cloned successfully!");
      
      // Optionally refresh the projects list
      fetchProjects(filter);
    } catch (error) {
      console.error("Error cloning project:", error);
      toast.error(error instanceof Error ? error.message : "Failed to clone project");
    } finally {
      setIsCloning(false);
    }
  };

  const handleRequestCollaboration = async (projectId: string, projectOwnerId: string) => {
    setIsRequestingCollaboration(true);
    try {
      const response = await fetch("/api/projects/request-collaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          userId: projectOwnerId,
          requesterId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send collaboration request");
      }

      const data = await response.json();
      toast.success(data.message || "Collaboration request sent successfully!");
    } catch (error) {
      console.error("Error requesting collaboration:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send collaboration request");
    } finally {
      setIsRequestingCollaboration(false);
    }
  };

  const renderSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${projects.length} projects found`}
          </span>
        </div>
        <FilterDropdown
          currentFilter={filter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <ProjectGrid
          projects={projects}
          filter={filter}
          onClone={handleClone}
          onRequestCollaboration={handleRequestCollaboration}
          isCloning={isCloning}
          isRequestingCollaboration={isRequestingCollaboration}
          currentUserId={userId}
        />
      )}
    </div>
  );
}
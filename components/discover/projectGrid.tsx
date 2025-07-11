"use client";

// import { ProjectCard } from "./ProjectCard";
// import { DiscoverProject, FilterType } from "@/types/discover";
import { cn } from "@/lib/utils";
import { DiscoverProject, FilterType } from "@/utils/types";
import { ProjectCard } from "./projectCard";

interface ProjectGridProps {
  projects: DiscoverProject[];
  filter: FilterType;
  onClone: (projectId: string) => Promise<void>;
  onRequestCollaboration: (projectId: string, userId: string) => Promise<void>;
  isCloning: boolean;
  isRequestingCollaboration: boolean;
  currentUserId: string;
  className?: string;
}

export function ProjectGrid({
  projects,
  filter,
  onClone,
  onRequestCollaboration,
  isCloning,
  isRequestingCollaboration,
  currentUserId,
  className,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="text-lg font-medium mb-2">No projects found</div>
          <p className="text-sm">
            {filter === "team"
              ? "No team projects available for this role and level."
              : "No community projects available for this role and level."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          filter={filter}
          onClone={onClone}
          onRequestCollaboration={onRequestCollaboration}
          isCloning={isCloning}
          isRequestingCollaboration={isRequestingCollaboration}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageCircle, CheckSquare, GitBranch, Users } from "lucide-react";
// import { DiscoverProject, FilterType } from "@/types/discover";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: DiscoverProject;
  filter: FilterType;
  onClone: (projectId: string) => Promise<void>;
  onRequestCollaboration: (projectId: string, userId: string) => Promise<void>;
  isCloning: boolean;
  isRequestingCollaboration: boolean;
  currentUserId: string;
}

import { SKILLUP_TEAM_USER_ID } from "@/lib/skillup-config";
import { DiscoverProject, FilterType } from "@/utils/types";

export function ProjectCard({
  project,
  filter,
  onClone,
  onRequestCollaboration,
  isCloning,
  isRequestingCollaboration,
  currentUserId,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "NOOB":
        return "bg-green-100 text-green-800 border-green-200";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ADVANCED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isSkillupTeamProject = project.createdById === SKILLUP_TEAM_USER_ID;

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg",
        isHovered && "shadow-lg scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {project.name}
            </CardTitle>
            {project.difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-2 text-xs font-medium",
                  getDifficultyColor(project.difficulty)
                )}
              >
                {project.difficulty}
              </Badge>
            )}
          </div>
          {isSkillupTeamProject && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <GitBranch className="h-3 w-3 mr-1" />
              Team
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || "No description available"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span>{project._count.tasks}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{project._count.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Creator Info */}
        {project.createdBy && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={project.createdBy.image || ""} />
              <AvatarFallback className="text-xs">
                {project.createdBy.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              by {project.createdBy.name}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isSkillupTeamProject || filter === "team" ? (
            <Button
              onClick={() => onClone(project.id)}
              disabled={isCloning}
              className="w-full"
              size="sm"
            >
              {isCloning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cloning...
                </>
              ) : (
                <>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Add to My Projects
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onRequestCollaboration(project.id, project.createdById!)}
              disabled={isRequestingCollaboration}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isRequestingCollaboration ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Requesting...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Request to Collaborate
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
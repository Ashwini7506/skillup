import { JoinRequestSummary, SkillRating, TaskSummary } from "@/utils/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function calculateStrategicThinker(tasks: TaskSummary[], userId: string): number {
  const userTasks = tasks.filter(task => task.assigneeId === userId);
  const completedTasks = userTasks.filter(task => task.status === 'COMPLETED');
  
  if (userTasks.length === 0) return 0;
  
  const efficiency = (completedTasks.length / userTasks.length) * 100;
  return Math.min(Math.round(efficiency), 100);
}

export function calculateTeamMaker(joinRequests: JoinRequestSummary[]): number {
  const acceptedRequests = joinRequests.filter(req => req.status === 'ACCEPTED');
  const collaborationScore = Math.min(acceptedRequests.length * 10, 100);
  return collaborationScore;
}

export function calculateDecisionMaker(skillRatings: SkillRating[]): number {
  const decisionMakerRating = skillRatings.find(rating => rating.skill === 'Decision Maker');
  return decisionMakerRating ? Math.round(decisionMakerRating.averageRating * 20) : 0;
}

export function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case 'NOOB': return 'bg-green-100 text-green-800';
    case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
    case 'ADVANCED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short' 
  }).format(new Date(date));
}
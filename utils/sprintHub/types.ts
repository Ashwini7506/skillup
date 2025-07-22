// types/sprint-hub.ts
export interface SprintLandingData {
  user: {
    id: string;
    email: string;
  };
  enrollment: {
    id: string;
    cohortId: string;
    intendedRole: string;
    enrolledAt: Date;
  } | null;
  team: {
    id: string;
    name: string;
    members: string[];
    projectId: string;
    cohortId: string;
  } | null;
  cohort: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    activated: boolean;
    workspaceId: string;
  } | null;
  storyState: {
    id: string;
    state: any; // JSON from SprintTeamStoryState
    introComplete: boolean;
    currentChapter: number;
    currentSegment: number;
  } | null;
  project: {
    id: string;
    name: string;
    tasks: {
      id: string;
      title: string;
      completed: boolean;
      assignedTo: string[];
    }[];
  } | null;
  teamMembers: {
    id: string;
    email: string | null;
    sprintRole: string;
    taskCount: number;
    completedTasks: number;
  }[];
}

export interface SprintHubState {
  isEnrolled: boolean;
  hasTeam: boolean;
  cohortStarted: boolean;
  cohortEnded: boolean;
  canAccessStory: boolean;
  canAccessTeam: boolean;
  canAccessRanking: boolean;
  canAccessUploads: boolean;
}

export interface TeamMemberStats {
  userId: string;
  email: string;
  sprintRole: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface RankingData {
  teamId: string;
  teamName: string;
  isCurrentTeam: boolean;
  avgVotes: number;
  totalVotes: number;
  completionPercentage: number;
  uploadCount: number;
  totalScore: number;
  rank: number;
}

export interface UploadData {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  taskId: string;
  taskTitle: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface AdminCohortData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  activated: boolean;
  workspaceId: string;
  enrollmentCount: number;
  teamCount: number;
  createdAt: Date;
}

export interface AdminEnrollmentData {
  userId: string;
  email: string;
  intendedRole: string;
  enrolledAt: Date;
  hasTeam: boolean;
  teamName?: string;
}

export interface AdminTeamData {
  id: string;
  name: string;
  members: string[];
  projectId: string;
  cohortId: string;
  memberEmails: string[];
  taskProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  uploadCount: number;
  voteCount: number;
  lastActivity: Date;
}

export interface AdminMetrics {
  totalCohorts: number;
  activeCohorts: number;
  totalEnrollments: number;
  totalTeams: number;
  avgTeamSize: number;
  avgCompletionRate: number;
  totalUploads: number;
  totalVotes: number;
}

// lib/sprint/types.ts
export interface StorySegmentClient {
  id: string;
  type: 'VIDEO' | 'DIALOGUE' | 'CHOICE' | 'TASK_UNLOCK' | 'CHAPTER_END';
  character?: string;
  text?: string;
  mediaUrl?: string;
  choices?: Array<{
    id: string;
    text: string;
  }>;
}

export interface SprintStoryState {
  started: boolean;
  seenIntro: boolean;
  currentChapter: string | null;      // <- string ID from DB
  currentSegment: string | null;      // <- string ID
  unlockedChapters: string[];         // <- list of chapter IDs
  completedSegments: string[];        // <- list of segment IDs
  history: string[];
  [key: string]: any; // 🔧 This makes it Prisma JSON compatible
}


export interface SprintTeamClient {
  id: string;
  name: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    sprintRole: string;
  }>;
  cohort: {
    id: string;
    name: string;
    endDate: string | Date;
  };
  projectId?: string;
}
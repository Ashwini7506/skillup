import { $Enums, AccessLevel, Comment, Difficulty, ProjectVisibility, Task, TaskStatus, Workspace, WorkspaceMember } from "@prisma/client";

export interface WorkspaceMembersProps extends WorkspaceMember{
    user:{
        id : string;
        name : string;
        email : string;
        image?: string;
    }
    projectAccess : {
        id : string;
        hasAccess : boolean;
        projectId : string;
    }[];
}


export interface ProjectProps {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  visibility: "PERSONAL" | "PUBLIC"; // <- required
  role?: string | null; // <- optional

  members: {
    id: string;
    userId: string;
    workspaceId: string;
    accessLevel: AccessLevel;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }[];
}


export interface WorkspaceProps {
    id : string;
    createdAt:Date;
    userId : string;
    workspaceId : string;
    accessLevel : $Enums.AccessLevel;
    workspace : {
        name : string;
    }
}

export interface CommentProps extends Comment{
    user:{ id:string; name:string; image:string};
}

export interface ProjectTaskProps extends Task{
    assignedTo :{
        id:string;
        name:string;
        image?:string;
    };
    project : {id: string; name: string};
}

export interface Column {
    id: TaskStatus;
    title : string;
    tasks : ProjectTaskProps[];
}


export interface NotificationData {
  id: string;
  type: string;
  description: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    actorId?: string;
    actorName?: string;
    taskTitle?: string;
    projectName?: string;
    workspaceName?: string;
    [key: string]: any;
  };
  project?: {
    id: string;
    name: string;
  };
  joinRequest?: {
    id: string;
    requester: {
      id: string;
      name: string;
    };
  };
}

export interface NotificationGroup {
  date: string;
  notifications: NotificationData[];
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export interface DiscoverProject {
  id: string;
  name: string;
  description: string | null;
  difficulty: Difficulty | null;
  role: string | null;
  visibility: ProjectVisibility;
  createdById: string | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  _count: {
    tasks: number;
    comments: number;
  };
}

export interface DiscoverResponse {
  projects: DiscoverProject[];
  total: number;
}

export type FilterType = "team" | "community";

export interface CloneProjectRequest {
  projectId: string;
  workspaceId: string;
}

export interface CloneProjectResponse {
  success: boolean;
  message: string;
  clonedProjectId?: string;
}

export interface RequestCollaborationRequest {
  projectId: string;
  userId: string;
  requesterId: string;
}

export interface RequestCollaborationResponse {
  success: boolean;
  message: string;
}




export interface UserPortfolio {
  id: string;
  name: string;
  email: string;
  image: string | null;
  job: string;
  role: string;
  about: string | null;
  username?: string;
  experience?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  positionOfResponsibility?: string[];
  hardSkills?: string[];
  createdProjects: ProjectSummary[];
  joinRequests: JoinRequestSummary[];
  tasks: TaskSummary[];
  activities: ActivitySummary[];
  skillRatings?: SkillRating[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PERSONAL' | 'PUBLIC';
  difficulty: 'NOOB' | 'INTERMEDIATE' | 'ADVANCED' | null;
  role: string | null;
  createdAt: Date;
}

export interface JoinRequestSummary {
  id: string;
  status: string;
  project: ProjectSummary;
  createdAt: Date;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'IN_REVIEW' | 'BACKLOG' | 'BLOCKED';
  assigneeId: string | null;
  createdAt: Date;
}

export interface ActivitySummary {
  id: string;
  type: string;
  createdAt: Date;
}

export interface SkillRating {
  skill: string;
  rating: number;
  raterIds: string[];
  averageRating: number;
}

export interface CalculatedSkills {
  strategicThinker: number;
  teamMaker: number;
  decisionMaker: number;
}
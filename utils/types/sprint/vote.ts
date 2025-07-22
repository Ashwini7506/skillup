// types/sprint/vote.ts
import { SprintVote} from "@prisma/client";

export enum SprintVoteType {
  PEER = "PEER",              // peers vote on peers
  MENTOR = "MENTOR",          // mentors vote
  JURY = "JURY",              // judged panel
  PUBLIC = "PUBLIC",          // open voting
  SELF = "SELF",              // self-assessment
  OTHER = "OTHER",
}

export enum SprintVoteStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

export interface SprintVotingRound {
  id: string;
  name: string;
  description?: string;
  type: SprintVoteType;
  status: SprintVoteStatus;
  cohortId: string;
  startDate: Date;
  endDate: Date;
  createdById: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintVoteWithRelations extends SprintVote {
  voter: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  voterTeam: {
    id: string;
    name: string;
    cohortId: string;
  };
  targetTeam: {
    id: string;
    name: string;
    members: {
      id: string;
      name: string;
      image?: string;
    }[];
    project?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  votingRound: {
    id: string;
    name: string;
    type: SprintVoteType;
    status: SprintVoteStatus;
    startDate: Date;
    endDate: Date;
    cohort: {
      id: string;
      name: string;
    };
  };
  criteria: SprintVoteCriteriaInfo[];
  comments: SprintVoteCommentInfo[];
  attachments: SprintVoteAttachmentInfo[];
  delegates: SprintVoteDelegateInfo[];
  _count: {
    criteria: number;
    comments: number;
    attachments: number;
    delegates: number;
  };
}

export interface SprintVotingRoundWithRelations extends SprintVotingRound {
  cohort: {
    id: string;
    name: string;
    teams: {
      id: string;
      name: string;
      memberCount: number;
    }[];
  };
  createdBy: {
    id: string;
    name: string;
    image?: string;
  };
  criteria: SprintVotingCriteriaInfo[];
  votes: SprintVoteWithRelations[];
  results: SprintVoteResultInfo[];
  notifications: SprintVoteNotificationInfo[];
  _count: {
    criteria: number;
    votes: number;
    results: number;
    eligibleVoters: number;
    participatedVoters: number;
  };
}

export interface SprintVoteCriteriaInfo {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  scoreType: VoteScoreType;
  isRequired: boolean;
  order: number;
  options?: VoteCriteriaOption[];
  metadata?: any;
}

export interface VoteCriteriaOption {
  id: string;
  label: string;
  value: number;
  description?: string;
  color?: string;
  icon?: string;
}

export interface SprintVotingCriteriaInfo {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  scoreType: VoteScoreType;
  isRequired: boolean;
  order: number;
  helpText?: string;
  examples?: string[];
  options?: VoteCriteriaOption[];
  validation?: VoteCriteriaValidation;
  metadata?: any;
}

export interface VoteCriteriaValidation {
  required: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
  customValidation?: string;
}

export interface SprintVoteCommentInfo {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  criteriaId?: string;
  criteria?: {
    id: string;
    name: string;
  };
  isPublic: boolean;
  isAnonymous: boolean;
  parentId?: string;
  parent?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
  };
  reactions: VoteCommentReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteCommentReaction {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  type: VoteReactionType;
  createdAt: Date;
}

export interface SprintVoteAttachmentInfo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    image?: string;
  };
  criteriaId?: string;
  criteria?: {
    id: string;
    name: string;
  };
  isPublic: boolean;
  createdAt: Date;
}

export interface SprintVoteDelegateInfo {
  id: string;
  delegatorId: string;
  delegator: {
    id: string;
    name: string;
    image?: string;
  };
  delegateId: string;
  delegate: {
    id: string;
    name: string;
    image?: string;
  };
  permissions: VoteDelegatePermission[];
  expiresAt?: Date;
  isActive: boolean;
  reason?: string;
  createdAt: Date;
}

export interface SprintVoteResultInfo {
  id: string;
  teamId: string;
  team: {
    id: string;
    name: string;
    members: {
      id: string;
      name: string;
      image?: string;
    }[];
  };
  totalScore: number;
  averageScore: number;
  maxPossibleScore: number;
  normalizedScore: number;
  rank: number;
  percentile: number;
  criteriaScores: VoteCriteriaScore[];
  voteCount: number;
  confidenceScore: number;
  qualityScore: number;
  metadata?: any;
}

export interface VoteCriteriaScore {
  criteriaId: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
  };
  totalScore: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  voteCount: number;
  standardDeviation: number;
  distribution: VoteScoreDistribution[];
}

export interface VoteScoreDistribution {
  score: number;
  count: number;
  percentage: number;
}

export interface SprintVoteNotificationInfo {
  id: string;
  type: VoteNotificationType;
  title: string;
  message: string;
  recipients: string[];
  sentAt?: Date;
  scheduledFor?: Date;
  metadata?: any;
}

export interface VoteFilters {
  type?: SprintVoteType[];
  status?: SprintVoteStatus[];
  voterId?: string;
  voterTeamId?: string;
  targetTeamId?: string;
  cohortId?: string;
  votingRoundId?: string;
  hasComments?: boolean;
  hasAttachments?: boolean;
  scoreRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  isAnonymous?: boolean;
  isDelegated?: boolean;
}

export interface VoteSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "totalScore" | "averageScore" | "voteCount";
  sortOrder?: "asc" | "desc";
  filters?: VoteFilters;
  groupBy?: "team" | "voter" | "criteria" | "round" | "date";
}

export interface CreateVoteData {
  type: SprintVoteType;
  targetTeamId: string;
  votingRoundId: string;
  criteriaScores: CreateVoteCriteriaScore[];
  overallComment?: string;
  isAnonymous?: boolean;
  attachments?: string[];
  metadata?: any;
}

export interface CreateVoteCriteriaScore {
  criteriaId: string;
  score: number;
  comment?: string;
  confidence?: number;
  attachments?: string[];
}

export interface UpdateVoteData {
  criteriaScores?: UpdateVoteCriteriaScore[];
  overallComment?: string;
  isAnonymous?: boolean;
  attachments?: string[];
  metadata?: any;
}

export interface UpdateVoteCriteriaScore {
  criteriaId: string;
  score?: number;
  comment?: string;
  confidence?: number;
  attachments?: string[];
}

export interface CreateVotingRoundData {
  name: string;
  description?: string;
  type: SprintVoteType;
  cohortId: string;
  startDate: Date;
  endDate: Date;
  criteria: CreateVotingCriteriaData[];
  settings: VotingRoundSettings;
  notifications: VotingRoundNotificationSettings;
  metadata?: any;
}

export interface CreateVotingCriteriaData {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  scoreType: VoteScoreType;
  isRequired: boolean;
  helpText?: string;
  examples?: string[];
  options?: VoteCriteriaOption[];
  validation?: VoteCriteriaValidation;
}

export interface VotingRoundSettings {
  allowSelfVoting: boolean;
  allowAnonymousVoting: boolean;
  allowComments: boolean;
  allowAttachments: boolean;
  allowDelegation: boolean;
  requireAllCriteria: boolean;
  enableRealTimeResults: boolean;
  enableVoteChanges: boolean;
  maxVotesPerTeam?: number;
  minVotesRequired?: number;
  votingWeights?: VotingWeight[];
  restrictions?: VotingRestriction[];
}

export interface VotingWeight {
  userId: string;
  weight: number;
  reason?: string;
}

export interface VotingRestriction {
  type: VotingRestrictionType;
  value: string;
  reason?: string;
}

export interface VotingRoundNotificationSettings {
  notifyOnStart: boolean;
  notifyOnEnd: boolean;
  notifyOnVoteReceived: boolean;
  notifyOnResultsPublished: boolean;
  reminderSchedule: VotingReminderSchedule[];
  customNotifications: CustomVotingNotification[];
}

export interface VotingReminderSchedule {
  type: VotingReminderType;
  timeBeforeEnd: number;
  message?: string;
  recipients?: string[];
}

export interface CustomVotingNotification {
  trigger: VotingNotificationTrigger;
  message: string;
  recipients: string[];
  delay?: number;
}

export interface VoteStats {
  totalVotes: number;
  totalVoters: number;
  totalTeams: number;
  participationRate: number;
  completionRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: VoteScoreDistribution[];
  criteriaStats: VoteCriteriaStats[];
  voterStats: VoteVoterStats[];
  teamStats: VoteTeamStats[];
}

export interface VoteCriteriaStats {
  criteriaId: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
  };
  totalVotes: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  distribution: VoteScoreDistribution[];
  reliability: number;
}

export interface VoteVoterStats {
  voterId: string;
  voter: {
    id: string;
    name: string;
    image?: string;
  };
  totalVotes: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  consistency: number;
  participationRate: number;
  bias: number;
}

export interface VoteTeamStats {
  teamId: string;
  team: {
    id: string;
    name: string;
  };
  totalVotes: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  rank: number;
  percentile: number;
  consistency: number;
  improvement: number;
}

export interface VoteAnalytics {
  votingTrend: {
    date: Date;
    votes: number;
    uniqueVoters: number;
    averageScore: number;
    participationRate: number;
  }[];
  scoreAnalysis: {
    criteria: string;
    scores: {
      team: string;
      score: number;
      rank: number;
    }[];
    reliability: number;
    discrimination: number;
  }[];
  voterBehavior: {
    voterId: string;
    patterns: {
      averageScore: number;
      scoreRange: number;
      consistency: number;
      bias: number;
      speed: number;
    };
    preferences: {
      criteria: string;
      weight: number;
    }[];
  }[];
  teamPerformance: {
    teamId: string;
    rounds: {
      roundId: string;
      score: number;
      rank: number;
      improvement: number;
    }[];
    strengths: string[];
    weaknesses: string[];
    trajectory: VoteTrajectory;
  }[];
  consensusAnalysis: {
    overallConsensus: number;
    criteriaConsensus: {
      criteriaId: string;
      consensus: number;
      polarization: number;
    }[];
    voterAgreement: {
      voterPair: string[];
      agreement: number;
    }[];
  };
}

export interface VoteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canSubmit: boolean;
  missingCriteria: string[];
  invalidScores: string[];
  recommendations: string[];
}

export interface VoteDashboardData {
  vote: SprintVoteWithRelations;
  votingRound: SprintVotingRoundWithRelations;
  stats: VoteStats;
  analytics: VoteAnalytics;
  results: SprintVoteResultInfo[];
  recentActivity: VoteActivity[];
  canVote: boolean;
  hasVoted: boolean;
  canEdit: boolean;
  permissions: VotePermissions;
}

export interface VoteActivity {
  id: string;
  type: VoteActivityType;
  description: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  voteId?: string;
  roundId?: string;
  metadata?: any;
  createdAt: Date;
}

export interface VoteBulkAction {
  action: VoteBulkActionType;
  voteIds: string[];
  data?: any;
  reason?: string;
  performedBy: string;
}

export interface VoteExport {
  votes: SprintVoteWithRelations[];
  results: SprintVoteResultInfo[];
  stats: VoteStats;
  analytics: VoteAnalytics;
  exportedAt: Date;
  exportedBy: string;
  format: VoteExportFormat;
}

export interface VoteImport {
  votes: CreateVoteData[];
  preserveVoters: boolean;
  preserveTimestamps: boolean;
  teamMapping?: Record<string, string>;
  userMapping?: Record<string, string>;
  criteriaMapping?: Record<string, string>;
}

export interface VotePermissions {
  canVote: boolean;
  canViewResults: boolean;
  canViewDetails: boolean;
  canComment: boolean;
  canAttach: boolean;
  canDelegate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canViewAnalytics: boolean;
  canManageRound: boolean;
  canViewVoters: boolean;
}

export interface VoteNotification {
  id: string;
  type: VoteNotificationType;
  title: string;
  message: string;
  recipients: string[];
  voteId?: string;
  roundId?: string;
  sentAt?: Date;
  scheduledFor?: Date;
  metadata?: any;
}

export interface VoteAuditLog {
  id: string;
  action: VoteAuditAction;
  entityType: VoteAuditEntityType;
  entityId: string;
  performedBy: string;
  previousValues?: any;
  newValues?: any;
  affectedFields: string[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: any;
}

// Type definitions for enums and unions
export type VoteScoreType = "NUMERIC" | "STAR" | "BOOLEAN" | "PERCENTAGE" | "SCALE" | "RANKING";

export type VoteReactionType = "LIKE" | "LOVE" | "HELPFUL" | "INSIGHTFUL" | "DISAGREE" | "CONFUSED";

export type VoteDelegatePermission = "VOTE" | "COMMENT" | "ATTACH" | "VIEW_RESULTS";

export type VoteNotificationType = "round_started" | "round_ending" | "round_ended" | "vote_received" | "results_published" | "reminder" | "delegate_assigned";

export type VotingRestrictionType = "EXCLUDE_TEAM" | "EXCLUDE_USER" | "REQUIRE_ROLE" | "REQUIRE_PERMISSION";

export type VotingReminderType = "DAILY" | "HOURLY" | "CUSTOM";

export type VotingNotificationTrigger = "VOTE_SUBMITTED" | "ROUND_STARTED" | "ROUND_ENDED" | "RESULTS_PUBLISHED" | "THRESHOLD_REACHED";

export type VoteTrajectory = "IMPROVING" | "DECLINING" | "STABLE" | "VOLATILE";

export type VoteActivityType = 
  | "vote_submitted"
  | "vote_updated"
  | "vote_deleted"
  | "comment_added"
  | "attachment_added"
  | "delegate_assigned"
  | "delegate_removed"
  | "round_started"
  | "round_ended"
  | "results_published"
  | "criteria_added"
  | "criteria_updated"
  | "criteria_removed";

export type VoteBulkActionType = "approve" | "reject" | "delete" | "export" | "notify" | "delegate";

export type VoteExportFormat = "CSV" | "EXCEL" | "JSON" | "PDF" | "CHART";

export type VoteAuditAction = "CREATE" | "UPDATE" | "DELETE" | "SUBMIT" | "DELEGATE" | "EXPORT" | "VIEW";

export type VoteAuditEntityType = "VOTE" | "ROUND" | "CRITERIA" | "COMMENT" | "ATTACHMENT" | "RESULT";

export const VOTE_SCORE_RANGES = {
  NUMERIC: { min: 0, max: 100 },
  STAR: { min: 1, max: 5 },
  BOOLEAN: { min: 0, max: 1 },
  PERCENTAGE: { min: 0, max: 100 },
  SCALE: { min: 1, max: 10 },
  RANKING: { min: 1, max: 999 }
} as const;

export const VOTE_QUALITY_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
  POOR: 30,
  VERY_POOR: 0
} as const;

export const VOTE_CONSENSUS_LEVELS = {
  STRONG: 0.8,
  MODERATE: 0.6,
  WEAK: 0.4,
  NONE: 0.2
} as const;

export const VOTE_PARTICIPATION_TARGETS = {
  MINIMUM: 0.5,
  GOOD: 0.7,
  EXCELLENT: 0.9
} as const;

export const VOTE_RELIABILITY_METRICS = {
  CRONBACH_ALPHA: 0.7,
  INTER_RATER: 0.6,
  TEST_RETEST: 0.8
} as const;

export const VOTE_VALIDATION_RULES = {
  score: {
    required: true,
    numeric: true,
    withinRange: true
  },
  comment: {
    maxLength: 1000
  },
  criteria: {
    required: true,
    validId: true
  },
  attachments: {
    maxCount: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  }
} as const;

export const VOTE_DEFAULT_WEIGHTS = {
  EQUAL: 1,
  TEAM_LEAD: 2,
  MENTOR: 1.5,
  EXPERT: 3,
  PEER: 1
} as const;

export const VOTE_ANONYMITY_LEVELS = {
  NONE: 0,
  PARTIAL: 1,
  FULL: 2,
  BLIND: 3
} as const;
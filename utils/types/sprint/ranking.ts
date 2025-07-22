// types/sprint/ranking.ts
export enum SprintRankingType {
  TEAM = "TEAM",        // ranking teams against each other
  USER = "USER",        // individual user rankings
  PROJECT = "PROJECT",  // project-level rankings
  COHORT = "COHORT",    // whole-cohort rankings
  CUSTOM = "CUSTOM",
}

export enum SprintRankingStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

// --- Domain base interfaces (stand-ins for future Prisma models) ---
export interface SprintRanking {
  id: string;
  type: SprintRankingType;
  rankedEntityId: string;      // team/user/project/etc
  rankedById: string;          // who submitted the ranking
  periodId: string;            // SprintRankingPeriod FK (domain-only for now)
  overallScore?: number;
  overallRank?: number;
  comment?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintRankingPeriod {
  id: string;
  name: string;
  description?: string;
  type: SprintRankingType;
  status: SprintRankingStatus;
  cohortId: string;
  startDate: Date;
  endDate: Date;
  createdById: string;
  settings?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintRankingWithRelations extends SprintRanking {
  rankedEntity: {
    id: string;
    name: string;
    type: RankingEntityType;
    image?: string;
    metadata?: any;
  };
  rankedBy: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  rankingPeriod: {
    id: string;
    name: string;
    type: SprintRankingType;
    status: SprintRankingStatus;
    startDate: Date;
    endDate: Date;
    cohort: {
      id: string;
      name: string;
    };
  };
  criteria: SprintRankingCriteriaInfo[];
  scores: SprintRankingScoreInfo[];
  comments: SprintRankingCommentInfo[];
  attachments: SprintRankingAttachmentInfo[];
  history: SprintRankingHistoryInfo[];
  _count: {
    criteria: number;
    scores: number;
    comments: number;
    attachments: number;
    history: number;
  };
}

export interface SprintRankingPeriodWithRelations extends SprintRankingPeriod {
  cohort: {
    id: string;
    name: string;
    teams: {
      id: string;
      name: string;
      memberCount: number;
    }[];
    members: {
      id: string;
      name: string;
      image?: string;
    }[];
  };
  createdBy: {
    id: string;
    name: string;
    image?: string;
  };
  criteria: SprintRankingCriteriaInfo[];
  rankings: SprintRankingWithRelations[];
  results: SprintRankingResultInfo[];
  leaderboard: SprintLeaderboardInfo[];
  notifications: SprintRankingNotificationInfo[];
  _count: {
    criteria: number;
    rankings: number;
    results: number;
    participants: number;
    completedRankings: number;
  };
}

export interface SprintRankingCriteriaInfo {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  scoreType: RankingScoreType;
  isRequired: boolean;
  order: number;
  category: RankingCriteriaCategory;
  icon?: string;
  color?: string;
  helpText?: string;
  examples?: string[];
  benchmarks?: RankingBenchmark[];
  validation?: RankingCriteriaValidation;
  metadata?: any;
}

export interface RankingBenchmark {
  id: string;
  label: string;
  value: number;
  description: string;
  level: RankingBenchmarkLevel;
  color?: string;
  icon?: string;
}

export interface RankingCriteriaValidation {
  required: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
  uniqueRanks?: boolean;
  customValidation?: string;
}

export interface SprintRankingScoreInfo {
  id: string;
  criteriaId: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    scoreType: RankingScoreType;
  };
  score: number;
  rank: number;
  percentile: number;
  normalizedScore: number;
  confidence: number;
  comment?: string;
  reasoning?: string;
  attachments: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintRankingCommentInfo {
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
  targetEntityId?: string;
  targetEntity?: {
    id: string;
    name: string;
    type: RankingEntityType;
  };
  isPublic: boolean;
  isAnonymous: boolean;
  sentiment: RankingSentiment;
  tags: string[];
  parentId?: string;
  parent?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
  };
  reactions: RankingCommentReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingCommentReaction {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  type: RankingReactionType;
  createdAt: Date;
}

export interface SprintRankingAttachmentInfo {
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
  entityId?: string;
  entity?: {
    id: string;
    name: string;
    type: RankingEntityType;
  };
  isPublic: boolean;
  createdAt: Date;
}

export interface SprintRankingHistoryInfo {
  id: string;
  action: RankingHistoryAction;
  previousRank?: number;
  newRank?: number;
  previousScore?: number;
  newScore?: number;
  criteriaId?: string;
  criteria?: {
    id: string;
    name: string;
  };
  performedBy: {
    id: string;
    name: string;
    image?: string;
  };
  reason?: string;
  metadata?: any;
  createdAt: Date;
}

export interface SprintRankingResultInfo {
  id: string;
  entityId: string;
  entity: {
    id: string;
    name: string;
    type: RankingEntityType;
    image?: string;
    members?: {
      id: string;
      name: string;
      image?: string;
    }[];
  };
  overallRank: number;
  overallScore: number;
  maxPossibleScore: number;
  normalizedScore: number;
  percentile: number;
  trend: RankingTrend;
  previousRank?: number;
  rankChange?: number;
  criteriaResults: RankingCriteriaResult[];
  competitivePosition: RankingCompetitivePosition;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  achievements: RankingAchievement[];
  badges: RankingBadge[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingCriteriaResult {
  criteriaId: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    category: RankingCriteriaCategory;
  };
  score: number;
  rank: number;
  percentile: number;
  trend: RankingTrend;
  benchmarkLevel: RankingBenchmarkLevel;
  improvement: number;
  consistency: number;
  reliability: number;
}

export interface RankingCompetitivePosition {
  tier: RankingTier;
  quartile: number;
  percentile: number;
  gapToNext: number;
  gapToPrevious: number;
  closeCompetitors: string[];
  marketPosition: string;
}

export interface RankingAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: RankingAchievementType;
  level: RankingAchievementLevel;
  earnedAt: Date;
  criteria?: string[];
  threshold?: number;
  metadata?: any;
}

export interface RankingBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: RankingBadgeType;
  level: RankingBadgeLevel;
  validUntil?: Date;
  criteria: string[];
  metadata?: any;
}

export interface SprintLeaderboardInfo {
  id: string;
  name: string;
  description?: string;
  type: LeaderboardType;
  scope: LeaderboardScope;
  timeframe: LeaderboardTimeframe;
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: Date;
  refreshRate: number;
  isPublic: boolean;
  settings: LeaderboardSettings;
  metadata?: any;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  entityId: string;
  entity: {
    id: string;
    name: string;
    type: RankingEntityType;
    image?: string;
  };
  score: number;
  change: number;
  trend: RankingTrend;
  streak: number;
  badges: RankingBadge[];
  highlights: string[];
  metadata?: any;
}

export interface LeaderboardSettings {
  showRankings: boolean;
  showScores: boolean;
  showTrends: boolean;
  showBadges: boolean;
  showAchievements: boolean;
  anonymizeResults: boolean;
  maxDisplayEntries: number;
  updateFrequency: number;
  highlightTop: number;
  theme: LeaderboardTheme;
}

export interface SprintRankingNotificationInfo {
  id: string;
  type: RankingNotificationType;
  title: string;
  message: string;
  recipients: string[];
  entityId?: string;
  periodId?: string;
  sentAt?: Date;
  scheduledFor?: Date;
  metadata?: any;
}

export interface RankingFilters {
  type?: SprintRankingType[];
  status?: SprintRankingStatus[];
  entityType?: RankingEntityType[];
  entityId?: string;
  rankedById?: string;
  cohortId?: string;
  periodId?: string;
  criteriaId?: string;
  rankRange?: {
    min: number;
    max: number;
  };
  scoreRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  trend?: RankingTrend[];
  tier?: RankingTier[];
  hasComments?: boolean;
  hasAttachments?: boolean;
  isPublic?: boolean;
}

export interface RankingSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "rank" | "score" | "createdAt" | "updatedAt" | "trend" | "change";
  sortOrder?: "asc" | "desc";
  filters?: RankingFilters;
  groupBy?: "entity" | "criteria" | "period" | "tier" | "date";
  includeHistory?: boolean;
  includeAnalytics?: boolean;
}

export interface CreateRankingData {
  type: SprintRankingType;
  entityId: string;
  entityType: RankingEntityType;
  periodId: string;
  criteriaScores: CreateRankingCriteriaScore[];
  overallComment?: string;
  reasoning?: string;
  confidence?: number;
  attachments?: string[];
  metadata?: any;
}

export interface CreateRankingCriteriaScore {
  criteriaId: string;
  score: number;
  rank?: number;
  comment?: string;
  reasoning?: string;
  confidence?: number;
  attachments?: string[];
}

export interface UpdateRankingData {
  criteriaScores?: UpdateRankingCriteriaScore[];
  overallComment?: string;
  reasoning?: string;
  confidence?: number;
  attachments?: string[];
  metadata?: any;
}

export interface UpdateRankingCriteriaScore {
  criteriaId: string;
  score?: number;
  rank?: number;
  comment?: string;
  reasoning?: string;
  confidence?: number;
  attachments?: string[];
}

export interface CreateRankingPeriodData {
  name: string;
  description?: string;
  type: SprintRankingType;
  cohortId: string;
  startDate: Date;
  endDate: Date;
  criteria: CreateRankingCriteriaData[];
  settings: RankingPeriodSettings;
  leaderboard: LeaderboardSettings;
  notifications: RankingNotificationSettings;
  metadata?: any;
}

export interface CreateRankingCriteriaData {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  scoreType: RankingScoreType;
  category: RankingCriteriaCategory;
  isRequired: boolean;
  helpText?: string;
  examples?: string[];
  benchmarks?: RankingBenchmark[];
  validation?: RankingCriteriaValidation;
  icon?: string;
  color?: string;
}

export interface RankingPeriodSettings {
  allowSelfRanking: boolean;
  allowMultipleRankings: boolean;
  requireReasoning: boolean;
  requireConfidence: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
  enableHistory: boolean;
  enableRealTimeUpdates: boolean;
  enableTrendAnalysis: boolean;
  anonymizeResults: boolean;
  maxRankingsPerEntity?: number;
  minRankingsRequired?: number;
  autoCalculatePercentiles: boolean;
  weightedScoring: boolean;
  restrictions?: RankingRestriction[];
}

export interface RankingRestriction {
  type: RankingRestrictionType;
  value: string;
  reason?: string;
}

export interface RankingNotificationSettings {
  notifyOnPeriodStart: boolean;
  notifyOnPeriodEnd: boolean;
  notifyOnRankChange: boolean;
  notifyOnAchievement: boolean;
  notifyOnLeaderboardUpdate: boolean;
  reminderSchedule: RankingReminderSchedule[];
  customNotifications: CustomRankingNotification[];
}

export interface RankingReminderSchedule {
  type: RankingReminderType;
  timeBeforeEnd: number;
  message?: string;
  recipients?: string[];
}

export interface CustomRankingNotification {
  trigger: RankingNotificationTrigger;
  message: string;
  recipients: string[];
  delay?: number;
  conditions?: RankingNotificationCondition[];
}

export interface RankingNotificationCondition {
  field: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "in";
  value: any;
}

export interface RankingStats {
  totalRankings: number;
  totalEntities: number;
  totalRankers: number;
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: RankingScoreDistribution[];
  rankDistribution: RankingRankDistribution[];
  criteriaStats: RankingCriteriaStats[];
  entityStats: RankingEntityStats[];
  rankerStats: RankingRankerStats[];
  trendAnalysis: RankingTrendAnalysis;
}

export interface RankingScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface RankingRankDistribution {
  tier: RankingTier;
  count: number;
  percentage: number;
}

export interface RankingCriteriaStats {
  criteriaId: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    category: RankingCriteriaCategory;
  };
  totalRankings: number;
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  reliability: number;
  discrimination: number;
  difficulty: number;
}

export interface RankingEntityStats {
  entityId: string;
  entity: {
    id: string;
    name: string;
    type: RankingEntityType;
  };
  totalRankings: number;
  averageRank: number;
  bestRank: number;
  currentRank: number;
  averageScore: number;
  highestScore: number;
  currentScore: number;
  trend: RankingTrend;
  consistency: number;
  improvement: number;
  volatility: number;
}

export interface RankingRankerStats {
  rankerId: string;
  ranker: {
    id: string;
    name: string;
    image?: string;
  };
  totalRankings: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  consistency: number;
  reliability: number;
  bias: number;
  harshness: number;
  speed: number;
}

export interface RankingTrendAnalysis {
  overall: {
    direction: RankingTrend;
    strength: number;
    confidence: number;
  };
  byEntity: {
    entityId: string;
    trend: RankingTrend;
    strength: number;
    velocity: number;
    acceleration: number;
  }[];
  byCriteria: {
    criteriaId: string;
    trend: RankingTrend;
    strength: number;
    correlation: number;
  }[];
  seasonality: {
    period: string;
    amplitude: number;
    phase: number;
  }[];
}

export interface RankingAnalytics {
  performanceMetrics: {
    entityId: string;
    metrics: {
      currentRank: number;
      previousRank: number;
      rankChange: number;
      currentScore: number;
      previousScore: number;
      scoreChange: number;
      trend: RankingTrend;
      momentum: number;
      volatility: number;
    };
  }[];
  competitiveAnalysis: {
    entityId: string;
    analysis: {
      tier: RankingTier;
      position: number;
      marketShare: number;
      competitiveGap: number;
      threats: string[];
      opportunities: string[];
    };
  }[];
  correlationMatrix: {
    criteria1: string;
    criteria2: string;
    correlation: number;
    significance: number;
  }[];
  benchmarkAnalysis: {
    criteriaId: string;
    benchmarks: {
      level: RankingBenchmarkLevel;
      threshold: number;
      entities: string[];
      percentage: number;
    }[];
  }[];
  predictiveInsights: {
    entityId: string;
    predictions: {
      timeframe: string;
      predictedRank: number;
      confidence: number;
      factors: string[];
    }[];
  }[];
}

export interface RankingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canSubmit: boolean;
  missingCriteria: string[];
  invalidScores: string[];
  duplicateRanks: string[];
  recommendations: string[];
}

export interface RankingDashboardData {
  ranking: SprintRankingWithRelations;
  period: SprintRankingPeriodWithRelations;
  leaderboard: SprintLeaderboardInfo;
  stats: RankingStats;
  analytics: RankingAnalytics;
  results: SprintRankingResultInfo[];
  recentActivity: RankingActivity[];
  achievements: RankingAchievement[];
  badges: RankingBadge[];
  canRank: boolean;
  hasRanked: boolean;
  canEdit: boolean;
  permissions: RankingPermissions;
}

export interface RankingActivity {
  id: string;
  type: RankingActivityType;
  description: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  entityId?: string;
  entity?: {
    id: string;
    name: string;
    type: RankingEntityType;
  };
  periodId?: string;
  metadata?: any;
  createdAt: Date;
}

export interface RankingBulkAction {
  action: RankingBulkActionType;
  rankingIds: string[];
  data?: any;
  reason?: string;
  performedBy: string;
}

export interface RankingExport {
  rankings: SprintRankingWithRelations[];
  results: SprintRankingResultInfo[];
  leaderboard: SprintLeaderboardInfo;
  stats: RankingStats;
  analytics: RankingAnalytics;
  exportedAt: Date;
  exportedBy: string;
  format: RankingExportFormat;
}

export interface RankingImport {
  rankings: CreateRankingData[];
  preserveRankers: boolean;
  preserveTimestamps: boolean;
  entityMapping?: Record<string, string>;
  userMapping?: Record<string, string>;
  criteriaMapping?: Record<string, string>;
}

export interface RankingPermissions {
  canRank: boolean;
  canViewRankings: boolean;
  canViewResults: boolean;
  canViewLeaderboard: boolean;
  canComment: boolean;
  canAttach: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canViewAnalytics: boolean;
  canManagePeriod: boolean;
  canViewHistory: boolean;
  canViewCompetitors: boolean;
}

export interface RankingAuditLog {
  id: string;
  action: RankingAuditAction;
  entityType: RankingAuditEntityType;
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
export type RankingEntityType = "TEAM" | "USER" | "PROJECT" | "STORY" | "TASK" | "COHORT";

export type RankingScoreType = "NUMERIC" | "STAR" | "PERCENTAGE" | "SCALE" | "RANKING" | "TIER";

export type RankingCriteriaCategory = "PERFORMANCE" | "QUALITY" | "COLLABORATION" | "INNOVATION" | "TECHNICAL" | "COMMUNICATION" | "LEADERSHIP" | "LEARNING";

export type RankingBenchmarkLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "MASTER";

export type RankingSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";

export type RankingReactionType = "LIKE" | "LOVE" | "IMPRESSIVE" | "INSIGHTFUL" | "DISAGREE" | "CONFUSED" | "MOTIVATING";

export type RankingHistoryAction = "CREATED" | "UPDATED" | "RANK_CHANGED" | "SCORE_CHANGED" | "COMMENT_ADDED" | "ACHIEVEMENT_EARNED";

export type RankingTrend = "IMPROVING" | "DECLINING" | "STABLE" | "VOLATILE" | "RISING" | "FALLING";

export type RankingTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "IRON" | "UNRANKED";

export type RankingAchievementType = "PERFORMANCE" | "IMPROVEMENT" | "CONSISTENCY" | "MILESTONE" | "SPECIAL" | "STREAK";

export type RankingAchievementLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "LEGENDARY";

export type RankingBadgeType = "CURRENT" | "HISTORICAL" | "SPECIAL" | "SEASONAL" | "LIMITED" | "PERMANENT";

export type RankingBadgeLevel = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "LEGENDARY";

export type LeaderboardType = "OVERALL" | "CRITERIA" | "CATEGORY" | "PERIOD" | "CUSTOM";

export type LeaderboardScope = "GLOBAL" | "COHORT" | "TEAM" | "INDIVIDUAL";

export type LeaderboardTimeframe = "CURRENT" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ALL_TIME";

export type LeaderboardTheme = "DEFAULT" | "DARK" | "LIGHT" | "COLORFUL" | "MINIMAL" | "CORPORATE";

export type RankingNotificationType = "period_started" | "period_ending" | "period_ended" | "rank_changed" | "achievement_earned" | "leaderboard_updated" | "reminder";

export type RankingRestrictionType = "EXCLUDE_ENTITY" | "EXCLUDE_USER" | "REQUIRE_ROLE" | "REQUIRE_PERMISSION" | "MINIMUM_EXPERIENCE";

export type RankingReminderType = "DAILY" | "WEEKLY" | "HOURLY" | "CUSTOM";

export type RankingNotificationTrigger = "RANKING_SUBMITTED" | "PERIOD_STARTED" | "PERIOD_ENDED" | "RANK_CHANGED" | "ACHIEVEMENT_EARNED" | "THRESHOLD_REACHED";

export type RankingActivityType = 
  | "ranking_submitted"
  | "ranking_updated"
  | "ranking_deleted"
  | "rank_changed"
  | "achievement_earned"
  | "badge_awarded"
  | "comment_added"
  | "attachment_added"
  | "period_started"
  | "period_ended"
  | "leaderboard_updated"
  | "criteria_added"
  | "criteria_updated"
  | "criteria_removed";

export type RankingBulkActionType = "approve" | "reject" | "delete" | "export" | "notify" | "recalculate";

export type RankingExportFormat = "CSV" | "EXCEL" | "JSON" | "PDF" | "CHART" | "LEADERBOARD";

export type RankingAuditAction = "CREATE" | "UPDATE" | "DELETE" | "SUBMIT" | "EXPORT" | "VIEW" | "CALCULATE";

export type RankingAuditEntityType = "RANKING" | "PERIOD" | "CRITERIA" | "COMMENT" | "ATTACHMENT" | "RESULT" | "LEADERBOARD";

export const RANKING_SCORE_RANGES = {
  NUMERIC: { min: 0, max: 100 },
  STAR: { min: 1, max: 5 },
  PERCENTAGE: { min: 0, max: 100 },
  SCALE: { min: 1, max: 10 },
  RANKING: { min: 1, max: 999 },
  TIER: { min: 1, max: 6 }
} as const;

export const RANKING_TIER_THRESHOLDS = {
  PLATINUM: 95,
  GOLD: 85,
  SILVER: 70,
  BRONZE: 55,
  IRON: 40,
  UNRANKED: 0
} as const;

export const RANKING_ACHIEVEMENT_THRESHOLDS = {
  TOP_PERFORMER: 95,
  HIGH_ACHIEVER: 85,
  CONSISTENT_PERFORMER: 75,
  IMPROVING_PERFORMER: 65,
  STEADY_PERFORMER: 55
} as const;

export const RANKING_TREND_THRESHOLDS = {
  STRONG_IMPROVEMENT: 0.8,
  MODERATE_IMPROVEMENT: 0.5,
  STABLE: 0.2,
  MODERATE_DECLINE: -0.5,
  STRONG_DECLINE: -0.8
} as const;

export const RANKING_RELIABILITY_METRICS = {
  INTER_RATER: 0.7,
  CONSISTENCY: 0.8,
  STABILITY: 0.75,
  VALIDITY: 0.85
} as const;

export const RANKING_VALIDATION_RULES = {
  score: {
    required: true,
    numeric: true,
    withinRange: true
  },
  rank: {
    required: false,
    numeric: true,
    unique: true,
    sequential: false
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

export const RANKING_WEIGHT_DEFAULTS = {
  PERFORMANCE: 0.3,
  QUALITY: 0.25,
  COLLABORATION: 0.2,
  INNOVATION: 0.15,
  TECHNICAL: 0.1
} as const;

export const RANKING_CONFIDENCE_LEVELS = {
  VERY_HIGH: 0.9,
  HIGH: 0.8,
  MEDIUM: 0.7,
  LOW: 0.6,
  VERY_LOW: 0.5
} as const;
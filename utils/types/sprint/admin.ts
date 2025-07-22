// types/sprint/admin.ts
// import { SprintAdmin, SprintAdminRole, SprintAdminStatus, SprintAdminPermission } from "@prisma/client";

export enum SprintAdminRole {
  SKILLUP_TEAM = "SKILLUP_TEAM",   // maps: user.isSkillUpTeam
  SPRINT_ADMIN = "SPRINT_ADMIN",   // maps: user.isSprintAdmin
  COHORT_ADMIN = "COHORT_ADMIN",   // future finer-grain
  TEAM_ADMIN = "TEAM_ADMIN",       // future
  VIEW_ONLY  = "VIEW_ONLY",        // future
  CUSTOM     = "CUSTOM",
}

export enum SprintAdminStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  REVOKED = "REVOKED",
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
}

export enum SprintAdminPermission {
  MANAGE_SPRINTS = "MANAGE_SPRINTS",
  MANAGE_COHORTS = "MANAGE_COHORTS",
  MANAGE_TEAMS = "MANAGE_TEAMS",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_PERMISSIONS = "MANAGE_PERMISSIONS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  VIEW_AUDIT = "VIEW_AUDIT",
  EXPORT_DATA = "EXPORT_DATA",
  CUSTOM = "CUSTOM",
}

// ---- Base admin record (domain, not persisted) ----
// In your current DB, 'admin-ness' lives on User, so this is a virtual projection.
export interface SprintAdmin {
  id: string;                 // use userId as id for now
  userId: string;
  role: SprintAdminRole;
  status: SprintAdminStatus;
  permissions: SprintAdminPermission[];
  grantedById?: string | null; // maps to User.grantedBy
  grantedAt?: Date | null;     // maps to User.grantedAt
  expiresAt?: Date | null;
  metadata?: any;
  createdAt: Date;             // use User.createdAt
  updatedAt: Date;             // use User.updatedAt
}

export interface SprintAdminWithRelations {
  id: string;                 // use userId as id for now
  userId: string;
  role: SprintAdminRole;
  status: SprintAdminStatus;
  permissions: SprintAdminPermissionInfo[]; // Use the correct type for relations
  grantedById?: string | null;
  grantedAt?: Date | null;
  expiresAt?: Date | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    timezone?: string;
    lastLoginAt?: Date;
    createdAt: Date;
  };
  assignedBy: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  cohorts: AdminCohortInfo[];
  teams: AdminTeamInfo[];
  roles: SprintAdminRoleInfo[];
  activities: AdminActivityInfo[];
  sessions: AdminSessionInfo[];
  notifications: AdminNotificationInfo[];
  auditLogs: AdminAuditLogInfo[];
  delegations: AdminDelegationInfo[];
  _count: {
    cohorts: number;
    teams: number;
    permissions: number;
    activities: number;
    sessions: number;
    notifications: number;
    auditLogs: number;
    delegations: number;
  };
}

export interface AdminCohortInfo {
  id: string;
  name: string;
  description?: string;
  status: CohortStatus;
  memberCount: number;
  teamCount: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
//   permissions: AdminCohortPermission[];
  metadata?: any;
}

export interface AdminTeamInfo {
  id: string;
  name: string;
  description?: string;
  cohortId: string;
  cohort: {
    id: string;
    name: string;
  };
  memberCount: number;
  status: TeamStatus;
  leaderId?: string;
  leader?: {
    id: string;
    name: string;
    image?: string;
  };
  permissions: AdminTeamPermission[];
  metadata?: any;
}

// Add missing type definition for AdminTeamPermission
export type AdminTeamPermission =
  | "MANAGE_TEAM"
  | "VIEW_TEAM"
  | "ADD_MEMBER"
  | "REMOVE_MEMBER"
  | "ASSIGN_LEADER"
  | "EDIT_TEAM"
  | "DELETE_TEAM"
  | "VIEW_REPORTS";

export interface SprintAdminPermissionInfo {
  id: string;
  permission: SprintAdminPermission;
  resourceType: AdminResourceType;
  resourceId?: string;
  resource?: {
    id: string;
    name: string;
    type: AdminResourceType;
  };
  scope: AdminPermissionScope;
  conditions?: AdminPermissionCondition[];
  grantedAt: Date;
  expiresAt?: Date;
  grantedBy: {
    id: string;
    name: string;
    image?: string;
  };
  isActive: boolean;
  metadata?: any;
}

export interface SprintAdminRoleInfo {
  id: string;
  role: SprintAdminRole;
  name: string;
  description: string;
  level: AdminRoleLevel;
  permissions: SprintAdminPermission[];
  scope: AdminRoleScope;
  isSystemRole: boolean;
  isCustomRole: boolean;
  inheritedFrom?: string;
  assignedAt: Date;
  expiresAt?: Date;
  assignedBy: {
    id: string;
    name: string;
    image?: string;
  };
  metadata?: any;
}

export interface AdminActivityInfo {
  id: string;
  type: AdminActivityType;
  action: AdminAction;
  description: string;
  resourceType: AdminResourceType;
  resourceId?: string;
  resource?: {
    id: string;
    name: string;
    type: AdminResourceType;
  };
  targetUserId?: string;
  targetUser?: {
    id: string;
    name: string;
    image?: string;
  };
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  status: AdminActivityStatus;
  createdAt: Date;
  metadata?: any;
}

export interface AdminSessionInfo {
  id: string;
  sessionToken: string;
  device: string;
  browser: string;
  platform: string;
  ipAddress: string;
  location?: string;
  isActive: boolean;
  isCurrent: boolean;
  startedAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  endedAt?: Date;
  metadata?: any;
}

export interface AdminNotificationInfo {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  priority: AdminNotificationPriority;
  category: AdminNotificationCategory;
  resourceType?: AdminResourceType;
  resourceId?: string;
  resource?: {
    id: string;
    name: string;
    type: AdminResourceType;
  };
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  isArchived: boolean;
  readAt?: Date;
  archivedAt?: Date;
  sentAt: Date;
  expiresAt?: Date;
  metadata?: any;
}

export interface AdminAuditLogInfo {
  id: string;
  action: AdminAuditAction;
  entityType: AdminAuditEntityType;
  entityId: string;
  entity?: {
    id: string;
    name: string;
    type: AdminAuditEntityType;
  };
  previousValues?: any;
  newValues?: any;
  affectedFields: string[];
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
  metadata?: any;
}

export interface AdminDelegationInfo {
  id: string;
  delegateTo: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  permissions: SprintAdminPermission[];
  scope: AdminDelegationScope;
  resourceType?: AdminResourceType;
  resourceId?: string;
  resource?: {
    id: string;
    name: string;
    type: AdminResourceType;
  };
  reason?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedBy?: {
    id: string;
    name: string;
  };
  metadata?: any;
}

export interface AdminPermissionCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "nin" | "contains" | "startsWith" | "endsWith";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface AdminFilters {
  role?: SprintAdminRole[];
  status?: SprintAdminStatus[];
  permission?: SprintAdminPermission[];
  cohortId?: string;
  teamId?: string;
  resourceType?: AdminResourceType[];
  resourceId?: string;
  isActive?: boolean;
  hasActiveSessions?: boolean;
  lastLoginRange?: {
    start: Date;
    end: Date;
  };
  createdRange?: {
    start: Date;
    end: Date;
  };
  permissionScope?: AdminPermissionScope[];
  roleLevel?: AdminRoleLevel[];
}

export interface AdminSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "role" | "status" | "lastLogin" | "createdAt" | "permissions";
  sortOrder?: "asc" | "desc";
  filters?: AdminFilters;
  groupBy?: "role" | "status" | "cohort" | "team" | "permission";
  includeInactive?: boolean;
  includeAuditLogs?: boolean;
  includeActivities?: boolean;
}

export interface CreateAdminData {
  userId: string;
  role: SprintAdminRole;
  status: SprintAdminStatus;
  permissions: CreateAdminPermission[];
  cohortIds?: string[];
  teamIds?: string[];
  expiresAt?: Date;
  reason?: string;
  notifyUser?: boolean;
  metadata?: any;
}

export interface CreateAdminPermission {
  permission: SprintAdminPermission;
  resourceType: AdminResourceType;
  resourceId?: string;
  scope: AdminPermissionScope;
  conditions?: AdminPermissionCondition[];
  expiresAt?: Date;
}

export interface UpdateAdminData {
  role?: SprintAdminRole;
  status?: SprintAdminStatus;
  permissions?: UpdateAdminPermission[];
  cohortIds?: string[];
  teamIds?: string[];
  expiresAt?: Date;
  reason?: string;
  notifyUser?: boolean;
  metadata?: any;
}

export interface UpdateAdminPermission {
  id?: string;
  permission: SprintAdminPermission;
  resourceType: AdminResourceType;
  resourceId?: string;
  scope: AdminPermissionScope;
  conditions?: AdminPermissionCondition[];
  expiresAt?: Date;
  action?: "add" | "update" | "remove";
}

export interface CreateAdminRoleData {
  name: string;
  description: string;
  level: AdminRoleLevel;
  permissions: SprintAdminPermission[];
  scope: AdminRoleScope;
  isSystemRole: boolean;
  inheritFrom?: string;
  conditions?: AdminPermissionCondition[];
  metadata?: any;
}

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  adminsByRole: AdminRoleStats[];
  adminsByStatus: AdminStatusStats[];
  adminsByPermission: AdminPermissionStats[];
  adminsByCohort: AdminCohortStats[];
  recentActivities: AdminActivitySummary[];
  sessionStats: AdminSessionStats;
  permissionUsage: AdminPermissionUsage[];
  delegationStats: AdminDelegationStats;
  auditSummary: AdminAuditSummary;
}

export interface AdminRoleStats {
  role: SprintAdminRole;
  count: number;
  percentage: number;
  activeCount: number;
  inactiveCount: number;
}

export interface AdminStatusStats {
  status: SprintAdminStatus;
  count: number;
  percentage: number;
  trend: AdminTrend;
}

export interface AdminPermissionStats {
  permission: SprintAdminPermission;
  count: number;
  percentage: number;
  byRole: {
    role: SprintAdminRole;
    count: number;
  }[];
  byScope: {
    scope: AdminPermissionScope;
    count: number;
  }[];
}

export interface AdminCohortStats {
  cohortId: string;
  cohort: {
    id: string;
    name: string;
  };
  adminCount: number;
  roleDistribution: {
    role: SprintAdminRole;
    count: number;
  }[];
}

export interface AdminActivitySummary {
  type: AdminActivityType;
  count: number;
  lastActivity: Date;
  trend: AdminTrend;
}

export interface AdminSessionStats {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  deviceDistribution: {
    device: string;
    count: number;
    percentage: number;
  }[];
  locationDistribution: {
    location: string;
    count: number;
    percentage: number;
  }[];
}

export interface AdminPermissionUsage {
  permission: SprintAdminPermission;
  usageCount: number;
  lastUsed: Date;
  frequency: AdminUsageFrequency;
  byResource: {
    resourceType: AdminResourceType;
    count: number;
  }[];
}

export interface AdminDelegationStats {
  totalDelegations: number;
  activeDelegations: number;
  expiredDelegations: number;
  revokedDelegations: number;
  mostDelegatedPermissions: {
    permission: SprintAdminPermission;
    count: number;
  }[];
}

export interface AdminAuditSummary {
  totalActions: number;
  actionsByType: {
    action: AdminAuditAction;
    count: number;
  }[];
  recentActions: AdminAuditLogInfo[];
  suspiciousActivities: AdminSuspiciousActivity[];
}

export interface AdminSuspiciousActivity {
  id: string;
  type: AdminSuspiciousActivityType;
  description: string;
  adminId: string;
  admin: {
    id: string;
    name: string;
  };
  severity: AdminSeverityLevel;
  indicators: string[];
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AdminAnalytics {
  performanceMetrics: {
    adminId: string;
    metrics: {
      activityCount: number;
      sessionCount: number;
      averageSessionDuration: number;
      lastActivity: Date;
      permissionUsage: number;
      delegationCount: number;
      auditScore: number;
    };
  }[];
  roleEffectiveness: {
    role: SprintAdminRole;
    effectiveness: number;
    activityLevel: AdminActivityLevel;
    permissionUtilization: number;
    delegationRate: number;
  }[];
  permissionHeatmap: {
    permission: SprintAdminPermission;
    usage: number;
    trend: AdminTrend;
    hotspots: string[];
  }[];
  securityMetrics: {
    failedLogins: number;
    suspiciousActivities: number;
    permissionEscalations: number;
    unauthorizedAccess: number;
    dataExposure: number;
  };
  complianceReport: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    violations: AdminComplianceViolation[];
    recommendations: string[];
  };
}

export interface AdminComplianceViolation {
  id: string;
  type: AdminComplianceType;
  description: string;
  severity: AdminSeverityLevel;
  adminId: string;
  admin: {
    id: string;
    name: string;
  };
  resourceType: AdminResourceType;
  resourceId?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: AdminComplianceStatus;
  actions: string[];
}

export interface AdminValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canAssign: boolean;
  conflictingPermissions: string[];
  missingPrerequisites: string[];
  recommendations: string[];
}

export interface AdminDashboardData {
  admin: SprintAdminWithRelations;
  stats: AdminStats;
  analytics: AdminAnalytics;
  recentActivities: AdminActivityInfo[];
  notifications: AdminNotificationInfo[];
  sessions: AdminSessionInfo[];
  delegations: AdminDelegationInfo[];
  auditLogs: AdminAuditLogInfo[];
  permissions: AdminPermissionSummary;
  canManage: boolean;
  canDelegate: boolean;
  canViewAudit: boolean;
  isOwner: boolean;
  isSuperAdmin: boolean;
}

export interface AdminPermissionSummary {
  granted: SprintAdminPermission[];
  effective: SprintAdminPermission[];
  inherited: SprintAdminPermission[];
  delegated: SprintAdminPermission[];
  expired: SprintAdminPermission[];
  restricted: SprintAdminPermission[];
  byResource: {
    resourceType: AdminResourceType;
    permissions: SprintAdminPermission[];
  }[];
}

export interface AdminBulkAction {
  action: AdminBulkActionType;
  adminIds: string[];
  data?: any;
  reason?: string;
  performedBy: string;
  notifyUsers?: boolean;
}

export interface AdminExport {
  admins: SprintAdminWithRelations[];
  stats: AdminStats;
  analytics: AdminAnalytics;
  auditLogs: AdminAuditLogInfo[];
  exportedAt: Date;
  exportedBy: string;
  format: AdminExportFormat;
  filters?: AdminFilters;
}

export interface AdminImport {
  admins: CreateAdminData[];
  preserveIds: boolean;
  updateExisting: boolean;
  notifyUsers: boolean;
  userMapping?: Record<string, string>;
  cohortMapping?: Record<string, string>;
  teamMapping?: Record<string, string>;
}

export interface AdminAuditSettings {
  enableAuditLogging: boolean;
  retentionDays: number;
  logLevel: AdminAuditLogLevel;
  sensitiveActions: AdminAuditAction[];
  alertThresholds: AdminAuditThreshold[];
  anonymizeData: boolean;
  exportEnabled: boolean;
  realTimeMonitoring: boolean;
}

export interface AdminAuditThreshold {
  action: AdminAuditAction;
  count: number;
  timeWindow: number;
  severity: AdminSeverityLevel;
  notify: boolean;
  block: boolean;
}

export interface AdminSecuritySettings {
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxConcurrentSessions: number;
  passwordPolicy: AdminPasswordPolicy;
  ipWhitelist: string[];
  allowedDevices: string[];
  suspiciousActivityDetection: boolean;
  autoLockAccount: boolean;
  permissionEscalationAlert: boolean;
}

export interface AdminPasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
  expirationDays: number;
}

// Type definitions for enums and unions
export type CohortStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DRAFT";
export type TeamStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "SUSPENDED";
export type AdminResourceType = "COHORT" | "TEAM" | "USER" | "RANKING" | "ADMIN" | "SYSTEM" | "REPORT" | "AUDIT";
export type AdminPermissionScope = "GLOBAL" | "COHORT" | "TEAM" | "USER" | "RESOURCE" | "LIMITED";
export type AdminRoleLevel = "SYSTEM" | "SUPER" | "ADMIN" | "MANAGER" | "MODERATOR" | "ASSISTANT";
export type AdminRoleScope = "GLOBAL" | "COHORT" | "TEAM" | "LIMITED";
export type AdminActivityType = "LOGIN" | "LOGOUT" | "PERMISSION_CHANGE" | "ROLE_CHANGE" | "DELEGATION" | "AUDIT" | "SYSTEM";
export type AdminAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "ASSIGN" | "REVOKE" | "EXPORT" | "IMPORT" | "MANAGE";
export type AdminActivityStatus = "SUCCESS" | "FAILED" | "PENDING" | "BLOCKED" | "SUSPICIOUS";
export type AdminNotificationType = "SECURITY" | "PERMISSION" | "ROLE" | "AUDIT" | "DELEGATION" | "SYSTEM" | "ALERT";
export type AdminNotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
export type AdminNotificationCategory = "SECURITY" | "COMPLIANCE" | "SYSTEM" | "USER" | "PERMISSION" | "AUDIT";
export type AdminAuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PERMISSION_GRANT" | "PERMISSION_REVOKE" | "ROLE_ASSIGN" | "ROLE_REMOVE" | "DELEGATE" | "EXPORT" | "IMPORT" | "VIEW" | "MANAGE";
export type AdminAuditEntityType = "ADMIN" | "USER" | "COHORT" | "TEAM" | "PERMISSION" | "ROLE" | "DELEGATION" | "SYSTEM";
export type AdminDelegationScope = "FULL" | "LIMITED" | "TEMPORARY" | "CONDITIONAL";
export type AdminTrend = "INCREASING" | "DECREASING" | "STABLE" | "VOLATILE";
export type AdminUsageFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "RARELY" | "NEVER";
export type AdminSuspiciousActivityType = "UNUSUAL_ACCESS" | "PERMISSION_ESCALATION" | "BULK_OPERATIONS" | "OFF_HOURS" | "LOCATION_ANOMALY" | "FAILED_ATTEMPTS";
export type AdminSeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "EMERGENCY";
export type AdminActivityLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
export type AdminComplianceType = "PERMISSION_VIOLATION" | "ROLE_CONFLICT" | "UNAUTHORIZED_ACCESS" | "DATA_EXPOSURE" | "POLICY_VIOLATION";
export type AdminComplianceStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED" | "ESCALATED";
export type AdminBulkActionType = "ACTIVATE" | "DEACTIVATE" | "ASSIGN_ROLE" | "REMOVE_ROLE" | "GRANT_PERMISSION" | "REVOKE_PERMISSION" | "EXPORT" | "DELETE" | "NOTIFY";
export type AdminExportFormat = "CSV" | "EXCEL" | "JSON" | "PDF" | "AUDIT_REPORT";
export type AdminAuditLogLevel = "BASIC" | "DETAILED" | "COMPREHENSIVE" | "MINIMAL";

// Constants
export const ADMIN_ROLE_HIERARCHY = {
  SYSTEM: 100,
  SUPER: 90,
  ADMIN: 80,
  MANAGER: 70,
  MODERATOR: 60,
  ASSISTANT: 50
} as const;

export const ADMIN_PERMISSION_MATRIX = {
  SYSTEM: ["ALL"],
  SUPER: ["MANAGE_ADMINS", "MANAGE_COHORTS", "MANAGE_TEAMS", "MANAGE_USERS", "VIEW_AUDIT", "EXPORT_DATA"],
  ADMIN: ["MANAGE_COHORTS", "MANAGE_TEAMS", "MANAGE_USERS", "VIEW_AUDIT"],
  MANAGER: ["MANAGE_TEAMS", "MANAGE_USERS", "VIEW_REPORTS"],
  MODERATOR: ["MANAGE_USERS", "VIEW_REPORTS"],
  ASSISTANT: ["VIEW_USERS", "VIEW_REPORTS"]
} as const;

export const ADMIN_SECURITY_DEFAULTS = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CONCURRENT_SESSIONS: 5,
  PASSWORD_MIN_LENGTH: 8,
  AUDIT_RETENTION_DAYS: 365,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 5,
  FAILED_LOGIN_THRESHOLD: 3
} as const;

export const ADMIN_NOTIFICATION_SETTINGS = {
  SECURITY_ALERTS: true,
  PERMISSION_CHANGES: true,
  ROLE_CHANGES: true,
  AUDIT_ALERTS: true,
  DELEGATION_ALERTS: true,
  SYSTEM_ALERTS: true
} as const;

export const ADMIN_VALIDATION_RULES = {
  email: {
    required: true,
    format: "email"
  },
  role: {
    required: true,
    validRole: true
  },
  permissions: {
    validPermissions: true,
    noConflicts: true
  },
  delegation: {
    validDuration: true,
    authorizedPermissions: true
  }
} as const;
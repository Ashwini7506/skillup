// app/(protected)/workspace/[workspaceId]/sprint/admin/page.tsx
import { getCurrentUserServer } from '@/lib/get-current-user';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AdminDashboard from '@/components/sprint/admin/AdminDashboard';
import { SprintHub } from '@/components/sprint/SprintHub';
import { cache } from 'react';
import { getSprintLandingData } from '@/lib/sprint/get-sprint-landing-data';
import { SKILLUP_TEAM_USER_ID } from '@/lib/skillup-config';
// import { SKILLUP_TEAM_USER_ID } from '@/config/skillup-config';

interface AdminPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

// Function to check if user is a SkillUp team member (admin)
const isSkillUpTeamMember = (userId: string): boolean => {
  return SKILLUP_TEAM_USER_ID.includes(userId);
};

// Cache the admin data fetching
const getWorkspaceAdminData = cache(async (workspaceId: string, userId: string) => {
  // Get workspace details
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      description: true
    }
  });

  if (!workspace) {
    return null;
  }

  // Get workspace projects to find related sprint cohorts
  const workspaceProjects = await db.project.findMany({
    where: { workspaceId },
    select: { id: true }
  });

  const projectIds = workspaceProjects.map(p => p.id);

  // Use Promise.all for parallel queries
  const [cohorts, totalMembers] = await Promise.all([
    db.sprintCohort.findMany({
      where: {
        workspaceId: workspaceId // Use the new workspaceId field directly
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            teams: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    db.workspaceMember.count({
      where: { workspaceId }
    })
  ]);

  // Get active enrollments for cohorts related to this workspace
  const cohortIds = cohorts.map(c => c.id);
  const activeEnrollments = cohortIds.length > 0 ? await db.sprintEnrollment.count({
    where: {
      cohortId: {
        in: cohortIds
      },
      cohort: {
        activated: true
      }
    }
  }) : 0;

  const activeCohorts = cohorts.filter(c => c.activated);
  const totalTeams = cohorts.reduce((sum, c) => sum + c._count.teams, 0);

  return {
    workspace,
    overviewData: {
      totalMembers,
      activeEnrollments,
      activeCohorts: activeCohorts.length,
      totalTeams,
      recentCohorts: cohorts.map(c => ({
        id: c.id,
        name: c.name,
        activated: c.activated,
        enrollmentCount: c._count.enrollments,
        teamCount: c._count.teams,
        startDate: c.startDate,
        endDate: c.endDate
      }))
    }
  };
});

export default async function AdminPage({ params }: AdminPageProps) {
  const resolvedParams = await params;
  const user = await getCurrentUserServer();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Debug logging (remove in production)
  console.log('Current user ID:', user.id);
  console.log('SkillUp team IDs:', SKILLUP_TEAM_USER_ID);
  console.log('Is user in SkillUp team:', SKILLUP_TEAM_USER_ID.includes(user.id));

  // Check if user is a SkillUp team member (admin)
  const hasAdminAccess = isSkillUpTeamMember(user.id);
  console.log('Has admin access:', hasAdminAccess);

  // If user is a SkillUp team member, show admin dashboard
  if (hasAdminAccess) {
    const adminData = await getWorkspaceAdminData(resolvedParams.workspaceId, user.id);
    
    if (!adminData) {
      redirect(`/workspace/${resolvedParams.workspaceId}`);
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sprint Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage sprint cohorts, teams, and participants for {adminData.workspace.name}
          </p>
        </div>
        
        <AdminDashboard
          workspaceId={resolvedParams.workspaceId}
          workspaceName={adminData.workspace.name}
          overviewData={adminData.overviewData}
        />
      </div>
    );
  }

  // If user is not a SkillUp team member, show regular SprintHub
  try {
    const sprintData = await getSprintLandingData(user.id);
    
    // Add the user object to satisfy SprintLandingData type
    const sprintDataWithUser = {
      ...sprintData,
      user: user,
    };
    
    // Create hubState based on sprintData
    const hubState = {
      isEnrolled: !!sprintDataWithUser.enrollment,
      hasTeam: !!sprintDataWithUser.team,
      cohortStarted: sprintDataWithUser.cohort ? new Date(sprintDataWithUser.cohort.startDate) <= new Date() : false,
      cohortEnded: sprintDataWithUser.cohort ? new Date(sprintDataWithUser.cohort.endDate) < new Date() : false,
      canAccessStory: !!sprintDataWithUser.team && sprintDataWithUser.cohort ? new Date(sprintDataWithUser.cohort.startDate) <= new Date() : false,
      canAccessTeam: !!sprintDataWithUser.team,
      canAccessRanking: !!sprintDataWithUser.team && sprintDataWithUser.cohort ? new Date(sprintDataWithUser.cohort.startDate) <= new Date() : false,
      canAccessUploads: !!sprintDataWithUser.team && sprintDataWithUser.cohort ? new Date(sprintDataWithUser.cohort.startDate) <= new Date() : false
    };

    return (
      <SprintHub 
        data={sprintDataWithUser} 
        hubState={hubState} 
        workspaceId={resolvedParams.workspaceId}
        isAdmin={false} // Non-SkillUp team members don't see admin features
      />
    );
  } catch (error) {
    // If there's an error getting sprint data, redirect to main workspace
    console.error('Error fetching sprint data:', error);
    redirect(`/workspace/${resolvedParams.workspaceId}`);
  }
}
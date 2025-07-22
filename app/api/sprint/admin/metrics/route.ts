// app/api/sprint/admin/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { requireWorkspaceAdmin } from '@/lib/sprint/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Metrics API called');
    
    const user = await getCurrentUserServer();
    if (!user) {
      console.log('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const cohortId = searchParams.get('cohortId');

    console.log('Params:', { workspaceId, cohortId, userId: user.id });

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Check admin permissions
    try {
      await requireWorkspaceAdmin(user.id, workspaceId);
      console.log('Admin check passed');
    } catch (error) {
      console.log('Admin check failed:', error);
      return NextResponse.json({ error: 'Not authorized as workspace admin' }, { status: 403 });
    }

    // Build the where clause more carefully
    const whereClause = (cohortId && cohortId !== 'all') 
      ? { cohortId: cohortId }
      : {}; // Get all teams when cohortId is null or 'all'

    console.log('Fetching teams with where clause:', whereClause);

    // Get teams for the cohort
    const teams = await db.sprintTeam.findMany({
      where: whereClause,
      include: {
        cohort: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            tasks: {
              select: {
                id: true,
                status: true,
                updatedAt: true,
                attachments: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        },
        storyState: {
          select: {
            state: true,
            updatedAt: true
          }
        }
      }
    });

    console.log(`Found ${teams.length} teams`);

    if (teams.length === 0) {
      console.log('No teams found - returning empty result');
      return NextResponse.json({ 
        cohortMetrics: [],
        engagementData: [],
        roleDistribution: [],
        projectMetrics: [],
        summary: {
          totalParticipants: 0,
          activeTeams: 0,
          completedProjects: 0,
          averageEngagement: 0,
          retentionRate: 0
        }
      });
    }

    // Get votes for all teams
    const teamIds = teams.map(t => t.id);
    const votes = await db.sprintVote.findMany({
      where: {
        teamId: {
          in: teamIds
        }
      },
      select: {
        teamId: true,
        score: true,
        createdAt: true
      }
    });

    console.log(`Found ${votes.length} votes for teams`);

    // Get user details for team members
    const allMemberIds = teams.flatMap(t => t.members).filter(id => id); // Filter out null/undefined
    const users = allMemberIds.length > 0 ? await db.user.findMany({
      where: {
        id: {
          in: allMemberIds
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    }) : [];

    console.log(`Found ${users.length} users for ${allMemberIds.length} member IDs`);

    const userMap = new Map(users.map(u => [u.id, u]));

    // Calculate metrics for each team
    const teamMetrics = teams.map(team => {
      const teamVotes = votes.filter(v => v.teamId === team.id);
      const totalVotes = teamVotes.length;
      const avgVotes = totalVotes > 0 ? teamVotes.reduce((sum, v) => sum + v.score, 0) / totalVotes : 0;
      
      const totalTasks = team.project?.tasks.length || 0;
      const completedTasks = team.project?.tasks.filter(t => t.status === 'COMPLETED').length || 0;
      const inProgressTasks = team.project?.tasks.filter(t => t.status === 'IN_PROGRESS').length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const uploadsCount = team.project?.tasks.reduce((sum, task) => sum + (task.attachments?.length || 0), 0) || 0;
      
      // Story progress - safer parsing
      const storyState = team.storyState?.state || {};
      let introSeen = false;
      let currentChapter = 1;
      let completedSegments: any[] = [];
      
      try {
        if (typeof storyState === 'object' && storyState !== null) {
          introSeen = (storyState as any).introSeen || (storyState as any).seenIntro || false;
          currentChapter = (storyState as any).currentChapter || 1;
          completedSegments = (storyState as any).completedSegments || [];
        }
      } catch (error) {
        console.warn(`Error parsing story state for team ${team.id}:`, error);
      }
      
      // Last activity
      const lastTaskUpdate = team.project?.tasks.reduce((latest, task) => {
        return !latest || task.updatedAt > latest ? task.updatedAt : latest;
      }, null as Date | null);
      
      const lastStoryUpdate = team.storyState?.updatedAt;
      const lastVote = teamVotes.reduce((latest, vote) => {
        return !latest || vote.createdAt > latest ? vote.createdAt : latest;
      }, null as Date | null);
      
      const lastActivity = [lastTaskUpdate, lastStoryUpdate, lastVote]
        .filter(Boolean)
        .reduce((latest, date) => {
          return !latest || (date && date > latest) ? date : latest;
        }, null as Date | null);

      // Team member details - safer handling
      const memberDetails = (team.members || []).map(memberId => {
        const user = userMap.get(memberId);
        return {
          id: memberId,
          email: user?.email || 'Unknown',
          name: user?.name || 'Unknown'
        };
      });

      const teamMetric = {
        teamId: team.id,
        teamName: team.name,
        cohortId: team.cohort.id,
        cohortName: team.cohort.name,
        projectId: team.project?.id,
        projectName: team.project?.name || 'No Project',
        members: memberDetails,
        memberCount: team.members?.length || 0,
        
        // Story metrics
        introSeen,
        currentChapter,
        completedSegments: Array.isArray(completedSegments) ? completedSegments.length : 0,
        
        // Task metrics
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks: totalTasks - completedTasks - inProgressTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        
        // Vote metrics
        totalVotes,
        avgVotes: Math.round(avgVotes * 100) / 100,
        
        // Upload metrics
        uploadsCount,
        
        // Activity
        lastActivity,
        
        // Overall score
        overallScore: Math.round(((avgVotes * 0.3) + (completionRate * 0.4) + (uploadsCount * 0.3)) * 100) / 100
      };

      return teamMetric;
    });

    // Sort by overall score descending
    teamMetrics.sort((a, b) => b.overallScore - a.overallScore);

    // Calculate summary stats
    const summary = {
      totalTeams: teams.length,
      totalMembers: allMemberIds.length,
      avgCompletionRate: teamMetrics.length > 0 ? 
        Math.round((teamMetrics.reduce((sum, t) => sum + t.completionRate, 0) / teamMetrics.length) * 100) / 100 : 0,
      avgVoteScore: teamMetrics.length > 0 ? 
        Math.round((teamMetrics.reduce((sum, t) => sum + t.avgVotes, 0) / teamMetrics.length) * 100) / 100 : 0,
      totalUploads: teamMetrics.reduce((sum, t) => sum + t.uploadsCount, 0),
      teamsWithIntroSeen: teamMetrics.filter(t => t.introSeen).length,
      teamsFullyCompleted: teamMetrics.filter(t => t.completionRate === 100).length
    };

    // Transform data to match frontend expectations
    const cohortMetrics = teams.reduce((acc, team) => {
      const existing = acc.find(c => c.id === team.cohort.id);
      if (existing) {
        existing.teamCount++;
        existing.enrollmentCount += team.members?.length || 0;
      } else {
        acc.push({
          id: team.cohort.id,
          name: team.cohort.name,
          startDate: new Date(), // You might need to get this from cohort table
          endDate: new Date(), // You might need to get this from cohort table
          status: 'active' as const, // You'll need to determine this
          enrollmentCount: team.members?.length || 0,
          teamCount: 1,
          completionRate: teamMetrics.find(t => t.teamId === team.id)?.completionRate || 0,
          engagementScore: teamMetrics.find(t => t.teamId === team.id)?.avgVotes || 0,
          projectsSubmitted: team.project ? 1 : 0,
          averageTeamSize: team.members?.length || 0
        });
      }
      return acc;
    }, [] as any[]);

    // Generate some basic role distribution data
    const allMembers = teams.flatMap(t => t.members || []);
    const roleDistribution = [
      { role: 'Participants', count: allMembers.length, percentage: 100 }
    ];

    // Generate basic engagement data (you'll need real data)
    // const engagementData = [];

    // Transform team metrics to project metrics
    const projectMetrics = teamMetrics.map(team => ({
      id: team.projectId || team.teamId,
      name: team.projectName,
      teamName: team.teamName,
      cohortName: team.cohortName,
      status: team.completionRate === 100 ? 'completed' as const : 
              team.completionRate > 0 ? 'in-progress' as const : 'planning' as const,
      completionPercentage: team.completionRate,
      lastActivity: team.lastActivity || new Date(),
      teamSize: team.memberCount
    }));

    const transformedResponse = {
      cohortMetrics,
      // engagementData,
      roleDistribution,
      projectMetrics,
      summary: {
        totalParticipants: summary.totalMembers,
        activeTeams: summary.totalTeams,
        completedProjects: summary.teamsFullyCompleted,
        averageEngagement: Math.round(summary.avgCompletionRate),
        retentionRate: summary.totalTeams > 0 ? Math.round((summary.teamsWithIntroSeen / summary.totalTeams) * 100) : 0
      }
    };

    console.log('Returning transformed metrics:', { 
      cohortCount: cohortMetrics.length,
      projectCount: projectMetrics.length,
      summary: transformedResponse.summary 
    });

    return NextResponse.json(transformedResponse);

  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    // Better error handling
    if (error instanceof Error) {
      if (error.message.includes('Not authorized') || error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (error.message.includes('P2002') || error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'Data conflict' }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined 
    }, { status: 500 });
  }
}
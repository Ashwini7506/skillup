// app/api/sprint/ranking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';

/**
 * Utility: round to 2 decimals.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId');

    if (!cohortId) {
      return NextResponse.json({ error: 'Cohort ID required' }, { status: 400 });
    }

    /**
     * Fetch all teams in this cohort, along with their projects & tasks.
     *
     * IMPORTANT SCHEMA NOTES:
     * - SprintTeam.project? -> Project
     * - Project.tasks -> Task[]
     * - Task.attachments -> File[]  (NOT "files")
     */
    const teams = await db.sprintTeam.findMany({
      where: { cohortId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            tasks: {
              select: {
                id: true,
                status: true,
                attachments: {
                  select: { id: true }, // we only need count
                },
              },
            },
          },
        },
      },
    });

    // Short‑circuit: no teams => empty ranking
    if (!teams.length) {
      return NextResponse.json({ teams: [] });
    }

    const teamIds = teams.map((t) => t.id);

    /**
     * Votes aggregation.
     * We'll group in Prisma to avoid O(n*m) in JS.
     */
    const voteAgg = await db.sprintVote.groupBy({
      by: ['teamId'],
      where: { teamId: { in: teamIds } },
      _count: { _all: true },
      _avg: { score: true },
      _sum: { score: true }, // optional; helps debugging
    });

    // Build a quick lookup map
    const voteMap = new Map<
      string,
      { totalVotes: number; avgScore: number; sumScore: number }
    >();
    for (const v of voteAgg) {
      voteMap.set(v.teamId, {
        totalVotes: v._count._all,
        avgScore: v._avg.score ?? 0,
        sumScore: (v._sum.score as number | null) ?? 0,
      });
    }

    /**
     * Compute per‑team metrics.
     */
    const teamMetrics = teams.map((team) => {
      // Votes
      const v = voteMap.get(team.id);
      const totalVotes = v?.totalVotes ?? 0;
      const avgVotes = v?.avgScore ?? 0;

      // Tasks & completion
      const tasks = team.project?.tasks ?? [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Uploads (attachments)
      const uploadsCount = tasks.reduce(
        (sum, t) => sum + (t.attachments?.length ?? 0),
        0
      );

      // Is current user in the team? members is String[] of userIds per schema.
      const isCurrentTeam = team.members.includes(user.id);

      // Weighted score (feel free to tweak weights)
      const overallScore =
        avgVotes * 0.4 + completionRate * 0.4 + uploadsCount * 0.2;

      return {
        teamId: team.id,
        teamName: team.name,
        projectName: team.project?.name ?? 'No Project',
        totalVotes,
        avgVotes: round2(avgVotes),
        completionRate: round2(completionRate),
        uploadsCount,
        isCurrentTeam,
        overallScore,
      };
    });

    // Sort desc by overallScore
    teamMetrics.sort((a, b) => b.overallScore - a.overallScore);

    /**
     * Shape response to match your Sprint/types.ts RankingData.
     * We'll include both the canonical keys *and* your original keys
     * (avgVotes, completionRate, uploadsCount, overallScore) for backward compat.
     */
    const rankedTeams = teamMetrics.map((m, i) => ({
      // canonical RankingData keys
      teamId: m.teamId,
      teamName: m.teamName,
      isCurrentTeam: m.isCurrentTeam,
      avgVotes: m.avgVotes,
      totalVotes: m.totalVotes,
      completionPercentage: m.completionRate, // alias
      uploadCount: m.uploadsCount,            // alias
      totalScore: round2(m.overallScore),
      rank: i + 1,

      // legacy/extra
      projectName: m.projectName,
      completionRate: m.completionRate,
      uploadsCount: m.uploadsCount,
      overallScore: round2(m.overallScore),
    }));

    return NextResponse.json({ teams: rankedTeams });
  } catch (error) {
    console.error('Error fetching sprint ranking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

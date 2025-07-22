import { db } from "@/lib/db";
import { normalizeSprintRole } from "./roles";

interface EnrolledUser {
  userId: string;
  intendedRole: string;
}

/**
 * Simple round-robin team maker.
 * Creates team records; DOES NOT clone project (that’s up to caller).
 */
export async function autoFormTeams({
  cohortId,
  users,
  teamSize = 5,
  templateProjectId,
  workspaceId,
}: {
  cohortId: string;
  users: EnrolledUser[];
  teamSize?: number;
  templateProjectId: string;
  workspaceId: string;
}) {
  // group by role
  const buckets: Record<string, EnrolledUser[]> = {};
  for (const u of users) {
    const r = normalizeSprintRole(u.intendedRole);
    const key = typeof r === "string" ? r : "member";
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(u);
  }

  const teams: { name: string; members: EnrolledUser[] }[] = [];
  let teamIdx = 1;

  while (true) {
    const current: EnrolledUser[] = [];
    for (const key of Object.keys(buckets)) {
      if (!buckets[key].length) continue;
      current.push(buckets[key].shift()!);
      if (current.length === teamSize) break;
    }
    if (!current.length) break;
    teams.push({ name: `Team ${teamIdx++}`, members: current });
  }

  // For each team: clone project
  const createdTeams = [];
  for (const t of teams) {
    const clone = await db.project.create({
      data: {
        name: `${t.name} Clone`,
        description: "Sprint team working project",
        workspaceId,
        createdById: null,
        visibility: "PERSONAL",
      },
    });

    const team = await db.sprintTeam.create({
      data: {
        name: t.name,
        cohortId,
        members: t.members.map((m) => m.userId),
        projectId: clone.id,
      },
    });

    await db.sprintTeamStoryState.create({
      data: {
        teamId: team.id,
        state: {
          started: false,
          seenIntro: false,
          currentChapter: null,
          currentSegment: null,
          history: [],
        },
      },
    });

    createdTeams.push(team);
  }

  return createdTeams;
}

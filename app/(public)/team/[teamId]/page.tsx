// app/(public)/team/[teamId]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { db } from '@/lib/db';
import { TeamPortfolioPage } from '@/components/sprint/TeamPortfolioPage';

interface PageProps {
  params: Promise<{ teamId: string }>;
}

async function getTeamData(teamId: string) {
  console.log('🔍 Getting team data for:', teamId);
  
  const team = await db.sprintTeam.findFirst({
    where: { id: teamId },
    include: {
      cohort: { select: { id: true, name: true, workspaceId: true } },
      project: { select: { id: true, name: true } }
    }
  });

  if (!team) {
    console.log('❌ Team not found');
    return null;
  }

  console.log('✅ Team found:', team.name);

  const members = await db.user.findMany({
    where: { id: { in: team.members } },
    select: { id: true, name: true, email: true, image: true, githubUrl: true, linkedinUrl: true }
  });

  const enrollments = await db.sprintEnrollment.findMany({
    where: { userId: { in: team.members }, cohortId: team.cohortId },
    select: { userId: true, intendedRole: true }
  });

  const roleMap = enrollments.reduce((acc: any, enrollment) => {
    acc[enrollment.userId] = enrollment.intendedRole;
    return acc;
  }, {});

  let files: any[] = [];
  let videos: any[] = [];

  if (team.projectId) {
    const projectFiles = await db.file.findMany({
      where: {
        OR: [
          { task: { projectId: team.projectId } },
          { taskId: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    files = projectFiles.filter(file => file.type !== 'VIDEO');
    videos = projectFiles.filter(file => file.type === 'VIDEO');
  }

  return {
    id: team.id,
    name: team.name,
    cohortName: team.cohort.name,
    workspaceId: team.cohort.workspaceId,
    members: members.map(member => ({
      id: member.id,
      name: member.name || 'Unknown',
      email: member.email,
      role: roleMap[member.id] || 'Team Member',
      image: member.image,
      githubUrl: member.githubUrl,
      linkedinUrl: member.linkedinUrl,
    })),
    videos: videos.map(video => ({
      id: video.id,
      title: video.name,
      url: video.url,
      uploadedAt: video.createdAt
    })),
    files: files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      url: file.url,
      uploadedAt: file.createdAt
    })),
    projectId: team.projectId,
    projectName: team.project?.name
  };
}

export default async function Page({ params }: PageProps) {
  console.log('🚀 Public team page accessed');
  
  const user = await getCurrentUserServer();
  if (!user) {
    redirect('/sign-in');
  }

  const { teamId } = await params;
  const teamData = await getTeamData(teamId);

  if (!teamData) {
    redirect('/');
  }

  return <TeamPortfolioPage team={teamData} workspaceId={teamData.workspaceId} />;
}

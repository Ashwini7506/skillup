// app/api/portfolio/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UserPortfolio } from '@/utils/types';
import { db } from '@/lib/db';
// import { UserPortfolio, calculateStrategicThinker, calculateTeamMaker, calculateDecisionMaker } from '@/lib/types';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Check if current user is a collaborator or if it's a public profile
    // For now, we'll skip this check but in production you'd verify access
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        createdProjects: {
          where: { visibility: 'PUBLIC' },
          select: {
            id: true,
            name: true,
            description: true,
            visibility: true,
            difficulty: true,
            role: true,
            createdAt: true
          }
        },
        joinRequests: {
          where: { status: 'ACCEPTED' },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                visibility: true,
                difficulty: true,
                role: true,
                createdAt: true
              }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assigneeId: true,
            createdAt: true
          }
        },
        activities: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            metadata: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse stored portfolio data from user's about field or activities metadata
    const portfolioData = user.activities
      .filter(activity => activity.type === 'PROFILE_UPDATED')
      .reduce((acc, activity) => {
        const metadata = activity.metadata as any;
        return { ...acc, ...metadata };
      }, {} as { username?: string; experience?: string; positionOfResponsibility?: any[]; hardSkills?: any[] });

    // Parse skill ratings from activities metadata
    const skillRatings = user.activities
      .filter(activity => activity.type === 'SKILL_RATED')
      .reduce((acc: { skill: string; ratings: { rating: number; raterId: string }[] }[], activity) => {
        const metadata = activity.metadata as any;
        if (metadata?.skill && metadata?.rating) {
          const existing = acc.find((sr) => sr.skill === metadata.skill);
          if (existing) {
            existing.ratings.push({
              rating: metadata.rating,
              raterId: metadata.raterId
            });
          } else {
            acc.push({
              skill: metadata.skill,
              ratings: [{ rating: metadata.rating, raterId: metadata.raterId }]
            });
          }
        }
        return acc;
      }, [] as { skill: string; ratings: { rating: number; raterId: string }[] }[])
      .map((sr) => ({
        skill: sr.skill,
        rating: sr.ratings[sr.ratings.length - 1].rating, // Latest rating
        raterIds: sr.ratings.map((r) => r.raterId),
        averageRating: sr.ratings.reduce((sum: number, r) => sum + r.rating, 0) / sr.ratings.length
      }));

    const portfolio: UserPortfolio = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      job: user.job,
      role: user.role,
      about: user.about,
      username: portfolioData.username || user.name.toLowerCase().replace(/\s+/g, ''),
      experience: portfolioData.experience || '',
      positionOfResponsibility: portfolioData.positionOfResponsibility || [],
      hardSkills: portfolioData.hardSkills || [],
      createdProjects: user.createdProjects,
      joinRequests: user.joinRequests
        .filter((jr: any) => jr.project !== null)
        .map((jr: any) => ({
          ...jr,
          project: jr.project // project is guaranteed not null here
        })),
      tasks: user.tasks,
      activities: user.activities,
      skillRatings
    };
    

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

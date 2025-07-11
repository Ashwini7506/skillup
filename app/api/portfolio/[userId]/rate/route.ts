// app/api/portfolio/[userId]/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { skill, rating, raterId } = await request.json();

    if (!skill || !rating || !raterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if the rater is a collaborator
    const isCollaborator = await prisma.joinRequest.findFirst({
      where: {
        OR: [
          { userId: userId, requesterId: raterId, status: 'ACCEPTED' },
          { userId: raterId, requesterId: userId, status: 'ACCEPTED' }
        ]
      }
    });

    if (!isCollaborator) {
      return NextResponse.json({ error: 'Only collaborators can rate skills' }, { status: 403 });
    }

    // Store the rating as an activity
    await db.activity.create({
      data: {
        type: 'SKILL_RATED',
        description: `Skill "${skill}" rated ${rating} stars`,
        userId: userId,
        metadata: {
          skill,
          rating,
          raterId,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
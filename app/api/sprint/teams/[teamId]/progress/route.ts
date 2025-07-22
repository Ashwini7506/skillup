// app/api/sprint/teams/[teamId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { Prisma } from '@prisma/client';

// Define progress types
interface ChapterProgress {
  introSeen: boolean;
  currentChapter: string | null;
  currentSegment: string | null;
  unlockedChapters: string[];
  completedSegments: string[];
  [key: string]: any; // For Prisma JSON compatibility
}

function getDefaultProgress(): ChapterProgress {
  return {
    introSeen: false,
    currentChapter: null,
    currentSegment: null,
    unlockedChapters: ["1"], // Chapter 1 is always unlocked
    completedSegments: []
  };
}

function unlockNextChapter(progress: ChapterProgress): ChapterProgress {
  const unlockedNumbers = progress.unlockedChapters.map(ch => parseInt(ch));
  const nextChapterNumber = Math.max(...unlockedNumbers) + 1;
  const nextChapterId = nextChapterNumber.toString();
  
  if (nextChapterNumber <= 5 && !progress.unlockedChapters.includes(nextChapterId)) {
    return {
      ...progress,
      unlockedChapters: [...progress.unlockedChapters, nextChapterId]
    };
  }
  
  return progress;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    
    // Get team with story information
    const team = await db.sprintTeam.findUnique({
      where: { id: teamId },
      include: {
        storyState: true,
        project: {
          include: {
            sprintStory: {
              include: {
                chapters: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    segments: {
                      select: { id: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    let storyState = team.storyState;
    let progressData: ChapterProgress;

    if (!storyState) {
      // Create default progress
      progressData = getDefaultProgress();
      storyState = await db.sprintTeamStoryState.create({
        data: {
          teamId,
          state: progressData as Prisma.InputJsonValue
        }
      });
    } else {
      progressData = storyState.state as ChapterProgress;
      
      // Ensure default structure if missing fields
      if (!progressData.unlockedChapters) {
        progressData = {
          ...progressData,
          unlockedChapters: ["1"]
        };
      }
      if (!progressData.completedSegments) {
        progressData.completedSegments = [];
      }
    }

    // Get chapter information from database or provide defaults
    const chapters = team.project?.sprintStory?.chapters?.map(ch => ({
      id: ch.id,
      title: ch.title,
      segments: ch.segments.length
    })) || [
      { id: '1', title: 'Introduction', segments: 5 },
      { id: '2', title: 'Planning Phase', segments: 7 },
      { id: '3', title: 'Development', segments: 8 },
      { id: '4', title: 'Testing', segments: 6 },
      { id: '5', title: 'Deployment', segments: 4 },
    ];

    return NextResponse.json({ 
      progress: progressData,
      chapters 
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const { action, segmentId, chapterNumber, chapterId } = await request.json();
    
    let storyState = await db.sprintTeamStoryState.findUnique({
      where: { teamId }
    });

    let updatedProgress: ChapterProgress;

    if (!storyState) {
      updatedProgress = getDefaultProgress();
      storyState = await db.sprintTeamStoryState.create({
        data: {
          teamId,
          state: updatedProgress as Prisma.InputJsonValue
        }
      });
    } else {
      updatedProgress = { ...storyState.state as ChapterProgress };
      
      // Ensure arrays exist
      if (!updatedProgress.completedSegments) {
        updatedProgress.completedSegments = [];
      }
      if (!updatedProgress.unlockedChapters) {
        updatedProgress.unlockedChapters = ["1"];
      }
    }

    switch (action) {
      case 'complete_segment':
        if (segmentId && !updatedProgress.completedSegments.includes(segmentId)) {
          updatedProgress.completedSegments.push(segmentId);
        }
        break;
        
      case 'complete_chapter':
        updatedProgress = unlockNextChapter(updatedProgress);
        break;
        
      case 'set_intro_seen':
        updatedProgress.introSeen = true;
        // When intro is seen, unlock chapter 1 if not already
        if (!updatedProgress.unlockedChapters.includes("1")) {
          updatedProgress.unlockedChapters.push("1");
        }
        break;
        
      case 'set_current_position':
        const targetChapter = chapterId || chapterNumber?.toString();
        if (targetChapter && updatedProgress.unlockedChapters.includes(targetChapter)) {
          updatedProgress.currentChapter = targetChapter;
          updatedProgress.currentSegment = "1"; // Reset to first segment
        }
        break;

      case 'unlock_chapter':
        const chapterToUnlock = chapterId || chapterNumber?.toString();
        if (chapterToUnlock && !updatedProgress.unlockedChapters.includes(chapterToUnlock)) {
          updatedProgress.unlockedChapters.push(chapterToUnlock);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update database
    await db.sprintTeamStoryState.update({
      where: { teamId },
      data: { state: updatedProgress as Prisma.InputJsonValue }
    });

    return NextResponse.json({ progress: updatedProgress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

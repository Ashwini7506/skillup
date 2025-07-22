import { db } from "@/lib/db";
import { SprintStoryState, StorySegmentClient } from "@/utils/sprintHub/types";
import { Prisma } from "@prisma/client";

/**
 * Return current segment for a team (or first segment if none stored).
 */
export async function getCurrentTeamSegment(
  teamId: string
): Promise<StorySegmentClient | null> {
  const team = await db.sprintTeam.findUnique({
    where: { id: teamId },
    include: {
      storyState: true,
      project: {
        include: {
          sprintStory: {
            include: {
              chapters: {
                orderBy: { order: "asc" },
                include: {
                  segments: {
                    orderBy: { order: "asc" },
                    include: { choices: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  
  if (!team?.project?.sprintStory) return null;

  const story = team.project.sprintStory;
  const stateJson = (team.storyState?.state as any) ?? undefined;

  let currentSegId = stateJson?.currentSegment;
  if (!currentSegId) {
    const firstChapter = story.chapters[0];
    const firstSeg = firstChapter?.segments[0];
    if (!firstSeg) return null;
    currentSegId = firstSeg.id;
  }

  const segment = story.chapters
    .flatMap((c) => c.segments)
    .find((s) => s.id === currentSegId);
  if (!segment) return null;

  return prismaSegmentToClient(segment);
}

/**
 * Advance team story: from current segment -> next (choice aware).
 * Unlocks tasks when hitting TASK_UNLOCK segments.
 * Unlocks next chapter when chapter ends.
 */
export async function advanceTeamSegment(
  teamId: string,
  segmentId: string,
  choiceId?: string
) {
  const team = await db.sprintTeam.findUnique({
    where: { id: teamId },
    include: {
      cohort: true,
      storyState: true,
      project: {
        include: {
          Workspace: true,
          sprintStory: {
            include: {
              chapters: {
                include: {
                  segments: { include: { choices: true } },
                  taskTemplates: true,
                },
              },
            },
          },
          tasks: { select: { id: true } },
        },
      },
    },
  });
  
  if (!team?.project?.sprintStory) {
    throw new Error("No story on team project.");
  }

  const story = team.project.sprintStory;
  const allChapters = story.chapters.sort((a, b) => a.order - b.order);
  const allSegments = allChapters.flatMap((c) => c.segments);

  const stateJson = (team.storyState?.state as any) ?? {
    started: true,
    seenIntro: true,
    currentChapter: null,
    currentSegment: null,
    unlockedChapters: ["1"], // Chapter 1 always unlocked
    completedSegments: [],
    history: [],
  };

  const currentSeg = allSegments.find((s) => s.id === segmentId);
  if (!currentSeg) throw new Error("Segment not found.");

  // Find which chapter this segment belongs to
  const currentChapter = allChapters.find((c) => c.id === currentSeg.chapterId);
  if (!currentChapter) throw new Error("Chapter not found for segment.");

  // Resolve next seg
  let nextSegId = currentSeg.nextSegmentId ?? null;
  if (choiceId) {
    const ch = currentSeg.choices.find((c) => c.id === choiceId);
    if (ch?.nextSegmentId) nextSegId = ch.nextSegmentId;
  }
  
  const nextSeg = nextSegId
    ? allSegments.find((s) => s.id === nextSegId) ?? null
    : null;

  // Check if we're at the end of a chapter (no next segment or next segment is in different chapter)
  const isChapterEnd = !nextSeg || 
    (nextSeg && allChapters.find(c => c.id === nextSeg.chapterId)?.order !== currentChapter.order);

  // Unlock tasks if needed
  const unlockedTasks: string[] = [];
  if (currentSeg.type === "TASK_UNLOCK") {
    const chapter = allChapters.find((c) => c.id === currentSeg.chapterId);
    if (chapter) {
      const templates = chapter.taskTemplates.filter(
        (t) => !t.unlockSegmentId || t.unlockSegmentId === currentSeg.id
      );
      for (const tpl of templates) {
        const task = await db.task.create({
          data: {
            title: tpl.title,
            description: tpl.description,
            projectId: team.projectId!,
            workspaceId: team.project.workspaceId,
            startDate: new Date(),
            dueDate: new Date(
              Date.now() + (tpl.expectedDays ? tpl.expectedDays * 86400000 : 3 * 86400000)
            ),
            position: 0,
          },
        });
        unlockedTasks.push(task.id);
      }
    }
  }

  // Initialize arrays if they don't exist
  const unlockedChapters = stateJson.unlockedChapters || ["1"];
  const completedSegments = stateJson.completedSegments || [];

  // Add current segment to completed segments
  if (!completedSegments.includes(segmentId)) {
    completedSegments.push(segmentId);
  }

  // Check if we should unlock the next chapter
  let updatedUnlockedChapters = [...unlockedChapters];
  if (isChapterEnd) {
    const nextChapterOrder = currentChapter.order + 1;
    const nextChapter = allChapters.find(c => c.order === nextChapterOrder);
    
    if (nextChapter) {
      const nextChapterId = nextChapter.id;
      if (!updatedUnlockedChapters.includes(nextChapterId)) {
        updatedUnlockedChapters.push(nextChapterId);
        console.log(`🔓 Unlocked Chapter ${nextChapterOrder + 1}:`, nextChapter.title);
      }
    }
  }

  // Update story state with chapter unlocking logic
  const newState = {
    started: true,
    seenIntro: true,
    currentChapter: nextSeg ? nextSeg.chapterId : stateJson.currentChapter,
    currentSegment: nextSeg ? nextSeg.id : null,
    unlockedChapters: updatedUnlockedChapters,
    completedSegments: completedSegments,
    history: [...(stateJson.history ?? []), segmentId],
  };

  // Save to database
  if (team.storyState) {
    await db.sprintTeamStoryState.update({
      where: { teamId },
      data: { state: newState as Prisma.InputJsonValue },
    });
  } else {
    await db.sprintTeamStoryState.create({
      data: { 
        teamId, 
        state: newState as Prisma.InputJsonValue 
      },
    });
  }

  return {
    nextSegment: nextSeg ? prismaSegmentToClient(nextSeg) : null,
    unlockedTasks,
    chapterUnlocked: isChapterEnd ? currentChapter.order + 1 : null,
  };
}

/**
 * Mark intro as complete and unlock Chapter 1
 */
export async function completeIntro(teamId: string) {
  const existingState = await db.sprintTeamStoryState.findUnique({
    where: { teamId }
  });

  const currentState = existingState?.state as any || {};
  
  const newState = {
    ...currentState,
    started: true,
    seenIntro: true,
    introComplete: true,
    unlockedChapters: ["1"], // Ensure Chapter 1 is unlocked
    completedSegments: currentState.completedSegments || [],
  };

  if (existingState) {
    await db.sprintTeamStoryState.update({
      where: { teamId },
      data: { state: newState as Prisma.InputJsonValue }
    });
  } else {
    await db.sprintTeamStoryState.create({
      data: { 
        teamId, 
        state: newState as Prisma.InputJsonValue 
      }
    });
  }

  return newState;
}

/**
 * Manually unlock a specific chapter (for testing/admin)
 */
export async function unlockChapter(teamId: string, chapterId: string) {
  const existingState = await db.sprintTeamStoryState.findUnique({
    where: { teamId }
  });

  const currentState = existingState?.state as any || {};
  const unlockedChapters = currentState.unlockedChapters || ["1"];
  
  if (!unlockedChapters.includes(chapterId)) {
    unlockedChapters.push(chapterId);
  }

  const newState = {
    ...currentState,
    unlockedChapters,
  };

  if (existingState) {
    await db.sprintTeamStoryState.update({
      where: { teamId },
      data: { state: newState as Prisma.InputJsonValue }
    });
  } else {
    await db.sprintTeamStoryState.create({
      data: { 
        teamId, 
        state: newState as Prisma.InputJsonValue 
      }
    });
  }

  return newState;
}

function prismaSegmentToClient(seg: any): StorySegmentClient {
  return {
    id: seg.id,
    type: seg.type,
    character: seg.character,
    text: seg.text,
    mediaUrl: seg.mediaUrl,
    choices: seg.choices?.map((c: any) => ({ id: c.id, text: c.text })) ?? [],
  };
}

// utils/chapter-progress.ts
export interface ChapterProgress {
  introSeen: boolean;
  currentChapter: number;
  currentSegment: number;
  completedSegments: string[]; // Array of completed segment IDs
  unlockedChapters: number[];
  [key: string]: any;
}

export const getDefaultProgress = (): ChapterProgress => ({
  introSeen: false,
  currentChapter: 1,
  currentSegment: 1,
  completedSegments: [],
  unlockedChapters: [1] // Chapter 1 is always unlocked
});

export const isChapterUnlocked = (
  chapterNumber: number, 
  progress: ChapterProgress
): boolean => {
  return progress.unlockedChapters.includes(chapterNumber);
};

export const unlockNextChapter = (
  currentProgress: ChapterProgress
): ChapterProgress => {
  const nextChapter = Math.max(...currentProgress.unlockedChapters) + 1;
  
  if (nextChapter <= 5 && !currentProgress.unlockedChapters.includes(nextChapter)) {
    return {
      ...currentProgress,
      unlockedChapters: [...currentProgress.unlockedChapters, nextChapter]
    };
  }
  
  return currentProgress;
};

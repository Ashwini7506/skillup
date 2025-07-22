// components/sprint/ChapterProgress.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChapterProgressProps {
  teamId: string;
}

interface APIProgress {
  currentChapter: string | null;
  unlockedChapters: string[];
  completedSegments: string[];
}

/** The server already knows the real titles & order,
    but keep a fallback in case the call fails. */
const staticChapters = [
  { id: '1', title: 'Introduction', segments: 3 },
  { id: '2', title: 'Planning Phase', segments: 4 },
  { id: '3', title: 'Development', segments: 5 },
  { id: '4', title: 'Testing', segments: 3 },
  { id: '5', title: 'Deployment', segments: 2 },
];

export function ChapterProgress({ teamId }: ChapterProgressProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<APIProgress | null>(null);
  const [chapters, setChapters] = useState<typeof staticChapters>(staticChapters);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/sprint/teams/${teamId}/progress`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Bad response');
        const json = await res.json();
        setProgress(json.progress as APIProgress);
        setChapters(json.chapters ?? staticChapters); // server can send real titles/order
      } catch (err) {
        console.error('Progress fetch failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);
  /* ------------------------------------------------------------------ */

  const handleJump = async (chapterId: string) => {
    if (!progress?.unlockedChapters.includes(chapterId)) return;
    await fetch(`/api/sprint/teams/${teamId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current_position', chapterId }),
    });
    router.push(`/sprint/story/${teamId}/chapter/${chapterId}`);
  };

  if (loading) return <p>Loading progress…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Sprint Story Progress</h2>

      {chapters.map((ch) => {
        const unlocked = progress?.unlockedChapters.includes(ch.id) ?? false;
        const completedSegs =
          progress?.completedSegments.filter((s) => s.startsWith(`chapter-${ch.id}`)).length ?? 0;
        const completed = completedSegs >= ch.segments;
        const current = progress?.currentChapter === ch.id;

        return (
          <Card
            key={ch.id}
            onClick={() => handleJump(ch.id)}
            className={`cursor-pointer transition ${
              unlocked ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
            } ${current ? 'ring-2 ring-blue-500' : ''}`}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    completed
                      ? 'bg-green-500'
                      : unlocked
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {completed ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : unlocked ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-600" />
                  )}
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${unlocked ? '' : 'text-gray-500'}`}>
                    Chapter {ch.id}: {ch.title}
                  </h3>
                  <p className={`${unlocked ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                    {completedSegs}/{ch.segments} segments completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

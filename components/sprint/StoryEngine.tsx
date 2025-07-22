// components/sprint/StoryEngine.tsx
"use client";
import { useState, useCallback } from "react";
import { StorySegmentClient } from "@/utils/sprintHub/types";
import { MAIN_STORY_SCRIPT } from "@/lib/sprint/story-templates/main-story";
import { Button } from "@/components/ui/button";

interface Props {
  teamId: string;
  initialSegment?: StorySegmentClient | null;
}

export function StoryEngine({ teamId }: Props) {
  const [index, setIndex] = useState(0);
  const script = MAIN_STORY_SCRIPT;
  const seg: StorySegmentClient | undefined = script[index];

  const next = useCallback(() => {
    const nextIdx = index + 1;
    if (nextIdx >= script.length) {
      // Story complete
      return;
    } else {
      setIndex(nextIdx);
    }
  }, [index, script.length]);

  const handleChoice = useCallback((choiceId: string) => {
    console.log('Choice selected:', choiceId);
    next(); // Move to next segment after choice
  }, [next]);

  if (!seg) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Story Complete!</h3>
        <p className="text-gray-600">Great job completing the story. Check your tasks for next steps.</p>
      </div>
    );
  }

  switch (seg.type) {
    case "VIDEO":
      return (
        <div className="w-full max-w-xl mx-auto">
          <video
            src={seg.mediaUrl || "/sprint/assets/intro/mentor-welcome.mp4"}
            autoPlay
            controls
            onEnded={next}
            className="w-full rounded-lg"
          />
          <div className="mt-4 text-center">
            <Button onClick={next} variant="outline">
              Skip Video
            </Button>
          </div>
        </div>
      );

    case "DIALOGUE":
      return (
        <div className="p-6 max-w-md mx-auto text-center">
          {seg.character && (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              {seg.character.charAt(0)}
            </div>
          )}
          {seg.character && <div className="font-bold mb-2 text-lg">{seg.character}</div>}
          <p className="mb-6 text-gray-700 leading-relaxed">{seg.text}</p>
          <Button onClick={next} className="w-full">
            Next
          </Button>
        </div>
      );

    case "CHOICE":
      return (
        <div className="p-6 max-w-md mx-auto text-center">
          <p className="mb-6 text-lg font-medium text-gray-800">{seg.text}</p>
          <div className="space-y-3">
            {seg.choices?.map((choice) => (
              <Button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                variant="outline"
                className="w-full text-left justify-start"
              >
                {choice.text}
              </Button>
            ))}
          </div>
        </div>
      );

    case "TASK_UNLOCK":
      return (
        <div className="p-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            ✓
          </div>
          <p className="mb-6 text-lg">{seg.text || "New tasks have been unlocked!"}</p>
          <Button onClick={next} className="w-full">
            Continue
          </Button>
        </div>
      );

    case "CHAPTER_END":
      return (
        <div className="p-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            🎉
          </div>
          <h3 className="text-xl font-semibold mb-4">Chapter Complete!</h3>
          <p className="mb-6 text-gray-700 leading-relaxed">{seg.text}</p>
          <Button onClick={next} className="w-full">
            Continue to Next Chapter
          </Button>
        </div>
      );

    default:
      return (
        <div className="p-6 max-w-md mx-auto text-center">
          <Button onClick={next} className="w-full">
            Continue
          </Button>
        </div>
      );
  }
}

"use client";
import { useState, useCallback } from "react";
import { INTRO_SCRIPT } from "@/lib/sprint/story-templates/intro";
import { renderTokens } from "@/lib/sprint/token-replacer";
import { SprintTeamClient, StorySegmentClient } from "@/utils/sprintHub/types";

interface Props {
  team: SprintTeamClient;
  onComplete: () => void;
  videoUrl?: string | null;
}

export function IntroStoryPlayer({ team, onComplete, videoUrl }: Props) {
  const [index, setIndex] = useState(0);
  const script = INTRO_SCRIPT;
  const seg: StorySegmentClient | undefined = script[index];

  const next = useCallback(() => {
    const nextIdx = index + 1;
    if (nextIdx >= script.length) onComplete();
    else setIndex(nextIdx);
  }, [index, script.length, onComplete]);

  if (!seg) return null;

  if (seg.type === "VIDEO" && (seg.mediaUrl || videoUrl)) {
    const v = videoUrl ?? seg.mediaUrl!;
    return (
      <div className="w-full max-w-xl mx-auto">
        <video src={v} autoPlay onEnded={next} className="w-full" />
      </div>
    );
  }

  if (seg.type === "DIALOGUE") {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        {seg.character && <div className="font-bold mb-2">{seg.character}</div>}
        <p className="mb-4">{renderTokens(seg.text ?? "", team)}</p>
        <button onClick={next} className="btn btn-primary">Next</button>
      </div>
    );
  }

  if (seg.type === "CHOICE") {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <p className="mb-4">{seg.text}</p>
        {seg.choices?.map((c) => (
          <button key={c.id} onClick={onComplete} className="btn btn-primary mx-2">
            {c.text}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <button onClick={next} className="btn btn-primary">Continue</button>
    </div>
  );
}

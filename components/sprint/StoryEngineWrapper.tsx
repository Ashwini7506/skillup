// components/sprint/StoryEngineWrapper.tsx
"use client";
import { StoryEngine } from "./StoryEngine";

interface Props {
  teamId: string;
  initialSegment?: any; // Not needed anymore
}

export function StoryEngineWrapper({ teamId }: Props) {
  // Just pass through to StoryEngine - no API calls needed
  return <StoryEngine teamId={teamId} />;
}

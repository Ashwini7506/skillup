import { StorySegmentClient } from "@/utils/sprintHub/types";

export const INTRO_SCRIPT: StorySegmentClient[] = [
  {
    id: "intro-mentor-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4",
  },
  {
    id: "intro-meet-team",
    type: "DIALOGUE",
    character: "Mentor",
    text: "Meet your startup crew!",
  },
  {
    id: "intro-pm",
    type: "DIALOGUE",
    character: "PM",
    text: "Hi, I'm {{pm.name}}, I'll guide product direction.",
  },
  {
    id: "intro-dev",
    type: "DIALOGUE",
    character: "Developer",
    text: "Yo! {{dev.name}} here, I'll build the core app.",
  },
  {
    id: "intro-designer",
    type: "DIALOGUE",
    character: "Designer",
    text: "I'm {{designer.name}}—I'll make it usable & beautiful.",
  },
  {
    id: "intro-problem",
    type: "DIALOGUE",
    character: "Mentor",
    text: "Your mission: Build an MVP that helps fresh grads track interview prep across companies. Deadline: {{sprint.endDate|date}}.",
  },
  {
    id: "intro-ready",
    type: "CHOICE",
    text: "Ready to begin?",
    choices: [{ id: "go", text: "Let's Go!" }],
  },
];

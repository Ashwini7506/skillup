// lib/sprint/story-templates/main-story.ts
import { StorySegmentClient } from "@/utils/sprintHub/types";

export const MAIN_STORY_SCRIPT: StorySegmentClient[] = [
  // =================== CHAPTER 1: Getting Started ===================
  {
    id: "chapter-1-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4"
  },
  {
    id: "chapter-1-dialogue-1",
    type: "DIALOGUE",
    character: "Mentor",
    text: "Welcome to Chapter 1! This is where your real journey begins. Your first challenge is to understand the problem space."
  },
  {
    id: "chapter-1-choice",
    type: "CHOICE",
    text: "How do you want to approach this challenge?",
    choices: [
      { id: "choice-1", text: "Plan carefully first" },
      { id: "choice-2", text: "Jump right in" }
    ]
  },
  {
    id: "chapter-1-dialogue-2", 
    type: "DIALOGUE",
    character: "Mentor",
    text: "Great choice! Let's move forward. Remember, understanding your users is key to building something valuable."
  },
  {
    id: "chapter-1-task-unlock",
    type: "TASK_UNLOCK",
    text: "New tasks unlocked! Start with user research and problem definition."
  },
  // ✅ ADD CHAPTER END MARKER
  {
    id: "chapter-1-end",
    type: "CHAPTER_END",
    text: "🎉 Chapter 1 Complete! You've mastered the fundamentals of problem identification. Chapter 2 is now unlocked!"
  },

  // =================== CHAPTER 2: Planning & Design ===================
  {
    id: "chapter-2-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4"
  },
  {
    id: "chapter-2-dialogue-1",
    type: "DIALOGUE",
    character: "Design Lead",
    text: "Welcome to Chapter 2! Now that you understand the problem, it's time to design your solution."
  },
  {
    id: "chapter-2-choice-1",
    type: "CHOICE",
    text: "What should be your design priority?",
    choices: [
      { id: "choice-3", text: "User experience first" },
      { id: "choice-4", text: "Technical feasibility first" }
    ]
  },
  {
    id: "chapter-2-dialogue-2",
    type: "DIALOGUE",
    character: "Design Lead",
    text: "Smart thinking! Good design balances user needs with technical constraints."
  },
  {
    id: "chapter-2-choice-2",
    type: "CHOICE",
    text: "How detailed should your initial wireframes be?",
    choices: [
      { id: "choice-5", text: "High-fidelity mockups" },
      { id: "choice-6", text: "Simple sketches to start" }
    ]
  },
  {
    id: "chapter-2-dialogue-3",
    type: "DIALOGUE",
    character: "Design Lead",
    text: "Perfect! Starting simple allows for quick iterations and feedback."
  },
  {
    id: "chapter-2-task-unlock",
    type: "TASK_UNLOCK",
    text: "Design tasks unlocked! Create wireframes, user flows, and design system components."
  },
  // ✅ ADD CHAPTER END MARKER
  {
    id: "chapter-2-end",
    type: "CHAPTER_END",
    text: "🎉 Chapter 2 Complete! Your design foundation is solid. Chapter 3: Development awaits!"
  },

  // =================== CHAPTER 3: Development ===================
  {
    id: "chapter-3-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4"
  },
  {
    id: "chapter-3-dialogue-1",
    type: "DIALOGUE",
    character: "Tech Lead",
    text: "Chapter 3 - Development time! Let's turn those designs into reality. First, we need to set up our technical foundation."
  },
  {
    id: "chapter-3-choice-1",
    type: "CHOICE",
    text: "What's your development approach?",
    choices: [
      { id: "choice-7", text: "Build MVP features first" },
      { id: "choice-8", text: "Set up infrastructure first" }
    ]
  },
  {
    id: "chapter-3-dialogue-2",
    type: "DIALOGUE",
    character: "Tech Lead",
    text: "Excellent strategy! A solid foundation makes feature development much smoother."
  },
  {
    id: "chapter-3-choice-2",
    type: "CHOICE",
    text: "How will you handle user authentication?",
    choices: [
      { id: "choice-9", text: "Third-party service (faster)" },
      { id: "choice-10", text: "Custom implementation (more control)" }
    ]
  },
  {
    id: "chapter-3-dialogue-3",
    type: "DIALOGUE",
    character: "Tech Lead",
    text: "Good call! For an MVP, speed to market is often more important than custom solutions."
  },
  {
    id: "chapter-3-choice-3",
    type: "CHOICE",
    text: "What's your testing strategy?",
    choices: [
      { id: "choice-11", text: "Write tests as you code" },
      { id: "choice-12", text: "Focus on manual testing for now" }
    ]
  },
  {
    id: "chapter-3-dialogue-4",
    type: "DIALOGUE",
    character: "Tech Lead",
    text: "Smart! Automated tests save time in the long run and catch bugs early."
  },
  {
    id: "chapter-3-task-unlock",
    type: "TASK_UNLOCK",
    text: "Development tasks unlocked! Set up repositories, implement core features, and write tests."
  },
  // ✅ ADD CHAPTER END MARKER
  {
    id: "chapter-3-end",
    type: "CHAPTER_END",
    text: "🎉 Chapter 3 Complete! Your MVP is taking shape. Time for Chapter 4: Testing!"
  },

  // =================== CHAPTER 4: Testing & Refinement ===================
  {
    id: "chapter-4-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4"
  },
  {
    id: "chapter-4-dialogue-1",
    type: "DIALOGUE",
    character: "QA Lead",
    text: "Chapter 4 - Testing phase! Your MVP is taking shape. Now we need to ensure it works flawlessly for real users."
  },
  {
    id: "chapter-4-choice-1",
    type: "CHOICE",
    text: "What type of testing should you prioritize?",
    choices: [
      { id: "choice-13", text: "User acceptance testing" },
      { id: "choice-14", text: "Performance testing" }
    ]
  },
  {
    id: "chapter-4-dialogue-2",
    type: "DIALOGUE",
    character: "QA Lead",
    text: "Great choice! User feedback is invaluable for catching usability issues before launch."
  },
  {
    id: "chapter-4-choice-2",
    type: "CHOICE",
    text: "How will you gather user feedback?",
    choices: [
      { id: "choice-15", text: "Beta testing with real users" },
      { id: "choice-16", text: "Internal team testing first" }
    ]
  },
  {
    id: "chapter-4-dialogue-3",
    type: "DIALOGUE",
    character: "QA Lead",
    text: "Perfect! Real users often find issues that internal teams miss."
  },
  {
    id: "chapter-4-choice-3",
    type: "CHOICE",
    text: "What's your bug fixing priority?",
    choices: [
      { id: "choice-17", text: "Fix critical bugs first" },
      { id: "choice-18", text: "Polish user experience" }
    ]
  },
  {
    id: "chapter-4-dialogue-4",
    type: "DIALOGUE",
    character: "QA Lead",
    text: "Absolutely! Critical bugs can break user trust, while UX improvements can wait for future iterations."
  },
  {
    id: "chapter-4-task-unlock",
    type: "TASK_UNLOCK",
    text: "Testing tasks unlocked! Create test plans, conduct user testing, and fix identified issues."
  },
  // ✅ ADD CHAPTER END MARKER
  {
    id: "chapter-4-end",
    type: "CHAPTER_END",
    text: "🎉 Chapter 4 Complete! Your product is polished and ready. Final chapter: Launch & Scale!"
  },

  // =================== CHAPTER 5: Launch & Scale ===================
  {
    id: "chapter-5-video",
    type: "VIDEO",
    mediaUrl: "/sprint/assets/intro/mentor-welcome.mp4"
  },
  {
    id: "chapter-5-dialogue-1",
    type: "DIALOGUE",
    character: "Product Manager",
    text: "Chapter 5 - Launch time! Your MVP is ready for the world. Let's plan a successful launch and think about scaling."
  },
  {
    id: "chapter-5-choice-1",
    type: "CHOICE",
    text: "What's your launch strategy?",
    choices: [
      { id: "choice-19", text: "Soft launch with limited users" },
      { id: "choice-20", text: "Full public launch" }
    ]
  },
  {
    id: "chapter-5-dialogue-2",
    type: "DIALOGUE",
    character: "Product Manager",
    text: "Wise approach! A soft launch lets you iron out any remaining issues before going fully public."
  },
  {
    id: "chapter-5-choice-2",
    type: "CHOICE",
    text: "How will you measure success?",
    choices: [
      { id: "choice-21", text: "User engagement metrics" },
      { id: "choice-22", text: "Revenue and conversion" }
    ]
  },
  {
    id: "chapter-5-dialogue-3",
    type: "DIALOGUE",
    character: "Product Manager",
    text: "Excellent! Engaged users are the foundation of a sustainable business."
  },
  {
    id: "chapter-5-choice-3",
    type: "CHOICE",
    text: "What's your post-launch priority?",
    choices: [
      { id: "choice-23", text: "Gather user feedback and iterate" },
      { id: "choice-24", text: "Scale infrastructure for growth" }
    ]
  },
  {
    id: "chapter-5-dialogue-4",
    type: "DIALOGUE",
    character: "Product Manager",
    text: "Perfect balance! User feedback drives product improvements while infrastructure ensures you can handle growth."
  },
  {
    id: "chapter-5-dialogue-final",
    type: "DIALOGUE",
    character: "Mentor",
    text: "Congratulations! You've successfully navigated through all 5 chapters of the sprint. You've planned, designed, built, tested, and launched your MVP. This is just the beginning of your entrepreneurial journey!"
  },
  {
    id: "chapter-5-task-unlock",
    type: "TASK_UNLOCK",
    text: "Final tasks unlocked! Prepare launch materials, set up analytics, and plan your growth strategy."
  },
  // ✅ ADD FINAL COMPLETION MARKER
  {
    id: "story-complete",
    type: "CHAPTER_END",
    text: "🏆 Congratulations! You've completed the entire Sprint Story. You're now ready to build amazing products!"
  }
];

// Helper function to get chapters separately if needed
export const getChapterSegments = (chapterNumber: number): StorySegmentClient[] => {
  const chapterPrefixes = [
    "chapter-1",
    "chapter-2", 
    "chapter-3",
    "chapter-4",
    "chapter-5"
  ];
  
  const prefix = chapterPrefixes[chapterNumber - 1];
  if (!prefix) return [];
  
  return MAIN_STORY_SCRIPT.filter(segment => segment.id.startsWith(prefix));
};

// Get total chapters count
export const TOTAL_CHAPTERS = 5;

"use client";
import { jobRoleSlugs } from "@/utils/roleMap";
import slugify from "slugify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import joblists from "@/utils/joblists";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  workspaceId: string;
}

export function ProjectSelector({ workspaceId }: Props) {
  const router = useRouter();

  const [roleLabel, setRoleLabel] = useState<(typeof joblists)[number]>(joblists[0]);
  const [level, setLevel] = useState<"noob" | "intermediate" | "advanced">("noob");

  // Typewriter effect for job roles
  const typewriterText = useTypewriter({
    words: joblists.slice(0, 5), // Show first 5 job roles in animation
    typeSpeed: 100,
    deleteSpeed: 50,
    delayBetweenWords: 2000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(roleLabel, { lower: true });
    router.push(`/workspace/${workspaceId}/discover/${slug}/${level}`);
  };

  const levelOptions = [
    { value: "noob", label: "Beginner", description: "Just starting my journey" },
    { value: "intermediate", label: "Intermediate", description: "Have some project experience" },
    { value: "advanced", label: "Advanced", description: "Ready for complex challenges" }
  ];

  return (
    <div className="text-center">
      {/* Target Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Let's Get Started
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-600 mb-8">
        Tell us about your goals to personalize your experience
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Horizontal Layout */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Side - Job Role Question */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                <label className="text-sm font-medium text-gray-700">
                  What job role are you currently aiming for?
                </label>
              </div>
              
              <select
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value as typeof joblists[number])}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                {joblists.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Typewriter Animation - Moved here */}
              <div className="mt-8 text-center">
                <div className="text-lg font-medium text-gray-700 mb-3">
                  Your future role:
                </div>
                <div className="text-2xl font-bold text-blue-600 h-10 flex items-center justify-center">
                  {typewriterText}
                  <span className="animate-pulse ml-1">|</span>
                </div>
              </div>
            </div>

            {/* Right Side - Expertise Level Question */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How would you rate your expertise?
              </label>
              
              <div className="space-y-3">
                {levelOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      level === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => setLevel(option.value as typeof level)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="expertise"
                        value={option.value}
                        checked={level === option.value}
                        onChange={() => setLevel(option.value as typeof level)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Divider - Only visible on large screens */}
          <div className="hidden lg:block absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gray-200"></div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Get Recommendations
        </Button>
      </form>
    </div>
  );
}
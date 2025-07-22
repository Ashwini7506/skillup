// components/sprint/tabs/StoryTab.tsx
'use client';

import { useState } from 'react';
import { Play, RotateCcw, BookOpen, Video, ExternalLink, Sparkles } from 'lucide-react';
import { Card,CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import IntroStoryWrapper from '../IntroStoryWrapper';
import { Progress } from '@/components/ui/progress';
import { StoryEngineWrapper } from '../StoryEngineWrapper';

interface StoryTabProps {
  data: {
    user: {
      id: string;
      email: string;
    };
    enrollment: {
      id: string;
      cohortId: string;
      intendedRole: string;
      enrolledAt: Date;
    } | null;
    team: {
      id: string;
      name: string;
      members: string[];
      projectId: string;
      cohortId: string;
    } | null;
    cohort: {
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
      activated: boolean;
      workspaceId: string;
    } | null;
    storyState: {
      id: string;
      state: any;
      introComplete: boolean;
      currentChapter: number;
      currentSegment: number;
    } | null;
    project: {
      id: string;
      name: string;
      tasks: {
        id: string;
        title: string;
        completed: boolean;
        assignedTo: string[];
      }[];
    } | null;
    teamMembers: {
      id: string;
      email: string | null;
      sprintRole: string;
      taskCount: number;
      completedTasks: number;
    }[];
  };
  workspaceId: string;
}

export function StoryTab({ data, workspaceId }: StoryTabProps) {
  const [showIntroReplay, setShowIntroReplay] = useState(false);
  const [showStoryEngine, setShowStoryEngine] = useState(false);

  const teamId = data.team?.id;
  const isSprintStarted = data.cohort?.activated || false;
  
  // Simple progress tracking
  const storyState = data.storyState;
  const hasSeenIntro = storyState?.introComplete || false;
  const segmentsCompleted = storyState?.state?.completedSegments?.length || 0;
  const totalSegments = 30;
  const progressPercentage = (segmentsCompleted / totalSegments) * 100;

  // Story video configuration
  const storyVideoUrl = "/sprint/assets/intro/mentor-welcome.mp4";
  
  const getAutoplayUrl = (url: string) => {
    // Simple autoplay setup for local videos
    return url;
  };

  // Early return if sprint not started
  if (!isSprintStarted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sprint Not Started</h3>
        <p className="text-gray-600">
          The interactive story will be available once the sprint begins.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Featured Story Video Section */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Interactive Sprint Story
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Experience your startup journey through an interactive story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Featured Story Video */}
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                    <video
                      src={storyVideoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    {/* Overlay with play button */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="bg-white/90 text-black hover:bg-white text-lg px-8 py-4 rounded-full shadow-lg"
                        onClick={() => setShowStoryEngine(true)}
                      >
                        <Play className="w-6 h-6 mr-3 fill-current" />
                        {hasSeenIntro ? 'Continue Your Journey' : 'Start Interactive Story'}
                      </Button>
                    </div>
                  </div>

                  {/* Story Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Sprint Story Experience
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Interactive startup journey • 5 chapters • {segmentsCompleted}/{totalSegments} segments completed
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStoryEngine(true)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Story
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Story Features */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Your Interactive Journey
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        Problem Discovery & Research
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        Design & Planning Strategy
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        Development & Implementation
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        Testing & Quality Assurance
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        Launch & Growth Strategy
                      </div>
                      <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                        <Sparkles className="w-4 h-4" />
                        Make choices that shape your path!
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Story Progress</span>
                  <Badge variant={hasSeenIntro ? 'default' : 'secondary'}>
                    {hasSeenIntro ? 'Story Started' : 'Ready to Begin'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {segmentsCompleted}
                    </div>
                    <div className="text-xs text-gray-600">Segments Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      5
                    </div>
                    <div className="text-xs text-gray-600">Total Chapters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {hasSeenIntro ? 'Active' : 'Ready'}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Story Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => setShowStoryEngine(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {hasSeenIntro ? 'Continue Journey' : 'Start Story'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowIntroReplay(true)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Watch Introduction
                </Button>
              </CardContent>
            </Card>

            {/* Team Info */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Team Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {data.teamMembers?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {data.project?.tasks?.filter(t => t.completed).length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-gray-600">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {hasSeenIntro ? '🚀' : '⭐'}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Story Engine Modal */}
      {showStoryEngine && (
        <Dialog open={showStoryEngine} onOpenChange={setShowStoryEngine}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Sprint Story</DialogTitle>
            </DialogHeader>
            <StoryEngineWrapper
              teamId={teamId || ''}
              initialSegment={null}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Intro Replay Modal */}
      {showIntroReplay && (
        <Dialog open={showIntroReplay} onOpenChange={setShowIntroReplay}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Sprint Introduction</DialogTitle>
            </DialogHeader>
            <IntroStoryWrapper
              isOpen={showIntroReplay}
              onClose={() => setShowIntroReplay(false)}
              onComplete={() => setShowIntroReplay(false)}
              mode="replay"
              videoUrl="/sprint/assets/intro/mentor-welcome.mp4"
              teamName={data.team?.name || 'Your Team'}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

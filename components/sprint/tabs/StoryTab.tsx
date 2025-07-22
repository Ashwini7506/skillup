// components/sprint/tabs/StoryTab.tsx
'use client';

import { useState } from 'react';
import { Play, RotateCcw, BookOpen, Video, ExternalLink, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  // State to control what's shown in the video area
  const [videoAreaContent, setVideoAreaContent] = useState<'video' | 'story' | 'intro'>('video');
  
  const teamId = data.team?.id;
  const isSprintStarted = data.cohort?.activated || false;
  
  // Story state calculations
  const storyState = data.storyState;
  const hasSeenIntro = storyState?.introComplete || false;
  const segmentsCompleted = storyState?.state?.completedSegments?.length || 0;
  const totalSegments = 30;
  const progressPercentage = (segmentsCompleted / totalSegments) * 100;

  // Story video configuration
  const storyVideoUrl = "/sprint/assets/intro/mentor-welcome.mp4";

  // Early return if sprint not started
  if (!isSprintStarted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sprint Not Started</h3>
        <p className="text-gray-600 max-w-md">
          The interactive story will be available once the sprint begins.
        </p>
      </div>
    );
  }

  // Function to render content in the video area
 // Just change this part in the renderVideoAreaContent function:

// Function to render content in the video area
const renderVideoAreaContent = () => {
  switch (videoAreaContent) {
    case 'story':
  return (
    <div className="w-full h-full bg-white relative">
      <div className="absolute inset-0 bg-white z-0"></div>
      <div className="relative z-10 w-full h-full">
        <StoryEngineWrapper
          teamId={teamId || ''}
          initialSegment={null}
        />
      </div>
    </div>
  );

    
    case 'intro':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <IntroStoryWrapper
            isOpen={true}
            onClose={() => setVideoAreaContent('video')}
            onComplete={() => setVideoAreaContent('video')}
            mode="replay"
            videoUrl="/sprint/assets/intro/mentor-welcome.mp4"
            teamName={data.team?.name || 'Your Team'}
          />
        </div>
      );
    
    default:
      return (
        <div className="relative w-full h-full">
          <video
            src={storyVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Changed from bg-black bg-opacity-40 to bg-white bg-opacity-90 */}
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => setVideoAreaContent('story')}
              >
                <Play className="w-6 h-6 mr-3 fill-current" />
                {hasSeenIntro ? 'Continue Your Journey' : 'Start Interactive Story'}
              </Button>
            </div>
          </div>
        </div>
      );
  }
};

// And also change the video container background:
<div className="aspect-video bg-white rounded-lg relative overflow-hidden border border-gray-200">
  {renderVideoAreaContent()}
</div>


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
                {/* Featured Story Video/Content Area - Fixed container */}
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                    {renderVideoAreaContent()}
                  </div>

                  {/* Story Info and Controls - Fixed alignment */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        Sprint Story Experience
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Interactive startup journey • 5 chapters • {segmentsCompleted}/{totalSegments} segments completed
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {videoAreaContent !== 'video' && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setVideoAreaContent('video')}
                          className="whitespace-nowrap"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Video
                        </Button>
                      )}
                      {videoAreaContent === 'video' && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setVideoAreaContent('story')}
                          className="whitespace-nowrap"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Story
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story Features - Fixed grid layout */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Your Interactive Journey
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Problem Discovery & Research</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Design & Planning Strategy</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Development & Implementation</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <span>Testing & Quality Assurance</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                        <span>Launch & Growth Strategy</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-purple-600 font-medium">
                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                        <span>Make choices that shape your path!</span>
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
                  onClick={() => setVideoAreaContent('story')}
                  disabled={videoAreaContent === 'story'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {hasSeenIntro ? 'Continue Journey' : 'Start Story'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setVideoAreaContent('intro')}
                  disabled={videoAreaContent === 'intro'}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Watch Introduction
                </Button>

                {videoAreaContent !== 'video' && (
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setVideoAreaContent('video')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Back to Welcome Video
                  </Button>
                )}
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
    </div>
  );
}

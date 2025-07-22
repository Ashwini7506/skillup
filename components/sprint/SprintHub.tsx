// components/sprint/SprintHub.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar, Users, Trophy, Upload, Play, Settings } from 'lucide-react';
import { TeamTab } from './tabs/TeamTab';
import { RankingTab } from './tabs/RankingTab';
import { StoryTab } from './tabs/StoryTab';
import { SprintHubState, SprintLandingData } from '@/utils/sprintHub/types';
import { UploadsTab } from './tabs/UploadTab';

interface SprintHubProps {
  data: SprintLandingData;
  hubState: SprintHubState;
  workspaceId: string;
  isAdmin: boolean;
}

export function SprintHub({ data, hubState, workspaceId, isAdmin }: SprintHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'story');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['story', 'team', 'ranking', 'uploads'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`/workspace/${workspaceId}/sprint?${params.toString()}`);
  };

  // Not enrolled state
  if (!hubState.isEnrolled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join the Sprint</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You're not currently enrolled in any active sprint cohort.
            </p>
            <Button 
              onClick={() => router.push(`/workspace/${workspaceId}/sprint/enroll`)}
              className="w-full"
            >
              Enroll in Sprint
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No team state
  if (!hubState.hasTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Waiting for Team Assignment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You're enrolled in <strong>{data.cohort?.name}</strong> but haven't been assigned to a team yet.
            </p>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline">
                <Calendar className="w-4 h-4 mr-1" />
                Starts: {data.cohort?.startDate ? new Date(data.cohort.startDate).toLocaleDateString() : ''}
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-4 h-4 mr-1" />
                Ends: {data.cohort?.endDate ? new Date(data.cohort.endDate).toLocaleDateString() : ''}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Teams will be formed before the sprint begins. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cohort not started state
  if (!hubState.cohortStarted) {
    const startDate = data.cohort?.startDate ? new Date(data.cohort.startDate) : new Date();
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sprint Starts Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
            </div>
            <p className="text-gray-600">
              <strong>{data.cohort?.name}</strong> begins on{' '}
              {startDate.toLocaleDateString()}
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Team: {data.team?.name}</h3>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline">
                  <Users className="w-4 h-4 mr-1" />
                  {data.teamMembers.length} members
                </Badge>
              </div>
            </div>

            <Tabs value="team" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="team">Team Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="team">
                <TeamTab 
                  data={data} 
                  workspaceId={workspaceId}
                  readonly={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cohort ended state
  if (hubState.cohortEnded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sprint Completed</CardTitle>
              <p className="text-gray-600">
                <strong>{data.cohort?.name}</strong> ended on{' '}
                {data.cohort?.endDate ? new Date(data.cohort.endDate).toLocaleDateString() : ''}
              </p>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="team">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="ranking">
                <Trophy className="w-4 h-4 mr-2" />
                Final Results
              </TabsTrigger>
              <TabsTrigger value="uploads">
                <Upload className="w-4 h-4 mr-2" />
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team">
              <TeamTab data={data} workspaceId={workspaceId} readonly={true} />
            </TabsContent>
            <TabsContent value="ranking">
              <RankingTab data={data} workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="uploads">
              <UploadsTab data={data} workspaceId={workspaceId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Active sprint state
  const endDate = data.cohort?.endDate ? new Date(data.cohort.endDate) : new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{data.cohort?.name}</h1>
            <p className="text-gray-600">Team: {data.team?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              <Calendar className="w-4 h-4 mr-1" />
              Ends: {endDate.toLocaleDateString()}
            </Badge>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => router.push(`/workspace/${workspaceId}/sprint/admin`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="story" disabled={!hubState.canAccessStory}>
              <Play className="w-4 h-4 mr-2" />
              Story
            </TabsTrigger>
            <TabsTrigger value="team" disabled={!hubState.canAccessTeam}>
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="ranking" disabled={!hubState.canAccessRanking}>
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="uploads" disabled={!hubState.canAccessUploads}>
              <Upload className="w-4 h-4 mr-2" />
              Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story">
            <StoryTab data={data} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="team">
            <TeamTab data={data} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="ranking">
            <RankingTab data={data} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="uploads">
            <UploadsTab data={data} workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
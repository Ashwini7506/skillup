// components/sprint/tabs/RankingTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Upload, CheckCircle } from 'lucide-react';
import { RankingData, SprintLandingData } from '@/utils/sprintHub/types';

interface RankingTabProps {
  data: SprintLandingData;
  workspaceId: string;
}

type SortBy = 'totalScore' | 'avgVotes' | 'completionPercentage' | 'uploadCount';

export function RankingTab({ data, workspaceId }: RankingTabProps) {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('totalScore');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.cohort?.id) {
      fetchRankings();
    }
  }, [data.cohort?.id]);

  const fetchRankings = async () => {
  try {
    const response = await fetch(`/api/sprint/ranking?cohortId=${data.cohort?.id}`);
    if (response.ok) {
      const json = await response.json();
      const rankingData = json.teams; // FIX: Read correct key
      setRankings(Array.isArray(rankingData) ? rankingData : []);
    } else {
      setRankings([]);
    }
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    setRankings([]);
  } finally {
    setLoading(false);
  }
};


  // Ensure rankings is always an array before spreading
  const safeRankings = Array.isArray(rankings) ? rankings : [];
  const sortedRankings = [...safeRankings].sort((a, b) => {
    switch (sortBy) {
      case 'avgVotes':
        return b.avgVotes - a.avgVotes;
      case 'completionPercentage':
        return b.completionPercentage - a.completionPercentage;
      case 'uploadCount':
        return b.uploadCount - a.uploadCount;
      default:
        return b.totalScore - a.totalScore;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const currentTeam = safeRankings.find(r => r.isCurrentTeam);
  const currentTeamRank = sortedRankings.findIndex(r => r.isCurrentTeam) + 1;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show message if no rankings data
  if (safeRankings.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Available</h3>
              <p className="text-gray-500">Rankings will appear once teams start participating in activities.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Team Performance */}
      {currentTeam && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <TrendingUp className="w-5 h-5 mr-2" />
              Your Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  #{currentTeamRank}
                </div>
                <div className="text-sm text-gray-600">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentTeam.avgVotes.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(currentTeam.completionPercentage)}%
                </div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentTeam.uploadCount}
                </div>
                <div className="text-sm text-gray-600">Uploads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalScore">Total Score</SelectItem>
                <SelectItem value="avgVotes">Average Votes</SelectItem>
                <SelectItem value="completionPercentage">Completion %</SelectItem>
                <SelectItem value="uploadCount">Upload Count</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedRankings.map((team, index) => {
              const rank = index + 1;
              const isCurrentTeam = team.isCurrentTeam;
              
              return (
                <div
                  key={team.teamId}
                  className={`p-4 border rounded-lg transition-all ${
                    isCurrentTeam 
                      ? 'border-blue-500 bg-blue-50 border-l-4 border-l-blue-500' 
                      : getRankColor(rank)
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(rank)}
                      <div>
                        <div className="font-medium flex items-center">
                          {team.teamName}
                          {isCurrentTeam && (
                            <Badge variant="outline" className="ml-2 text-blue-600">
                              Your Team
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {team.totalScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 mr-1" />
                          {team.avgVotes.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Avg Votes</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {Math.round(team.completionPercentage)}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Upload className="w-4 h-4 mr-1" />
                          {team.uploadCount}
                        </div>
                        <div className="text-xs text-gray-500">Uploads</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar for completion */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Task Completion</span>
                      <span>{Math.round(team.completionPercentage)}%</span>
                    </div>
                    <Progress value={team.completionPercentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ranking Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {safeRankings.length}
              </div>
              <div className="text-sm text-gray-600">Total Teams</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {Math.round(safeRankings.reduce((acc, team) => acc + team.completionPercentage, 0) / safeRankings.length || 0)}%
              </div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {(safeRankings.reduce((acc, team) => acc + team.avgVotes, 0) / safeRankings.length || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Votes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {safeRankings.reduce((acc, team) => acc + team.uploadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Uploads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




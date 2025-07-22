// components/sprint/admin/MetricsViewer.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Target, Calendar, Download, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CohortMetrics {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'scheduled';
  enrollmentCount: number;
  teamCount: number;
  completionRate: number;
  engagementScore: number;
  projectsSubmitted: number;
  averageTeamSize: number;
}

interface EngagementData {
  date: string;
  activeUsers: number;
  completedTasks: number;
  teamMeetings: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

interface ProjectMetrics {
  id: string;
  name: string;
  teamName: string;
  cohortName: string;
  status: 'planning' | 'in-progress' | 'completed' | 'submitted';
  completionPercentage: number;
  lastActivity: Date;
  teamSize: number;
}

interface MetricsData {
  cohortMetrics: CohortMetrics[];
  engagementData: EngagementData[];
  roleDistribution: RoleDistribution[];
  projectMetrics: ProjectMetrics[];
  summary: {
    totalParticipants: number;
    activeTeams: number;
    completedProjects: number;
    averageEngagement: number;
    retentionRate: number;
  };
}

interface MetricsViewerProps {
  workspaceId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Default empty metrics data to prevent undefined errors
const getDefaultMetricsData = (): MetricsData => ({
  cohortMetrics: [],
  engagementData: [],
  roleDistribution: [],
  projectMetrics: [],
  summary: {
    totalParticipants: 0,
    activeTeams: 0,
    completedProjects: 0,
    averageEngagement: 0,
    retentionRate: 0,
  },
});

export default function MetricsViewer({ workspaceId }: MetricsViewerProps) {
  const [metrics, setMetrics] = useState<MetricsData>(getDefaultMetricsData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMetrics();
  }, [workspaceId, selectedCohort, dateRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/sprint/admin/metrics?workspaceId=${workspaceId}&cohortId=${selectedCohort}&range=${dateRange}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data); // Debug logging
      
      // Ensure the data structure matches expectations with fallbacks
      const processedData: MetricsData = {
        cohortMetrics: Array.isArray(data.cohortMetrics) ? data.cohortMetrics.map((cohort: any) => ({
          ...cohort,
          startDate: new Date(cohort.startDate),
          endDate: new Date(cohort.endDate),
        })) : [],
        engagementData: Array.isArray(data.engagementData) ? data.engagementData : [],
        roleDistribution: Array.isArray(data.roleDistribution) ? data.roleDistribution : [],
        projectMetrics: Array.isArray(data.projectMetrics) ? data.projectMetrics.map((project: any) => ({
          ...project,
          lastActivity: new Date(project.lastActivity),
        })) : [],
        summary: data.summary || getDefaultMetricsData().summary,
      };
      
      console.log('Processed data:', processedData); // Debug logging
      setMetrics(processedData);
      
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setMetrics(getDefaultMetricsData());
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(
        `/api/sprint/admin/metrics/export?workspaceId=${workspaceId}&cohortId=${selectedCohort}&range=${dateRange}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint-metrics-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.warn('Export endpoint not available');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-600 mb-4">Error loading metrics: {error}</div>
        <Button onClick={fetchMetrics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sprint Metrics</h2>
          <p className="text-muted-foreground">Analytics and insights for your sprint programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {metrics.cohortMetrics?.map(cohort => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.summary.totalParticipants}</div>
                <p className="text-xs text-muted-foreground">
                  Across all cohorts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.summary.activeTeams}</div>
                <p className="text-xs text-muted-foreground">
                  Currently working
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.summary.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.summary.averageEngagement}%</div>
                <p className="text-xs text-muted-foreground">
                  Participant activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.summary.retentionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Program completion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.roleDistribution && metrics.roleDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.roleDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ role, percentage }) => `${role} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {metrics.roleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No role distribution data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.engagementData && metrics.engagementData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                        <Line type="monotone" dataKey="completedTasks" stroke="#82ca9d" name="Completed Tasks" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No engagement data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement</CardTitle>
              <CardDescription>User activity and task completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.engagementData && metrics.engagementData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
                      <Bar dataKey="completedTasks" fill="#82ca9d" name="Completed Tasks" />
                      <Bar dataKey="teamMeetings" fill="#ffc658" name="Team Meetings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No engagement data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <div className="grid gap-4">
            {metrics.cohortMetrics && metrics.cohortMetrics.length > 0 ? (
              metrics.cohortMetrics.map(cohort => (
                <Card key={cohort.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cohort.name}</CardTitle>
                        <CardDescription>
                          {cohort.startDate.toLocaleDateString()} - {cohort.endDate.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(cohort.status)}>
                        {cohort.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{cohort.enrollmentCount}</div>
                        <div className="text-sm text-muted-foreground">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{cohort.teamCount}</div>
                        <div className="text-sm text-muted-foreground">Teams</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{cohort.completionRate}%</div>
                        <div className="text-sm text-muted-foreground">Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{cohort.engagementScore}%</div>
                        <div className="text-sm text-muted-foreground">Engagement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    No cohort data available for the selected filters.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Current status of all team projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.projectMetrics.length > 0 ? (
                  metrics.projectMetrics.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge className={getProjectStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {project.teamName} • {project.cohortName} • {project.teamSize} members
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last activity: {project.lastActivity.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{project.completionPercentage}%</div>
                        <div className="text-sm text-muted-foreground">Complete</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No project data available for the selected filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
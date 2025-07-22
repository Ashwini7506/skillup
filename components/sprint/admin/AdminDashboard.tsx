// components/sprint/admin/AdminDashboard.tsx
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Target, BarChart3, Settings, Calendar, Package } from 'lucide-react';
import CohortsManager from './CohortsManager';
import EnrollmentsManager from './EnrollmentsManager';
import TeamsManager from './TeamsManager';
import MetricsViewer from './MetricsViewer';
import AdminsManager from './AdminsManager';
import ProjectsManager from './ProjectsManager'; // New import

interface OverviewData {
  totalMembers: number;
  activeEnrollments: number;
  activeCohorts: number;
  totalTeams: number;
  recentCohorts: Array<{
    id: string;
    name: string;
    activated: boolean;
    enrollmentCount: number;
    teamCount: number;
    startDate: Date | null;
    endDate: Date | null;
  }>;
}

interface AdminDashboardProps {
  workspaceId: string;
  workspaceName: string;
  overviewData: OverviewData;
}

export default function AdminDashboard({ 
  workspaceId, 
  workspaceName, 
  overviewData 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getSprintStatus = (cohort: OverviewData['recentCohorts'][0]) => {
    if (!cohort.activated) return 'inactive';
    
    const now = new Date();
    if (cohort.startDate && now < cohort.startDate) return 'scheduled';
    if (cohort.endDate && now > cohort.endDate) return 'completed';
    if (cohort.startDate && now >= cohort.startDate && (!cohort.endDate || now <= cohort.endDate)) return 'active';
    
    return 'draft';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{workspaceName} Admin</h1>
          <p className="text-muted-foreground">Manage your workspace sprints and teams</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview content remains the same */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active workspace members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.activeEnrollments}</div>
                <p className="text-xs text-muted-foreground">
                  Currently enrolled members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.activeCohorts}</div>
                <p className="text-xs text-muted-foreground">
                  Running sprint cohorts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.totalTeams}</div>
                <p className="text-xs text-muted-foreground">
                  Formed teams across cohorts
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Cohorts</CardTitle>
              <CardDescription>
                Overview of your most recent sprint cohorts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overviewData.recentCohorts.length > 0 ? (
                  overviewData.recentCohorts.map((cohort) => {
                    const status = getSprintStatus(cohort);
                    return (
                      <div key={cohort.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium">{cohort.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {cohort.enrollmentCount} enrollments • {cohort.teamCount} teams
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          {cohort.startDate && (
                            <span className="text-sm text-muted-foreground">
                              {cohort.startDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No cohorts found. Create your first cohort to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts">
          <CohortsManager workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentsManager workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsManager workspaceId={workspaceId} />
        </TabsContent>

        {/* New Projects Tab */}
        <TabsContent value="projects">
          <ProjectsManager workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsViewer workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

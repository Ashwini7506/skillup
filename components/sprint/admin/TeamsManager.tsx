// components/sprint/admin/TeamsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shuffle, Plus, Edit, Trash2, Target, UserPlus, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface SprintTeam {
  id: string;
  name: string;
  cohortId: string;
  cohortName: string;
  members: string[];
  projectId?: string;
  projectName?: string;
  memberDetails: Array<{
    id: string;
    email: string;
    name: string;
    sprintRole?: string;
  }>;
  createdAt: Date;
}

interface EnrolledUser {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  intendedRole: string;
  cohortId: string;
  cohortName: string;
  isAssigned: boolean;
}

interface SprintCohort {
  id: string;
  name: string;
  activated: boolean;
  enrollmentCount: number;
  unassignedCount: number;
}

interface TeamsManagerProps {
  workspaceId: string;
}

export default function TeamsManager({ workspaceId }: TeamsManagerProps) {
  const [teams, setTeams] = useState<SprintTeam[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [allEnrolledUsers, setAllEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [cohorts, setCohorts] = useState<SprintCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCohort, setFilterCohort] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('teams');
  
  // Create team dialog state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCohort, setNewTeamCohort] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Edit team dialog state
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<SprintTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  
  // Auto-assign dialog state
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [autoAssignCohort, setAutoAssignCohort] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [assignmentStrategy, setAssignmentStrategy] = useState<'random' | 'balanced'>('balanced');

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    try {
      const [teamsResponse, enrolledResponse, allEnrolledResponse, cohortsResponse] = await Promise.all([
        fetch(`/api/sprint/admin/teams?workspaceId=${workspaceId}`),
        fetch(`/api/sprint/admin/enrollments?workspaceId=${workspaceId}&unassignedOnly=true`),
        fetch(`/api/sprint/admin/enrollments?workspaceId=${workspaceId}`),
        fetch(`/api/sprint/admin/cohorts?workspaceId=${workspaceId}`)
      ]);

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }

      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        setEnrolledUsers(enrolledData.enrolledUsers || []);
      }

      if (allEnrolledResponse.ok) {
        const allEnrolledData = await allEnrolledResponse.json();
        setAllEnrolledUsers(allEnrolledData.enrolledUsers || []);
      }

      if (cohortsResponse.ok) {
        const cohortsData = await cohortsResponse.json();
        setCohorts(cohortsData.cohorts || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !newTeamCohort) {
      return;
    }

    try {
      const payload = {
        workspaceId,
        cohortId: newTeamCohort,
        mode: 'manual',
        teams: [{
          name: newTeamName,
          members: selectedMembers
        }]
      };

      const response = await fetch(`/api/sprint/admin/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchData();
        setIsCreateTeamOpen(false);
        setNewTeamName('');
        setNewTeamCohort('');
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleEditTeam = async () => {
    if (!editingTeam || !editTeamName.trim()) return;

    try {
      const response = await fetch(`/api/sprint/admin/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          teamId: editingTeam.id,
          name: editTeamName
        })
      });

      if (response.ok) {
        await fetchData();
        setIsEditTeamOpen(false);
        setEditingTeam(null);
        setEditTeamName('');
      }
    } catch (error) {
      console.error('Failed to edit team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/sprint/admin/teams?workspaceId=${workspaceId}&teamId=${teamId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const handleAutoAssign = async () => {
    if (!autoAssignCohort || teamSize < 2) return;

    try {
      const response = await fetch('/api/sprint/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          cohortId: autoAssignCohort,
          mode: 'auto'
        })
      });

      if (response.ok) {
        await fetchData();
        setIsAutoAssignOpen(false);
        setAutoAssignCohort('');
        setTeamSize(4);
      }
    } catch (error) {
      console.error('Failed to auto-assign teams:', error);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          teamId,
          action: 'removeMember',
          userId
        })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleAddMember = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          teamId,
          action: 'addMember',
          userId
        })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const openEditDialog = (team: SprintTeam) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setIsEditTeamOpen(true);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.cohortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCohort === 'all' || team.cohortId === filterCohort;
    return matchesSearch && matchesFilter;
  });

  const availableUsersForCohort = (cohortId: string) => {
    const teamsInCohort = teams.filter(team => team.cohortId === cohortId);
    const assignedUserIds = teamsInCohort.flatMap(team => team.members);
    const usersInCohort = allEnrolledUsers.filter(user => user.cohortId === cohortId);
    const available = usersInCohort.filter(user => {
      const isNotAssigned = !assignedUserIds.includes(user.userId);
      return isNotAssigned;
    });
    
    return available;
  };

  const activeCohorts = cohorts.filter(cohort => cohort.activated);

  useEffect(() => {
    if (newTeamCohort) {
      availableUsersForCohort(newTeamCohort);
    }
  }, [newTeamCohort, allEnrolledUsers, teams]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading teams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Teams Management</h2>
          <p className="text-muted-foreground">Manage sprint teams and assignments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAutoAssignOpen} onOpenChange={setIsAutoAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shuffle className="w-4 h-4 mr-2" />
                Auto Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto Assign Teams</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="auto-cohort">Select Cohort</Label>
                  <Select value={autoAssignCohort} onValueChange={setAutoAssignCohort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCohorts.map(cohort => (
                        <SelectItem key={cohort.id} value={cohort.id}>
                          {cohort.name} ({cohort.unassignedCount} unassigned)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="team-size">Team Size</Label>
                  <Input
                    id="team-size"
                    type="number"
                    min="2"
                    max="10"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)}
                  />
                </div>

                <div>
                  <Label htmlFor="strategy">Assignment Strategy</Label>
                  <Select value={assignmentStrategy} onValueChange={(value: 'random' | 'balanced') => setAssignmentStrategy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random Assignment</SelectItem>
                      <SelectItem value="balanced">Balanced by Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAutoAssignOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAutoAssign} disabled={!autoAssignCohort}>
                    Create Teams
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateTeamOpen} onOpenChange={(open) => {
            setIsCreateTeamOpen(open);
            if (!open) {
              setNewTeamName('');
              setNewTeamCohort('');
              setSelectedMembers([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={newTeamName}
                    onChange={(e) => {
                      setNewTeamName(e.target.value);
                    }}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="team-cohort">Cohort</Label>
                  <Select value={newTeamCohort} onValueChange={(value) => {
                    setNewTeamCohort(value);
                    setSelectedMembers([]);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCohorts.map(cohort => {
                        return (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    Active cohorts: {activeCohorts.length}
                  </div>
                </div>

                {newTeamCohort && (
                  <div>
                    <Label>Select Members</Label>
                    <div className="text-sm text-muted-foreground mb-2">
                      Available members: {availableUsersForCohort(newTeamCohort).length}
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                      {availableUsersForCohort(newTeamCohort).length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2">
                          No available members in this cohort. All members may already be assigned to teams.
                          <div className="mt-2 text-xs">
                            Debug info: 
                            <br />• Total users in all cohorts: {allEnrolledUsers.length}
                            <br />• Users in selected cohort: {allEnrolledUsers.filter(u => u.cohortId === newTeamCohort).length}
                            <br />• Teams in selected cohort: {teams.filter(t => t.cohortId === newTeamCohort).length}
                          </div>
                        </div>
                      ) : (
                        availableUsersForCohort(newTeamCohort).map(user => {
                          return (
                            <div key={user.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedMembers.includes(user.userId)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMembers(prev => [...prev, user.userId]);
                                  } else {
                                    setSelectedMembers(prev => prev.filter(id => id !== user.userId));
                                  }
                                }}
                              />
                              <span className="text-sm">
                                {user.user.name} ({user.user.email})
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {user.intendedRole}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Selected members: {selectedMembers.length}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!newTeamName.trim() || !newTeamCohort}>
                    Create Team
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Unassigned ({enrolledUsers.filter(u => !u.isAssigned).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCohort} onValueChange={setFilterCohort}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {activeCohorts.map(cohort => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map(team => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.cohortName}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(team)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Members ({team.memberDetails.length})</span>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {team.memberDetails.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      {team.memberDetails.map(member => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <span>{member.name}</span>
                          <div className="flex items-center gap-1">
                            {member.sprintRole && (
                              <Badge variant="secondary" className="text-xs">
                                {member.sprintRole}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(team.id, member.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {team.projectName && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>{team.projectName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teams found. Create your first team to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Members</CardTitle>
              <CardDescription>
                Members enrolled in cohorts but not assigned to teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledUsers.filter(user => !user.isAssigned).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {user.user.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.user.email} • {user.cohortName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {user.intendedRole}
                      </Badge>
                      <Select onValueChange={(teamId) => handleAddMember(teamId, user.userId)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.filter(team => team.cohortId === user.cohortId).map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                
                {enrolledUsers.filter(user => !user.isAssigned).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    All enrolled members are assigned to teams.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditTeamOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTeam} disabled={!editTeamName.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

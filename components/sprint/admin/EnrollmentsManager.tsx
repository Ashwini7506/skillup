// components/sprint/admin/EnrollmentsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Users, Search, Filter, Mail, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { inviteUsersToSprintCohort } from '@/app/actions/sprint-invitation-actions';

interface WorkspaceMember {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name?: string; // Ensure name is included
  };
  accessLevel: 'OWNER' | 'MEMBER';
  isEnrolled: boolean;
  enrollmentId?: string;
  intendedRole?: string;
  cohortName?: string;
}

interface SprintCohort {
  id: string;
  name: string;
  activated: boolean;
  startDate: Date;
  endDate: Date;
}

interface EnrollmentsManagerProps {
  workspaceId: string;
}

export default function EnrollmentsManager({ workspaceId }: EnrollmentsManagerProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [cohorts, setCohorts] = useState<SprintCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enrolled' | 'not-enrolled'>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [defaultRole, setDefaultRole] = useState('participant');
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [isEmailInviteOpen, setIsEmailInviteOpen] = useState(false);
  const [emailInvites, setEmailInvites] = useState('');
  const [inviteResults, setInviteResults] = useState<any>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    try {
      const [membersResponse, cohortsResponse] = await Promise.all([
        fetch(`/api/sprint/admin/enrollments?workspaceId=${workspaceId}`),
        fetch(`/api/sprint/admin/cohorts?workspaceId=${workspaceId}`)
      ]);

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
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

  const handleBulkEnroll = async () => {
    console.log('handleBulkEnroll called', {
      selectedCohort,
      selectedMembers,
      defaultRole,
      workspaceId
    });

    if (!selectedCohort || selectedMembers.length === 0) {
      console.log('Validation failed:', {
        hasSelectedCohort: !!selectedCohort,
        membersCount: selectedMembers.length
      });
      return;
    }

    try {
      console.log('Making bulk enrollment request...');
      const response = await fetch('/api/sprint/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          cohortId: selectedCohort,
          userIds: selectedMembers,
          intendedRole: defaultRole
        })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('Bulk enrollment successful, refreshing data...');
        await fetchData();
        setSelectedMembers([]);
        setSelectedCohort('');
        setIsBulkEnrollOpen(false);
      } else {
        console.error('Bulk enrollment failed:', responseData);
      }
    } catch (error) {
      console.error('Failed to bulk enroll:', error);
    }
  };

  const handleEmailInvite = async () => {
    if (!selectedCohort || !emailInvites.trim()) return;

    setIsInviting(true);
    
    try {
      // Parse emails from textarea (split by comma, newline, or space)
      const emails = emailInvites
        .split(/[,\n\s]+/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        throw new Error('Please enter at least one email address');
      }

      const formData = new FormData();
      formData.append('emails', JSON.stringify(emails));
      formData.append('workspaceId', workspaceId);
      formData.append('cohortId', selectedCohort);
      formData.append('intendedRole', defaultRole);

      const result = await inviteUsersToSprintCohort(formData);
      setInviteResults(result);

      if (result.success) {
        setEmailInvites('');
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to send invites:', error);
      setInviteResults({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invites'
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleIndividualEnroll = async (userId: string, cohortId: string) => {
    try {
      const response = await fetch('/api/sprint/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          cohortId,
          userIds: [userId],
          intendedRole: 'participant'
        })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to enroll user:', error);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to unenroll user:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    if (!member || !member.user) return false;
    
    const matchesSearch = 
      ((member.user.name?.toLowerCase() || '')).includes(searchTerm.toLowerCase()) ||
      (member.user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'enrolled' && member.isEnrolled) ||
      (filterStatus === 'not-enrolled' && !member.isEnrolled);

    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const notEnrolledIds = filteredMembers
        .filter(member => !member.isEnrolled)
        .map(member => member.userId);
      setSelectedMembers(notEnrolledIds);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, userId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== userId));
    }
  };

  const activeCohorts = cohorts.filter(cohort => cohort.activated);

  if (loading) {
    return <div className="flex justify-center p-8">Loading enrollments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enrollments Management</h2>
          <p className="text-muted-foreground">Manage sprint enrollments and participation</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsEmailInviteOpen(true)}
            disabled={activeCohorts.length === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email Invitations
          </Button>
          
          
        </div>
      </div>

      {/* Bulk Enroll Dialog */}
      <Dialog open={isBulkEnrollOpen} onOpenChange={setIsBulkEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Enroll Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cohort-select">Select Cohort</Label>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {activeCohorts.map(cohort => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role-select">Default Role</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="lead">Team Lead</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedMembers.length} members selected for enrollment
              {selectedMembers.length > 0 && (
                <div className="mt-2">
                  <strong>Selected members:</strong>
                  <ul className="list-disc list-inside text-xs">
                    {selectedMembers.map(userId => {
                      const member = members.find(m => m.userId === userId);
                      return (
                        <li key={userId}>
                          {member?.user?.name} ({member?.user?.email})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBulkEnrollOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkEnroll}
                disabled={!selectedCohort || selectedMembers.length === 0}
              >
                Enroll Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Invite Dialog */}
      <Dialog open={isEmailInviteOpen} onOpenChange={setIsEmailInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email Invitations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cohort-select">Select Cohort</Label>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {activeCohorts.map(cohort => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role-select">Default Role</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="lead">Team Lead</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email-invites">Email Addresses</Label>
              <Textarea
                id="email-invites"
                placeholder="Enter email addresses separated by commas, spaces, or new lines..."
                value={emailInvites}
                onChange={(e) => setEmailInvites(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple emails with commas, spaces, or line breaks
              </p>
            </div>

            {inviteResults && (
              <div className="text-sm">
                {inviteResults.success ? (
                  <div className="text-green-600">
                    ✓ {inviteResults.message}
                    {inviteResults.results && (
                      <div className="mt-2 space-y-1">
                        {inviteResults.results.map((result: any, idx: number) => (
                          <div key={idx} className={
                            result.status === 'success' ? 'text-green-600' :
                            result.status === 'already_invited' || result.status === 'already_enrolled' ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {result.email}: {result.status === 'success' ? 'Invited' : result.error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    ✗ {inviteResults.error}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEmailInviteOpen(false);
                  setInviteResults(null);
                  setEmailInvites('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEmailInvite}
                disabled={!selectedCohort || !emailInvites.trim() || isInviting}
              >
                {isInviting ? 'Sending...' : 'Send Invitations'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workspace Members</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedMembers.length > 0 && 
                  selectedMembers.length === filteredMembers.filter(m => !m.isEnrolled).length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select all eligible
              </Label>
            </div>
          </div>
          <CardDescription>
            {filteredMembers.length} members found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {!member.isEnrolled && (
                    <Checkbox
                      checked={selectedMembers.includes(member.userId)}
                      onCheckedChange={(checked) => 
                        handleSelectMember(member.userId, checked as boolean)
                      }
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {member.user?.name || 'No name available'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user?.email || 'No email available'}
                    </div>
                    {member.isEnrolled && member.cohortName && (
                      <div className="text-xs text-blue-600 mt-1">
                        Enrolled in: {member.cohortName}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={member.accessLevel === 'OWNER' ? 'default' : 'secondary'}>
                    {member.accessLevel}
                  </Badge>
                  
                  {member.isEnrolled ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Enrolled
                      </Badge>
                      {member.intendedRole && (
                        <Badge variant="outline">
                          {member.intendedRole}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => member.enrollmentId && handleUnenroll(member.enrollmentId)}
                      >
                        Unenroll
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Not Enrolled
                      </Badge>
                      {activeCohorts.length > 0 && (
                        <Select onValueChange={(cohortId) => handleIndividualEnroll(member.userId, cohortId)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Enroll" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeCohorts.map(cohort => (
                              <SelectItem key={cohort.id} value={cohort.id}>
                                {cohort.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No members found</p>
                <p className="text-sm">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No workspace members available.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-bold text-green-600">
                  {members.filter(m => m.isEnrolled).length}
                </p>
              </div>
              <Badge className="w-8 h-8 rounded-full bg-green-100 text-green-600">
                ✓
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cohorts</p>
                <p className="text-2xl font-bold text-blue-600">{activeCohorts.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
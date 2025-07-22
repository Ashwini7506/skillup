// components/sprint/admin/AdminsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Shield, Settings, Search, MoreHorizontal, Crown, User, Mail, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkspaceAdmin {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role: 'OWNER' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
  addedAt: Date;
  addedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastActive?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

interface PendingInvitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR';
  permissions: string[];
  invitedAt: Date;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  expiresAt: Date;
  status: 'pending' | 'expired';
}

interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: Date;
  category: 'user_management' | 'cohort_management' | 'team_management' | 'settings' | 'permissions';
}

interface AdminsManagerProps {
  workspaceId: string;
}

const PERMISSION_LABELS = {
  'manage_cohorts': 'Manage Cohorts',
  'manage_teams': 'Manage Teams',
  'manage_enrollments': 'Manage Enrollments',
  'view_metrics': 'View Metrics',
  'manage_settings': 'Manage Settings',
  'manage_admins': 'Manage Admins',
  'export_data': 'Export Data',
  'moderate_content': 'Moderate Content'
};

const ROLE_PERMISSIONS = {
  OWNER: Object.keys(PERMISSION_LABELS),
  ADMIN: ['manage_cohorts', 'manage_teams', 'manage_enrollments', 'view_metrics', 'export_data', 'moderate_content'],
  MODERATOR: ['manage_enrollments', 'view_metrics', 'moderate_content']
};

export default function AdminsManager({ workspaceId }: AdminsManagerProps) {
  const [admins, setAdmins] = useState<WorkspaceAdmin[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('admins');
  
  // Invite dialog state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MODERATOR'>('ADMIN');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  
  // Edit permissions dialog state
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<WorkspaceAdmin | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MODERATOR'>('ADMIN');

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    try {
      const [adminsResponse, invitationsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/sprint/admin/admins?workspaceId=${workspaceId}`),
        fetch(`/api/sprint/admin/invitations?workspaceId=${workspaceId}`),
        fetch(`/api/sprint/admin/activities?workspaceId=${workspaceId}&limit=50`)
      ]);

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData.admins || []);
        setCurrentUserRole(adminsData.currentUserRole || 'ADMIN');
      }

      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.invitations || []);
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const response = await fetch('/api/sprint/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          email: inviteEmail,
          role: inviteRole,
          permissions: customPermissions.length > 0 ? customPermissions : ROLE_PERMISSIONS[inviteRole]
        })
      });

      if (response.ok) {
        await fetchData();
        setIsInviteOpen(false);
        setInviteEmail('');
        setInviteRole('ADMIN');
        setCustomPermissions([]);
      }
    } catch (error) {
      console.error('Failed to invite admin:', error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingAdmin) return;

    try {
      const response = await fetch(`/api/sprint/admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: editPermissions
        })
      });

      if (response.ok) {
        await fetchData();
        setIsEditPermissionsOpen(false);
        setEditingAdmin(null);
        setEditPermissions([]);
      }
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/sprint/admin/admins/${adminId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to remove admin:', error);
    }
  };

  const handleSuspendAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/admins/${adminId}/suspend`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to suspend admin:', error);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/invitations/${invitationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/sprint/admin/invitations/${invitationId}/resend`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    }
  };

  const openEditPermissions = (admin: WorkspaceAdmin) => {
    setEditingAdmin(admin);
    setEditPermissions(admin.permissions);
    setIsEditPermissionsOpen(true);
  };

  const togglePermission = (permission: string, isCustom: boolean = false) => {
    const setter = isCustom ? setCustomPermissions : setEditPermissions;
    const current = isCustom ? customPermissions : editPermissions;
    
    if (current.includes(permission)) {
      setter(current.filter(p => p !== permission));
    } else {
      setter([...current, permission]);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'MODERATOR': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || admin.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const canManageAdmins = currentUserRole === 'OWNER' || (currentUserRole === 'ADMIN' && admins.find(a => a.userId === 'current-user')?.permissions.includes('manage_admins'));

  if (loading) {
    return <div className="flex justify-center p-8">Loading admin settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-muted-foreground">Manage workspace administrators and permissions</p>
        </div>
        {canManageAdmins && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'ADMIN' | 'MODERATOR') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Custom Permissions (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`custom-${key}`}
                          checked={customPermissions.includes(key)}
                          onChange={() => togglePermission(key, true)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`custom-${key}`} className="text-sm">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteAdmin} disabled={!inviteEmail.trim()}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Administrators</CardTitle>
              <CardDescription>Manage workspace administrators and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {admin.user.avatar ? (
                          <img src={admin.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {admin.user.firstName} {admin.user.lastName}
                          </h3>
                          {admin.role === 'OWNER' && <Crown className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{admin.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRoleColor(admin.role)}>
                            {admin.role}
                          </Badge>
                          <Badge className={getStatusColor(admin.status)}>
                            {admin.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-muted-foreground">
                        {admin.lastActive && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Last active: {new Date(admin.lastActive).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div>Added: {new Date(admin.addedAt).toLocaleDateString()}</div>
                      </div>
                      {canManageAdmins && admin.role !== 'OWNER' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditPermissions(admin)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendAdmin(admin.id)}>
                              <Shield className="w-4 h-4 mr-2" />
                              {admin.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemoveAdmin(admin.id)}
                              className="text-red-600"
                            >
                              Remove Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Manage pending administrator invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending invitations
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{invitation.email}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(invitation.role)}>
                              {invitation.role}
                            </Badge>
                            <Badge variant={invitation.status === 'expired' ? 'destructive' : 'secondary'}>
                              {invitation.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Invited {new Date(invitation.invitedAt).toLocaleDateString()} by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                          disabled={invitation.status === 'expired'}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeInvitation(invitation.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Log</CardTitle>
              <CardDescription>Recent administrator actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.adminName}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.action}: {activity.details}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {activity.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
          </DialogHeader>
          {editingAdmin && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {editingAdmin.user.avatar ? (
                    <img src={editingAdmin.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {editingAdmin.user.firstName} {editingAdmin.user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{editingAdmin.user.email}</p>
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-${key}`}
                        checked={editPermissions.includes(key)}
                        onChange={() => togglePermission(key)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`edit-${key}`} className="text-sm">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePermissions}>
                  Update Permissions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
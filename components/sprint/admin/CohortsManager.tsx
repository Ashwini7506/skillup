// components/sprint/admin/CohortsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Calendar, Users, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SprintCohort {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  activated: boolean;
  enrollmentCount: number;
  teamCount: number;
  createdAt: Date;
}

interface CohortsManagerProps {
  workspaceId: string;
}

export default function CohortsManager({ workspaceId }: CohortsManagerProps) {
  const [cohorts, setCohorts] = useState<SprintCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<SprintCohort | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    activated: false
  });

  useEffect(() => {
    fetchCohorts();
  }, [workspaceId]);

  const fetchCohorts = async () => {
    try {
      const response = await fetch(`/api/sprint/admin/cohorts?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const cohortsWithDates = data.cohorts?.map((cohort: any) => ({
          ...cohort,
          startDate: new Date(cohort.startDate),
          endDate: new Date(cohort.endDate),
          createdAt: new Date(cohort.createdAt)
        })) || [];
        setCohorts(cohortsWithDates);
      }
    } catch (error) {
      console.error('Failed to fetch cohorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCohort 
        ? `/api/sprint/admin/cohorts/${editingCohort.id}`
        : '/api/sprint/admin/cohorts';
      
      const method = editingCohort ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        })
      });

      if (response.ok) {
        await fetchCohorts();
        resetForm();
        setIsCreateDialogOpen(false);
        setEditingCohort(null);
      }
    } catch (error) {
      console.error('Failed to save cohort:', error);
    }
  };

  const handleDelete = async (cohortId: string) => {
    if (!confirm('Are you sure you want to delete this cohort?')) return;

    try {
      const response = await fetch(`/api/sprint/admin/cohorts/${cohortId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCohorts();
      }
    } catch (error) {
      console.error('Failed to delete cohort:', error);
    }
  };

  const toggleActivation = async (cohortId: string, activated: boolean) => {
    try {
      const response = await fetch(`/api/sprint/admin/cohorts/${cohortId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activated })
      });

      if (response.ok) {
        await fetchCohorts();
      }
    } catch (error) {
      console.error('Failed to toggle activation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      activated: false
    });
  };

  const openEditDialog = (cohort: SprintCohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      startDate: cohort.startDate.toISOString().split('T')[0],
      endDate: cohort.endDate.toISOString().split('T')[0],
      activated: cohort.activated
    });
    setIsCreateDialogOpen(true);
  };

  const getStatusColor = (cohort: SprintCohort) => {
    if (!cohort.activated) return 'bg-gray-100 text-gray-800';
    
    const now = new Date();
    if (now < cohort.startDate) return 'bg-blue-100 text-blue-800';
    if (now > cohort.endDate) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (cohort: SprintCohort) => {
    if (!cohort.activated) return 'Inactive';
    
    const now = new Date();
    if (now < cohort.startDate) return 'Scheduled';
    if (now > cohort.endDate) return 'Completed';
    return 'Active';
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading cohorts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cohorts Management</h2>
          <p className="text-muted-foreground">Create and manage sprint cohorts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCohort(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Cohort Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activated"
                  checked={formData.activated}
                  onCheckedChange={(checked) => setFormData({ ...formData, activated: checked })}
                />
                <Label htmlFor="activated">Activate immediately</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCohort ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cohorts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No cohorts found. Create your first cohort to get started.</p>
            </CardContent>
          </Card>
        ) : (
          cohorts.map((cohort) => (
            <Card key={cohort.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {cohort.name}
                      <Badge className={getStatusColor(cohort)}>
                        {getStatusText(cohort)}
                      </Badge>
                    </CardTitle>
                    {cohort.description && (
                      <CardDescription>{cohort.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(cohort)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cohort.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Start Date</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(cohort.startDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">End Date</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(cohort.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Enrollments</div>
                      <div className="text-sm text-muted-foreground">
                        {cohort.enrollmentCount} enrolled
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Teams</div>
                      <div className="text-sm text-muted-foreground">
                        {cohort.teamCount} teams
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(cohort.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`activate-${cohort.id}`} className="text-sm">
                      {cohort.activated ? 'Deactivate' : 'Activate'}
                    </Label>
                    <Switch
                      id={`activate-${cohort.id}`}
                      checked={cohort.activated}
                      onCheckedChange={(checked) => toggleActivation(cohort.id, checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
// components/sprint/admin/ProjectsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Users, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
    id: string;
    name: string;
    description?: string;
    workspaceId: string;
    createdAt: string;
}

interface SprintTeam {
    id: string;
    name: string;
    cohortId: string;
    projectId?: string;
    members: string[];
    project?: {
        id: string;
        name: string;
    };
    cohort: {
        id: string;
        name: string;
    };
}

interface ProjectsManagerProps {
    workspaceId: string;
}

export default function ProjectsManager({ workspaceId }: ProjectsManagerProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<SprintTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState<string | null>(null);

    // New project form state
    const [newProject, setNewProject] = useState({
        name: '',
        description: ''
    });

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projectsRes, teamsRes] = await Promise.all([
                fetch(`/api/sprint/admin/projects?workspaceId=${workspaceId}`),
                fetch(`/api/sprint/admin/teams?workspaceId=${workspaceId}`)
            ]);

            if (!projectsRes.ok) {
                throw new Error('Failed to load projects');
            }
            if (!teamsRes.ok) {
                throw new Error('Failed to load teams');
            }

            const projectsData = await projectsRes.json();
            const teamsData = await teamsRes.json();
            setProjects(projectsData.projects || []);
            setTeams(teamsData.teams || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };


    const createProject = async () => {
        if (!newProject.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch('/api/sprint/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId,                          // pass karo
                    name: newProject.name.trim(),
                    description: newProject.description.trim() || undefined
                })
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(prev => [...prev, data.project]);
                setNewProject({ name: '', description: '' });
                toast.success('Project created successfully');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const assignProject = async (teamId: string, projectId: string) => {
        setAssigning(teamId);
        try {
            const response = await fetch('/api/sprint/admin/assign-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId, teamId, projectId })
            });

            if (response.ok) {
                // Update teams state with new assignment
                setTeams(prev => prev.map(team =>
                    team.id === teamId
                        ? {
                            ...team,
                            projectId,
                            project: projects.find(p => p.id === projectId)
                        }
                        : team
                ));
                toast.success('Project assigned successfully');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to assign project');
            }
        } catch (error) {
            console.error('Error assigning project:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to assign project');
        } finally {
            setAssigning(null);
        }
    };

    const unassignProject = async (teamId: string) => {
        setAssigning(teamId);
        try {
            const response = await fetch('/api/sprint/admin/assign-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId, teamId, projectId: null })
            });

            if (response.ok) {
                setTeams(prev => prev.map(team =>
                    team.id === teamId
                        ? { ...team, projectId: undefined, project: undefined }
                        : team
                ));
                toast.success('Project unassigned successfully');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to unassign project');
            }
        } catch (error) {
            console.error('Error unassigning project:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to unassign project');
        } finally {
            setAssigning(null);
        }
    };

    const teamsWithProjects = teams.filter(team => team.projectId);
    const teamsWithoutProjects = teams.filter(team => !team.projectId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading projects and teams...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Available in workspace
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teams with Projects</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamsWithProjects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Out of {teams.length} total teams
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unassigned Teams</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamsWithoutProjects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Need project assignment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Create New Project */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create New Project
                    </CardTitle>
                    <CardDescription>
                        Add a new project to assign to sprint teams
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name *</Label>
                            <Input
                                id="project-name"
                                placeholder="Enter project name..."
                                value={newProject.name}
                                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-description">Description</Label>
                            <Textarea
                                id="project-description"
                                placeholder="Optional project description..."
                                value={newProject.description}
                                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[40px]"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={createProject}
                        disabled={creating || !newProject.name.trim()}
                        className="w-full md:w-auto"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Project
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Team Project Assignments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Project Assignments
                    </CardTitle>
                    <CardDescription>
                        Assign projects to sprint teams for uploads and task management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {teams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No sprint teams found in this workspace.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {teams.map((team) => (
                                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="font-medium">{team.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {team.cohort.name} • {team.members.length} members
                                            </p>
                                        </div>
                                        {team.project && (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {team.project.name}
                                            </Badge>
                                        )}
                                        {!team.projectId && (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                No Project
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={team.projectId || 'none'}
                                            onValueChange={(value) => {
                                                if (value === 'none') {
                                                    unassignProject(team.id);
                                                } else {
                                                    assignProject(team.id, value);
                                                }
                                            }}
                                            disabled={assigning === team.id}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select project..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    <span className="text-muted-foreground">No Project</span>
                                                </SelectItem>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {assigning === team.id && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Projects */}
            {projects.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Projects</CardTitle>
                        <CardDescription>
                            All projects in this workspace that can be assigned to teams
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => {
                                const assignedTeams = teams.filter(team => team.projectId === project.id);
                                return (
                                    <div key={project.id} className="p-4 border rounded-lg">
                                        <h3 className="font-medium">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            <Badge variant="secondary">
                                                {assignedTeams.length} {assignedTeams.length === 1 ? 'team' : 'teams'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Filter, X, LayoutGrid, AlignLeft, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Project } from '../types';
import { ProjectGanttChart } from '../components/ProjectGanttChart';

export function Projects() {
  const { projects, clients, addProject, updateProject, removeProject } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'gantt'>('grid');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    clientId: '',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectData.name.trim()) {
      addProject(
        newProjectData.name.trim(),
        newProjectData.clientId || undefined,
        newProjectData.budget ? parseFloat(newProjectData.budget) : undefined,
        newProjectData.startDate || undefined,
        newProjectData.endDate || undefined
      );
      setIsNewProjectModalOpen(false);
      setNewProjectData({ name: '', clientId: '', budget: '', startDate: '', endDate: '' });
    }
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && editingProject.name.trim()) {
      updateProject(editingProject.id, {
        name: editingProject.name.trim(),
        clientId: editingProject.clientId || undefined,
        budget: editingProject.budget ? Number(editingProject.budget) : undefined,
        status: editingProject.status,
        startDate: editingProject.startDate || undefined,
        endDate: editingProject.endDate || undefined,
      });
      setEditingProject(null);
    }
  };

  const handleDeleteProject = () => {
    if (editingProject) {
      removeProject(editingProject.id);
      setEditingProject(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your active projects and portfolios.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsNewProjectModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors flex-1 sm:flex-none flex justify-center ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`p-2 rounded-md transition-colors flex-1 sm:flex-none flex justify-center ${viewMode === 'gantt' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Gantt Chart"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const client = clients.find(c => c.id === project.clientId);
            
            return (
              <Card 
                key={project.id} 
                className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setEditingProject(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  {client && <p className="text-sm text-muted-foreground">{client.name}</p>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Budget: {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</span>
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <ProjectGanttChart projects={filteredProjects} />
      )}

      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">New Project</h2>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  placeholder="e.g., Website Redesign"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Client
                </label>
                <select
                  value={newProjectData.clientId}
                  onChange={(e) => setNewProjectData({ ...newProjectData, clientId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Budget ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProjectData.budget}
                  onChange={(e) => setNewProjectData({ ...newProjectData, budget: e.target.value })}
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newProjectData.startDate}
                    onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newProjectData.endDate}
                    onChange={(e) => setNewProjectData({ ...newProjectData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Edit Project</h2>
              <button
                onClick={() => setEditingProject(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Client
                </label>
                <select
                  value={editingProject.clientId || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, clientId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Budget ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingProject.budget || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={editingProject.startDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={editingProject.endDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && editingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Project</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-medium text-foreground">"{editingProject.name}"</span>? 
              This action cannot be undone and will delete all associated boards and tasks.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}>
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

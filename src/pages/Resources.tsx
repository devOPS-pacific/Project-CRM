import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, X, Trash2 } from 'lucide-react';
import { User, Role } from '../types';

export function Resources() {
  const { users, allocations, projects, addUser, updateUser, removeUser, addAllocation, removeAllocation } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as Role,
    hourlyRate: 0,
  });
  const [newAllocation, setNewAllocation] = useState({
    projectId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hoursPerWeek: 40,
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', role: 'member', hourlyRate: 0 });
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate || 0,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hourlyRate: formData.hourlyRate,
      });
    } else {
      addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hourlyRate: formData.hourlyRate,
      });
    }
    setIsModalOpen(false);
  };

  const handleRemove = () => {
    if (editingUser) {
      removeUser(editingUser.id);
      setIsConfirmRemoveOpen(false);
      setIsModalOpen(false);
    }
  };

  const handleAddAllocation = () => {
    if (editingUser && newAllocation.projectId && newAllocation.hoursPerWeek > 0) {
      addAllocation({
        userId: editingUser.id,
        projectId: newAllocation.projectId,
        startDate: new Date(newAllocation.startDate).toISOString(),
        endDate: new Date(newAllocation.endDate).toISOString(),
        hoursPerWeek: newAllocation.hoursPerWeek,
      });
      setNewAllocation({
        projectId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hoursPerWeek: 40,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resource Planning</h1>
          <p className="text-sm text-muted-foreground">Manage team capacity and project allocations.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => {
          const userAllocations = allocations.filter(a => a.userId === user.id);
          const totalHours = userAllocations.reduce((sum, a) => sum + a.hoursPerWeek, 0);

          return (
            <Card key={user.id} className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" onClick={() => handleOpenEdit(user)}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Avatar fallback={user.name.charAt(0)} size="lg" />
                  <div>
                    <h3 className="font-medium text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{totalHours} hrs / week</p>
                  <p className="text-xs text-muted-foreground">Allocated</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingUser ? 'Edit Resource' : 'Add Resource'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Jane Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., jane@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Role
                </label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="client_viewer">Client Viewer</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              {editingUser && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">Project Allocations</h3>
                  <div className="space-y-3 mb-4">
                    {allocations.filter(a => a.userId === editingUser.id).map(allocation => {
                      const project = projects.find(p => p.id === allocation.projectId);
                      return (
                        <div key={allocation.id} className="flex items-center justify-between bg-muted p-2 rounded-md border border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">{project?.name || 'Unknown Project'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">{allocation.hoursPerWeek}h/wk</span>
                            <button 
                              type="button" 
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => removeAllocation(allocation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md border border-border space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Project</label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newAllocation.projectId}
                        onChange={(e) => setNewAllocation({ ...newAllocation, projectId: e.target.value })}
                      >
                        <option value="">Select project...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Start Date</label>
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={newAllocation.startDate}
                          onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">End Date</label>
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={newAllocation.endDate}
                          onChange={(e) => setNewAllocation({ ...newAllocation, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-foreground">Hours / Week</label>
                        <Input
                          type="number"
                          min="1"
                          className="h-8 text-xs"
                          value={newAllocation.hoursPerWeek}
                          onChange={(e) => setNewAllocation({ ...newAllocation, hoursPerWeek: Number(e.target.value) })}
                        />
                      </div>
                      <Button type="button" size="sm" className="h-8 text-xs" onClick={handleAddAllocation}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-border">
                {editingUser ? (
                  <Button type="button" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsConfirmRemoveOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Save Changes' : 'Add Resource'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmRemoveOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Remove Resource</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to remove this resource? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsConfirmRemoveOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

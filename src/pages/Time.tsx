import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Play, Square, X } from 'lucide-react';

export function Time() {
  const { timeEntries, projects, users, logTime } = useStore();
  const [isTracking, setIsTracking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    billable: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectId && formData.hours) {
      logTime(
        formData.projectId,
        parseFloat(formData.hours),
        formData.date,
        formData.description,
        formData.billable
      );
      setIsModalOpen(false);
      setFormData({
        projectId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Time Tracking</h1>
          <p className="text-sm text-muted-foreground">Log hours and track billable time.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-muted rounded-md p-1 w-full sm:w-auto justify-between sm:justify-start">
            <span className="px-3 py-1 text-sm font-medium font-mono text-foreground">
              00:00:00
            </span>
            <Button 
              size="sm" 
              variant={isTracking ? 'destructive' : 'default'}
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Time
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {timeEntries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No time entries yet.</div>
            ) : (
              [...timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => {
                const project = projects.find(p => p.id === entry.projectId);
                const user = users.find(u => u.id === entry.userId);

                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-foreground w-24">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{entry.description || 'No description'}</p>
                        <p className="text-xs text-muted-foreground">{project?.name} • {user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {entry.billable && (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                          Billable
                        </span>
                      )}
                      <span className="text-sm font-medium font-mono text-foreground">
                        {entry.hours.toFixed(2)}h
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Log Time</h2>
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
                  Project <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Hours <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.25"
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="billable" className="text-sm font-medium text-foreground">
                  Billable
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

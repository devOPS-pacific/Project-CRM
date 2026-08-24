import { useState, useRef, useEffect } from 'react';
import { Plus, Briefcase, Users, CheckSquare, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useStore } from '../store/useStore';

type ModalType = 'task' | 'project' | 'client' | null;

export function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { projects, clients, addTask, addProject, addClient, boards, boardGroups } = useStore();

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBoardId, setTaskBoardId] = useState('');
  const [taskGroupId, setTaskGroupId] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectClientId, setProjectClientId] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle && taskGroupId) {
      addTask(taskGroupId, taskTitle);
      closeAll();
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName) {
      addProject(projectName, projectClientId || undefined);
      closeAll();
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName) {
      addClient({
        name: clientName,
        clientType: 'Prospect',
        clientTier: 'Standard',
      }, {
        email: clientEmail,
        firstName: clientName, // Fallback
      });
      closeAll();
    }
  };

  const closeAll = () => {
    setIsOpen(false);
    setActiveModal(null);
    setTaskTitle('');
    setProjectName('');
    setClientName('');
    setClientEmail('');
  };

  const filteredGroups = boardGroups.filter(g => g.boardId === taskBoardId);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="sm" 
        className="hidden sm:flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Quick Add
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-border">
          <button
            onClick={() => { setActiveModal('task'); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
            Add Task
          </button>
          <button
            onClick={() => { setActiveModal('project'); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
            Add Project
          </button>
          <button
            onClick={() => { setActiveModal('client'); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            Add Client
          </button>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {activeModal === 'task' && 'Quick Add Task'}
                {activeModal === 'project' && 'Quick Add Project'}
                {activeModal === 'client' && 'Quick Add Client'}
              </h2>
              <button onClick={closeAll} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeModal === 'task' && (
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Task Title</label>
                  <Input 
                    autoFocus
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Board</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={taskBoardId}
                    onChange={(e) => {
                      setTaskBoardId(e.target.value);
                      const firstGroup = boardGroups.find(g => g.boardId === e.target.value);
                      if (firstGroup) setTaskGroupId(firstGroup.id);
                    }}
                    required
                  >
                    <option value="">Select Board</option>
                    {boards.map(b => {
                      const project = projects.find(p => p.id === b.projectId);
                      const client = clients.find(c => c.id === project?.clientId);
                      const displayName = project 
                        ? `${project.name}${client ? ` - ${client.name}` : ''}`
                        : b.name;
                      return (
                        <option key={b.id} value={b.id}>{displayName}</option>
                      );
                    })}
                  </select>
                </div>
                {taskBoardId && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Status Group</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={taskGroupId}
                      onChange={(e) => setTaskGroupId(e.target.value)}
                      required
                    >
                      <option value="">Select Group</option>
                      {filteredGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={closeAll}>Cancel</Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            )}

            {activeModal === 'project' && (
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Project Name</label>
                  <Input 
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Client (Optional)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={projectClientId}
                    onChange={(e) => setProjectClientId(e.target.value)}
                  >
                    <option value="">No Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={closeAll}>Cancel</Button>
                  <Button type="submit">Create Project</Button>
                </div>
              </form>
            )}

            {activeModal === 'client' && (
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Client Name</label>
                  <Input 
                    autoFocus
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Contact Email</label>
                  <Input 
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={closeAll}>Cancel</Button>
                  <Button type="submit">Create Client</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

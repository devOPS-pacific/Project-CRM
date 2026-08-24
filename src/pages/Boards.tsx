import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Plus, MoreHorizontal, Calendar, Flag, X, Building2, GripVertical, LayoutGrid, Table as TableIcon, GanttChart } from 'lucide-react';
import { Task, TaskPriority, BoardGroup, TaskStatus } from '../types';
import { TaskTable } from '../components/TaskTable';
import { TaskGanttChart } from '../components/TaskGanttChart';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableGroupProps {
  group: BoardGroup;
  tasks: Task[];
  users: any[];
  clients: any[];
  addingTaskGroupId: string | null;
  newTaskTitle: string;
  setAddingTaskGroupId: (id: string | null) => void;
  setNewTaskTitle: (title: string) => void;
  handleAddTask: (groupId: string) => void;
  setEditingTask: (task: Task) => void;
}

function SortableGroup({
  group,
  tasks,
  users,
  clients,
  addingTaskGroupId,
  newTaskTitle,
  setAddingTaskGroupId,
  setNewTaskTitle,
  handleAddTask,
  setEditingTask,
}: SortableGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const groupTasks = tasks.filter(t => t.groupId === group.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col bg-muted/50 rounded-xl border border-border p-3 h-full min-h-[400px]"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
          <h3 className="font-medium text-foreground truncate max-w-[120px]">{group.name}</h3>
        </div>
        <Badge variant="secondary">{groupTasks.length}</Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {groupTasks.map(task => {
          const assignee = users.find(u => u.id === task.assigneeId);
          const client = clients.find(c => c.id === task.clientId);

          return (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditingTask(task)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground text-sm line-clamp-2">{task.title}</h4>
                  <button className="text-muted-foreground hover:text-foreground shrink-0 ml-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                {client && (
                  <div className="flex items-center text-[10px] text-muted-foreground mb-2 truncate">
                    <Building2 className="mr-1 h-3 w-3 shrink-0" />
                    {client.name}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <div className="flex items-center text-[10px] text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3 shrink-0" />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <div className="flex items-center text-[10px] text-muted-foreground">
                      <Flag className={`mr-1 h-3 w-3 shrink-0 ${task.priority === 'high' || task.priority === 'urgent' ? 'text-destructive' : ''}`} />
                      {task.priority}
                    </div>
                  </div>
                  {assignee && (
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0" title={assignee.name}>
                      {assignee.name.charAt(0)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {addingTaskGroupId === group.id ? (
          <div className="p-2 bg-background rounded-lg shadow-sm border border-primary/20">
            <Input
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask(group.id);
                if (e.key === 'Escape') {
                  setAddingTaskGroupId(null);
                  setNewTaskTitle('');
                }
              }}
              placeholder="Task title..."
              className="h-8 text-sm mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setAddingTaskGroupId(null);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => handleAddTask(group.id)}
              >
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground h-8"
            onClick={() => setAddingTaskGroupId(group.id)}
          >
            <Plus className="mr-2 h-3 w-3" />
            <span className="text-xs">Add Task</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function Boards() {
  const { projects, boards, boardGroups, tasks, users, clients, addTask, updateTask, addBoardGroup, updateBoardGroupsOrder } = useStore();
  const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id);
  const [addingTaskGroupId, setAddingTaskGroupId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [view, setView] = useState<'board' | 'table' | 'gantt'>('board');

  useEffect(() => {
    if (!activeBoardId && boards.length > 0) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const projectBoards = boards.filter(b => b.projectId === activeBoard?.projectId);
  
  const projectTasks = useMemo(() => {
    if (!activeBoard) return [];
    // Get all groups for this project's boards
    const projectBoardIds = projectBoards.map(b => b.id);
    const projectGroupIds = boardGroups
      .filter(g => projectBoardIds.includes(g.boardId))
      .map(g => g.id);
    
    return tasks.filter(t => projectGroupIds.includes(t.groupId));
  }, [tasks, activeBoard, projectBoards, boardGroups]);

  const groups = useMemo(() => {
    return boardGroups
      .filter(g => g.boardId === activeBoardId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [boardGroups, activeBoardId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.id === active.id);
      const newIndex = groups.findIndex((g) => g.id === over.id);

      const newGroups = arrayMove(groups, oldIndex, newIndex);
      updateBoardGroupsOrder(newGroups);
    }
  };

  const handleAddTask = (groupId: string) => {
    if (newTaskTitle.trim()) {
      addTask(groupId, newTaskTitle.trim());
    }
    setAddingTaskGroupId(null);
    setNewTaskTitle('');
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() && activeBoardId) {
      addBoardGroup(activeBoardId, newGroupName.trim(), '#3b82f6');
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, editingTask);
      setEditingTask(null);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Boards</h1>
          <p className="text-sm text-muted-foreground">Manage tasks and workflows.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
            <Button 
              variant={view === 'board' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3"
              onClick={() => setView('board')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </Button>
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3"
              onClick={() => setView('table')}
            >
              <TableIcon className="mr-2 h-4 w-4" />
              Table
            </Button>
            <Button 
              variant={view === 'gantt' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3"
              onClick={() => setView('gantt')}
            >
              <GanttChart className="mr-2 h-4 w-4" />
              Gantt
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Select Project</label>
            <select 
              className="flex h-9 w-full sm:max-w-[400px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={activeBoard?.projectId || ''}
              onChange={(e) => {
                const projectId = e.target.value;
                const firstBoard = boards.find(b => b.projectId === projectId);
                if (firstBoard) setActiveBoardId(firstBoard.id);
              }}
            >
              <option value="" disabled>Select Project</option>
              {projects.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} {client ? `- ${client.name}` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {projectBoards.length > 1 && projectBoards.map(board => (
              <Button 
                key={board.id} 
                variant={board.id === activeBoardId ? 'default' : 'outline'}
                onClick={() => setActiveBoardId(board.id)}
                className="shrink-0 h-9 px-3 text-xs flex-1 sm:flex-none"
              >
                {board.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {activeBoard && (
        <div className="flex-1 overflow-hidden">
          {view === 'board' && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 h-full pb-4 auto-rows-fr overflow-y-auto pr-2">
                <SortableContext
                  items={groups.map(g => g.id)}
                  strategy={rectSortingStrategy}
                >
                  {groups.map(group => (
                    <SortableGroup
                      key={group.id}
                      group={group}
                      tasks={tasks}
                      users={users}
                      clients={clients}
                      addingTaskGroupId={addingTaskGroupId}
                      newTaskTitle={newTaskTitle}
                      setAddingTaskGroupId={setAddingTaskGroupId}
                      setNewTaskTitle={setNewTaskTitle}
                      handleAddTask={handleAddTask}
                      setEditingTask={setEditingTask}
                    />
                  ))}
                </SortableContext>
                
                <div className="h-full">
                  {isAddingGroup ? (
                    <div className="bg-muted/30 rounded-xl border border-dashed border-border p-3 space-y-3">
                      <Input
                        autoFocus
                        placeholder="Group name..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddGroup();
                          if (e.key === 'Escape') setIsAddingGroup(false);
                        }}
                        className="h-9"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAddingGroup(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddGroup}>Add</Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed h-12 bg-muted/20 hover:bg-muted/40"
                      onClick={() => setIsAddingGroup(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Group
                    </Button>
                  )}
                </div>
              </div>
            </DndContext>
          )}

          {view === 'table' && (
            <div className="h-full overflow-y-auto pr-2">
              <TaskTable 
                tasks={projectTasks} 
                users={users} 
                clients={clients} 
                onEditTask={setEditingTask} 
              />
            </div>
          )}

          {view === 'gantt' && (
            <div className="h-full overflow-y-auto pr-2">
              <TaskGanttChart 
                tasks={projectTasks} 
                users={users} 
                onEditTask={setEditingTask} 
              />
            </div>
          )}
        </div>
      )}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg flex flex-col max-h-[90vh] border border-border">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4 overflow-y-auto px-1 flex-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Column / Group
                  </label>
                  <select
                    value={editingTask.groupId}
                    onChange={(e) => {
                      const newGroupId = e.target.value;
                      const group = groups.find(g => g.id === newGroupId);
                      let newStatus = editingTask.status;
                      
                      // Optional: Auto-update status based on group name
                      if (group) {
                        const name = group.name.toLowerCase();
                        if (name.includes('todo') || name.includes('to do')) newStatus = 'todo';
                        else if (name.includes('progress')) newStatus = 'in_progress';
                        else if (name.includes('review')) newStatus = 'review';
                        else if (name.includes('done') || name.includes('complete')) newStatus = 'done';
                        else if (name.includes('blocked')) newStatus = 'blocked';
                      }
                      
                      setEditingTask({ ...editingTask, groupId: newGroupId, status: newStatus });
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Assignee
                  </label>
                  <select
                    value={editingTask.assigneeId || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value || undefined })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Client
                  </label>
                  <select
                    value={editingTask.clientId || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, clientId: e.target.value || undefined })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">No Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

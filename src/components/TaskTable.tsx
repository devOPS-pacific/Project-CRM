import { Task, User, Client, TaskPriority, TaskStatus } from '../types';
import { Badge } from './ui/Badge';
import { format } from 'date-fns';
import { Calendar, Flag, Building2, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  clients: Client[];
  onEditTask: (task: Task) => void;
}

export function TaskTable({ tasks, users, clients, onEditTask }: TaskTableProps) {
  const { updateTaskStatus } = useStore();

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'low': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'review': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked'];

  return (
    <div className="rounded-md border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Task</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Assignee</th>
              <th className="px-4 py-3 font-semibold">Due Date</th>
              <th className="px-4 py-3 font-semibold">Client</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No tasks found for this project.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const client = clients.find(c => c.id === task.clientId);
                
                return (
                  <tr 
                    key={task.id} 
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-4 py-3 cursor-pointer" onClick={() => onEditTask(task)}>
                      <span className="font-medium text-foreground">{task.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2 pr-8 py-1 rounded border text-[10px] font-medium uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${getStatusColor(task.status)}`}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s} className="bg-background text-foreground capitalize">
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => onEditTask(task)}>
                      <Badge variant="outline" className={`${getPriorityColor(task.priority)} capitalize`}>
                        <Flag className="mr-1 h-3 w-3" />
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => onEditTask(task)}>
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
                            {assignee.name.charAt(0)}
                          </div>
                          <span className="text-xs">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => onEditTask(task)}>
                      {task.dueDate ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1.5 h-3.5 w-3.5" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => onEditTask(task)}>
                      {client ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Building2 className="mr-1.5 h-3.5 w-3.5" />
                          {client.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

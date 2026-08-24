import { useMemo } from 'react';
import { Task, User, TaskPriority } from '../types';
import { format, differenceInDays, addDays, eachDayOfInterval } from 'date-fns';

interface TaskGanttChartProps {
  tasks: Task[];
  users: User[];
  onEditTask: (task: Task) => void;
}

export function TaskGanttChart({ tasks, users, onEditTask }: TaskGanttChartProps) {
  const tasksWithDates = useMemo(() => 
    tasks.filter(t => t.dueDate && t.status !== 'done'), 
    [tasks]
  );

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };
    }

    // For tasks, we only have dueDate. Let's assume a 3-day duration for visualization
    // Or we can use createdAt as start date if available, but let's stick to dueDate padding
    let min = new Date(tasksWithDates[0].dueDate!);
    let max = new Date(tasksWithDates[0].dueDate!);

    tasksWithDates.forEach(t => {
      const due = new Date(t.dueDate!);
      if (due < min) min = due;
      if (due > max) max = due;
    });

    // Add some padding
    min = addDays(min, -7);
    max = addDays(max, 14);

    return {
      minDate: min,
      maxDate: max,
      totalDays: differenceInDays(max, min) + 1
    };
  }, [tasksWithDates]);

  if (tasksWithDates.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg border border-border border-dashed">
        <p className="text-muted-foreground">No tasks with due dates to display in Gantt chart.</p>
      </div>
    );
  }

  const days = eachDayOfInterval({ start: minDate, end: maxDate });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="flex border-b border-border bg-muted/50">
          <div className="w-64 flex-shrink-0 p-4 font-medium text-foreground border-r border-border">
            Task Name
          </div>
          <div className="flex-1 relative h-12">
            {days.map((day, i) => {
              const showLabel = day.getDay() === 1 || day.getDate() === 1;
              return (
                <div 
                  key={i} 
                  className="absolute top-0 bottom-0 border-r border-border/30"
                  style={{ 
                    left: `${(i / totalDays) * 100}%`,
                    width: `${(1 / totalDays) * 100}%`
                  }}
                >
                  {showLabel && (
                    <span className="absolute top-2 left-1 text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(day, 'MMM d')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {tasksWithDates.map(task => {
            const due = new Date(task.dueDate!);
            // For visualization, show as a 2-day bar ending on due date
            const start = addDays(due, -2);
            
            const startOffset = differenceInDays(start, minDate);
            const duration = 2; // Fixed 2-day duration for tasks
            
            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            const assignee = users.find(u => u.id === task.assigneeId);

            return (
              <div 
                key={task.id} 
                className="flex hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onEditTask(task)}
              >
                <div className="w-64 flex-shrink-0 p-4 text-sm font-medium text-foreground border-r border-border truncate flex items-center gap-2">
                  {assignee && (
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
                      {assignee.name.charAt(0)}
                    </div>
                  )}
                  <span className="truncate">{task.title}</span>
                </div>
                <div className="flex-1 relative h-14 py-3">
                  {/* Grid lines */}
                  {days.map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 bottom-0 border-r border-border/10 pointer-events-none"
                      style={{ 
                        left: `${(i / totalDays) * 100}%`,
                        width: `${(1 / totalDays) * 100}%`
                      }}
                    />
                  ))}
                  
                  {/* Bar */}
                  <div 
                    className={`absolute h-8 rounded-md ${getPriorityColor(task.priority)} shadow-sm flex items-center px-3 overflow-hidden group`}
                    style={{ 
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                    title={`${task.title}: Due ${format(due, 'MMM d, yyyy')}`}
                  >
                    <span className="text-xs font-medium text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      Due {format(due, 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

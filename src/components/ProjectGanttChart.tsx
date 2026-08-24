import { useMemo } from 'react';
import { Project } from '../types';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface ProjectGanttChartProps {
  projects: Project[];
}

export function ProjectGanttChart({ projects }: ProjectGanttChartProps) {
  const projectsWithDates = projects.filter(p => p.startDate && p.endDate);

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (projectsWithDates.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };
    }

    let min = new Date(projectsWithDates[0].startDate!);
    let max = new Date(projectsWithDates[0].endDate!);

    projectsWithDates.forEach(p => {
      const start = new Date(p.startDate!);
      const end = new Date(p.endDate!);
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Add some padding
    min = addDays(min, -7);
    max = addDays(max, 14);

    return {
      minDate: min,
      maxDate: max,
      totalDays: differenceInDays(max, min) + 1
    };
  }, [projectsWithDates]);

  if (projectsWithDates.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg border border-border border-dashed">
        <p className="text-muted-foreground">No projects with start and end dates to display in Gantt chart.</p>
      </div>
    );
  }

  const days = eachDayOfInterval({ start: minDate, end: maxDate });

  return (
    <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="flex border-b border-border bg-muted/50">
          <div className="w-64 flex-shrink-0 p-4 font-medium text-foreground border-r border-border">
            Project Name
          </div>
          <div className="flex-1 relative h-12">
            {days.map((day, i) => {
              // Only show date labels for Mondays or first of month to avoid clutter
              const showLabel = day.getDay() === 1 || day.getDate() === 1;
              return (
                <div 
                  key={i} 
                  className="absolute top-0 bottom-0 border-r border-border"
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
          {projectsWithDates.map(project => {
            const start = new Date(project.startDate!);
            const end = new Date(project.endDate!);
            
            const startOffset = differenceInDays(start, minDate);
            const duration = differenceInDays(end, start) + 1;
            
            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            let bgColor = 'bg-primary';
            if (project.status === 'completed') bgColor = 'bg-emerald-500';
            if (project.status === 'on_hold') bgColor = 'bg-amber-500';

            return (
              <div key={project.id} className="flex hover:bg-muted/50 transition-colors">
                <div className="w-64 flex-shrink-0 p-4 text-sm font-medium text-foreground border-r border-border truncate">
                  {project.name}
                </div>
                <div className="flex-1 relative h-14 py-3">
                  {/* Grid lines */}
                  {days.map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 bottom-0 border-r border-border/30 pointer-events-none"
                      style={{ 
                        left: `${(i / totalDays) * 100}%`,
                        width: `${(1 / totalDays) * 100}%`
                      }}
                    />
                  ))}
                  
                  {/* Bar */}
                  <div 
                    className={`absolute h-8 rounded-md ${bgColor} shadow-sm flex items-center px-3 overflow-hidden group`}
                    style={{ 
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                    title={`${project.name}: ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`}
                  >
                    <span className="text-xs font-medium text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {format(start, 'MMM d')} - {format(end, 'MMM d')}
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

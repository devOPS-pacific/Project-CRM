import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { isBefore, isToday, parseISO, startOfDay } from 'date-fns';
import { Bell, AlertTriangle, Clock, Briefcase, Target } from 'lucide-react';

export function NotificationSystem() {
  const { tasks, invoices, projects, deals, dismissedNotifications, dismissNotification } = useStore();

  useEffect(() => {
    const today = startOfDay(new Date());

    // Check for overdue/due tasks
    tasks.forEach((task) => {
      if (!task.dueDate || task.status === 'done' || dismissedNotifications.includes(task.id)) return;

      const dueDate = startOfDay(parseISO(task.dueDate));
      const isOverdue = isBefore(dueDate, today);
      const isDueToday = isToday(dueDate);

      if (isOverdue || isDueToday) {
        toast.custom((t) => (
          <div className="flex w-full max-w-md items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
              {isOverdue ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {isOverdue ? 'Overdue Task' : 'Task Due Today'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{task.title}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismissNotification(task.id);
                  toast.dismiss(t);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Silence
              </button>
            </div>
          </div>
        ), {
          id: task.id,
          duration: Infinity,
        });
      }
    });

    // Check for overdue/due projects
    projects.forEach((project) => {
      if (!project.endDate || project.status === 'completed' || project.status === 'archived' || dismissedNotifications.includes(project.id)) return;

      const endDate = startOfDay(parseISO(project.endDate));
      const isOverdue = isBefore(endDate, today);
      const isDueToday = isToday(endDate);

      if (isOverdue || isDueToday) {
        toast.custom((t) => (
          <div className="flex w-full max-w-md items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {isOverdue ? 'Project Deadline Passed' : 'Project Due Today'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{project.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismissNotification(project.id);
                  toast.dismiss(t);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Silence
              </button>
            </div>
          </div>
        ), {
          id: project.id,
          duration: Infinity,
        });
      }
    });

    // Check for overdue/due deals
    deals.forEach((deal) => {
      if (!deal.expectedCloseDate || deal.stage === 'won' || deal.stage === 'lost' || dismissedNotifications.includes(deal.id)) return;

      const closeDate = startOfDay(parseISO(deal.expectedCloseDate));
      const isOverdue = isBefore(closeDate, today);
      const isDueToday = isToday(closeDate);

      if (isOverdue || isDueToday) {
        toast.custom((t) => (
          <div className="flex w-full max-w-md items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
              <Target className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {isOverdue ? 'Deal Closing Overdue' : 'Deal Closes Today'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{deal.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismissNotification(deal.id);
                  toast.dismiss(t);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Silence
              </button>
            </div>
          </div>
        ), {
          id: deal.id,
          duration: Infinity,
        });
      }
    });

    // Check for overdue/due invoices
    invoices.forEach((invoice) => {
      if (invoice.status === 'paid' || dismissedNotifications.includes(invoice.id)) return;

      const dueDate = startOfDay(parseISO(invoice.dueDate));
      const isOverdue = isBefore(dueDate, today) || invoice.status === 'overdue';
      const isDueToday = isToday(dueDate);

      if (isOverdue || isDueToday) {
        toast.custom((t) => (
          <div className="flex w-full max-w-md items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {isOverdue ? 'Overdue Invoice' : 'Invoice Due Today'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{invoice.number} - {invoice.total.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismissNotification(invoice.id);
                  toast.dismiss(t);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Silence
              </button>
            </div>
          </div>
        ), {
          id: invoice.id,
          duration: Infinity,
        });
      }
    });
  }, [tasks, invoices, dismissedNotifications, dismissNotification]);

  return null;
}

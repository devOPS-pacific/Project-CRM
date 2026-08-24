import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Briefcase, Users, Target, Clock, PlusCircle, ArrowRightLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { projects, clients, deals, timeEntries, tasks } = useStore();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalPipeline = deals.reduce((sum, deal) => sum + deal.value, 0);
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const stats = [
    { name: 'Active Projects', value: activeProjects, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'Total Clients', value: clients.length, icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { name: 'Pipeline Value', value: `$${totalPipeline.toLocaleString()}`, icon: Target, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    { name: 'Hours Logged', value: totalHours, icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  ];

  // Aggregate activities
  const activities = [
    ...projects.map(p => ({
      id: p.id,
      type: 'project',
      title: `New project: ${p.name}`,
      date: new Date(p.createdAt || Date.now()),
      icon: Briefcase,
      color: 'text-blue-500'
    })),
    ...deals.map(d => ({
      id: d.id,
      type: 'deal',
      title: `New deal: ${d.name} ($${d.value.toLocaleString()})`,
      date: new Date(d.createdAt || Date.now()),
      icon: Target,
      color: 'text-amber-500'
    })),
    ...clients.map(c => ({
      id: c.id,
      type: 'client',
      title: `New client: ${c.name}`,
      date: new Date(c.createdAt || Date.now()),
      icon: Users,
      color: 'text-emerald-500'
    })),
    ...timeEntries.map(t => ({
      id: t.id,
      type: 'time',
      title: `${t.hours}h logged for ${projects.find(p => p.id === t.projectId)?.name || 'Project'}`,
      date: new Date(t.date),
      icon: Clock,
      color: 'text-purple-500'
    }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5);

  // Aggregate deadlines
  const deadlines = [
    ...tasks
      .filter(t => t.dueDate && t.status !== 'done')
      .map(t => ({
        id: t.id,
        title: t.title,
        date: new Date(t.dueDate!),
        priority: t.priority,
        type: 'task'
      })),
    ...projects
      .filter(p => p.endDate && p.status === 'active')
      .map(p => ({
        id: p.id,
        title: `Project End: ${p.name}`,
        date: new Date(p.endDate!),
        priority: 'high',
        type: 'project'
      }))
  ]
  .sort((a, b) => a.date.getTime() - b.date.getTime())
  .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="flex items-center p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full bg-muted`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.date, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlines.length > 0 ? (
                deadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(deadline.date, { addSuffix: true })}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      deadline.priority === 'urgent' || deadline.priority === 'high' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {deadline.priority}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

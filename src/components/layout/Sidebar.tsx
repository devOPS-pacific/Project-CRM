import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  KanbanSquare, 
  Users, 
  Target, 
  Clock, 
  BarChart3, 
  Settings,
  Building2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Boards', href: '/boards', icon: KanbanSquare },
  { name: 'CRM', href: '/crm', icon: Target },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Resources', href: '/resources', icon: Users },
  { name: 'Time', href: '/time', icon: Clock },
  { name: 'Finances', href: '/finances', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}: { 
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (v: boolean) => void;
}) {
  const organization = useStore(state => state.organization);

  const sidebarContent = (
    <div className={cn(
      "flex h-full flex-col border-r border-border bg-muted/50 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b border-border px-4 justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground overflow-hidden">
          {!isCollapsed && (
            <>
              <Avatar 
                src={organization?.logoUrl} 
                fallback={organization?.name ? organization.name.charAt(0).toUpperCase() : 'N'} 
                size="sm"
                className="rounded-md shrink-0"
              />
              <span className="truncate">{organization?.name || 'Nexus'}</span>
            </>
          )}
        </div>
        {!isMobileOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex h-8 w-8" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        {setIsMobileOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-8 w-8" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen?.(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed ? "justify-center" : ""
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isCollapsed ? "" : "mr-3"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <NavLink
          to="/settings"
          onClick={() => setIsMobileOpen?.(false)}
          className={({ isActive }) =>
            cn(
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              isCollapsed ? "justify-center" : ""
            )
          }
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={cn(
            "h-5 w-5 flex-shrink-0",
            isCollapsed ? "" : "mr-3"
          )} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg outline-none transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

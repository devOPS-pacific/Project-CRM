import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 print:overflow-visible print:bg-white print:p-0">
          <div className="mx-auto max-w-7xl print:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

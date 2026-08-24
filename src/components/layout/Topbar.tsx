import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Plus, LogOut, Settings, Check, Moon, Sun, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

import { QuickAdd } from '../QuickAdd';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New task assigned', description: 'Sarah assigned you to "Design Homepage Mockups"', time: '5m ago', unread: true },
  { id: 2, title: 'Invoice paid', description: 'Acme Corp paid Invoice #INV-2026-001', time: '2h ago', unread: true },
  { id: 3, title: 'Project update', description: 'Internal Tooling v2 phase 1 completed', time: '1d ago', unread: false },
];

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { currentUser, logout, theme, setTheme } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Signout error:', e);
    }
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4 lg:hidden mr-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            placeholder="Search projects, tasks, or clients..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <QuickAdd />
        
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-muted transition-colors ${notification.unread ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${notification.unread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notification.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="border-t border-border px-4 py-2">
                <button className="text-xs text-center w-full font-medium text-muted-foreground hover:text-foreground">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Avatar 
              fallback={currentUser?.name.charAt(0) || 'U'} 
              size="sm" 
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-border">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/settings');
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                Settings
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                    Light Mode
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

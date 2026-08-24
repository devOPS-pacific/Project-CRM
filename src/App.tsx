/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Boards } from './pages/Boards';
import { CRM } from './pages/CRM';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Resources } from './pages/Resources';
import { Time } from './pages/Time';
import { Finances } from './pages/Finances';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Login } from './pages/Login';
import { useStore } from './store/useStore';
import { FirebaseProvider } from './components/FirebaseProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { NotificationSystem } from './components/NotificationSystem';

function AppContent() {
  const currentUser = useStore((state) => state.currentUser);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <NotificationSystem />
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="boards" element={<Boards />} />
            <Route path="crm" element={<CRM />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="resources" element={<Resources />} />
            <Route path="time" element={<Time />} />
            <Route path="finances" element={<Finances />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}


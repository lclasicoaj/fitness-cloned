import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { BarChart3, CalendarDays, Dumbbell, LayoutGrid, ListChecks, WifiOff } from 'lucide-react';
import { applyTheme, useActiveSession, useOnline, useSettings } from './lib/hooks';
import { cn } from './lib/utils';
import UpdatePrompt from './components/UpdatePrompt';
import BuilderPage from './pages/BuilderPage';
import SessionPage from './pages/SessionPage';
import HistoryPage from './pages/HistoryPage';
import SessionDetailPage from './pages/SessionDetailPage';
import StatsPage from './pages/StatsPage';
import ProgramsPage from './pages/ProgramsPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import ToolsPage from './pages/ToolsPage';
import ToolPage from './pages/tools/ToolPage';
import SettingsPage from './pages/SettingsPage';
import MorePage from './pages/MorePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

const NAV = [
  { to: '/', label: 'Workout', icon: Dumbbell, end: true },
  { to: '/programs', label: 'Programs', icon: ListChecks },
  { to: '/history', label: 'History', icon: CalendarDays },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/more', label: 'More', icon: LayoutGrid },
];

export default function App() {
  const settings = useSettings();
  const online = useOnline();
  const active = useActiveSession();
  const location = useLocation();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="safe-top sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-14 items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span>RepForge</span>
          </NavLink>
          <div className="flex items-center gap-2">
            {!online && (
              <span className="badge gap-1" title="You are offline. Everything still works.">
                <WifiOff className="h-3 w-3" /> Offline
              </span>
            )}
            {active && location.pathname !== '/session' && (
              <NavLink to="/session" className="badge bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-50">
                ● Workout in progress
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<SessionDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:id" element={<ProgramDetailPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:tool" element={<ToolPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-xs font-medium',
                  isActive ? 'text-brand-700 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <UpdatePrompt />
    </div>
  );
}

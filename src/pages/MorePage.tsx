import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Info, Settings, Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui';

const LINKS = [
  { to: '/exercises', title: 'Exercise library', desc: 'Browse, favorite and create exercises', icon: BookOpen },
  { to: '/tools', title: 'Tools', desc: 'Calories, macros, BMI, heart rate, 1RM', icon: Wrench },
  { to: '/settings', title: 'Settings & backup', desc: 'Units, timer, theme, export and import', icon: Settings },
  { to: '/about', title: 'About & privacy', desc: 'How RepForge works offline', icon: Info },
];

export default function MorePage() {
  return (
    <div>
      <PageHeader title="More" />
      <ul className="space-y-2">
        {LINKS.map(({ to, title, desc, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="card flex items-center gap-3 p-4 hover:border-brand-500">
              <Icon className="h-5 w-5 text-brand-700 dark:text-brand-500" />
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

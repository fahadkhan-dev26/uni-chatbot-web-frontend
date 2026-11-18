import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Files,
  FolderTree,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  UploadCloud,
  X,
} from 'lucide-react';
import { UNIVERSITY_LOGO, UNIVERSITY_NAME } from '../../utils/branding';
import { getInitials } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/documents', label: 'Documents', icon: Files, end: true },
  { to: '/admin/documents/upload', label: 'Upload Documents', icon: UploadCloud },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const itemClass = ({ isActive }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    );

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    toast.success('Signed out');
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="flex h-dvh w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <Link to="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5">
          <img src={UNIVERSITY_LOGO} alt="" className="size-9 shrink-0 rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {UNIVERSITY_NAME}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Administration
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={itemClass}
              onClick={onNavigate}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4.5 shrink-0 animate-spin" />
            ) : (
              <LogOut className="size-4.5 shrink-0" />
            )}
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {getInitials(user?.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-900">
              {user?.name || 'Administrator'}
            </span>
            <span className="block truncate text-xs text-slate-500">{user?.email}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

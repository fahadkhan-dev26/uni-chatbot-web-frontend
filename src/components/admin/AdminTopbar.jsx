import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/format';

const SECTION_LABELS = {
  '/admin': 'Overview',
  '/admin/documents': 'Documents',
  '/admin/documents/upload': 'Upload Documents',
  '/admin/categories': 'Categories',
  '/admin/settings': 'Settings',
};

export default function AdminTopbar({ onOpenMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const section = SECTION_LABELS[pathname] ?? 'Administration';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <Link to="/admin" className="text-slate-500 transition-colors hover:text-slate-900">
          Administration
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-slate-300" aria-hidden="true" />
        <span className="truncate font-medium text-slate-900">{section}</span>
      </nav>

      <p className="min-w-0 truncate text-sm font-semibold text-slate-900 sm:hidden">
        {section}
      </p>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          to="/chat"
          className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
        >
          <MessageSquare className="size-4" />
          Student chat
        </Link>
        <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {getInitials(user?.name)}
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="block max-w-48 truncate text-sm font-medium leading-tight text-slate-900">
              {user?.name || 'Administrator'}
            </span>
            <span className="block max-w-48 truncate text-xs leading-tight text-slate-500">
              {user?.email}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

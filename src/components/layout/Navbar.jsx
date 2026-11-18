import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/chat', label: 'Ask a question' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="size-9 rounded-xl" />
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900">
              University AI Chatbot
            </span>
            <span className="block text-xs text-slate-500">
              Answers from official documents
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <ShieldCheck className="size-4" />
                  Admin
                </Link>
              )}
              <span className="max-w-32 truncate text-sm text-slate-500">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="ml-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Admin sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div
            className="container-page flex flex-col gap-1 py-3"
            onClick={() => setIsOpen(false)}
          >
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin dashboard
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <GraduationCap className="size-4" />
                Admin sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

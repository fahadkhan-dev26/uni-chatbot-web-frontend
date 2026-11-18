import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import Spinner from '../components/common/Spinner';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminSidebar />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 animate-overlay-in bg-slate-900/50"
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 animate-fade-in shadow-2xl">
            <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <AdminTopbar onOpenMenu={() => setIsSidebarOpen(true)} />
        <main id="admin-main" tabIndex={-1} className="mx-auto w-full max-w-[1440px] p-4 outline-none sm:p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                <Spinner />
                <p className="text-sm text-slate-500">Loading page…</p>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

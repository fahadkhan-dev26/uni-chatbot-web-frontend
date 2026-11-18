import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import Spinner from './components/common/Spinner';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/student/Home';
import AdminLogin from './pages/admin/Login';
import NotFound from './pages/NotFound';

// The chat shell pulls in the markdown renderer, so it is split out of the
// landing-page bundle. Admin pages are split for the same reason.
const Chat = lazy(() => import('./pages/student/Chat'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminDocuments = lazy(() => import('./pages/admin/Documents'));
const AdminUploadDocuments = lazy(() => import('./pages/admin/UploadDocuments'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function LoadingScreen({ label }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public student area */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Chat is a standalone full-screen shell with its own navigation */}
        <Route
          path="chat"
          element={
            <Suspense fallback={<LoadingScreen label="Loading chat…" />}>
              <Chat />
            </Suspense>
          }
        />

        {/* Admin sign-in */}
        <Route path="admin/login" element={<AdminLogin />} />

        {/* Protected admin area */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Suspense fallback={<LoadingScreen label="Loading administration…" />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="documents/upload" element={<AdminUploadDocuments />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

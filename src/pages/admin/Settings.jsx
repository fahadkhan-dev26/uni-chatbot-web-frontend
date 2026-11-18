import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock,
  Database,
  FileUp,
  LogOut,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/admin/PageHeader';
import { API_BASE_URL } from '../../services/api';
import { systemService } from '../../services/systemService';
import { useAuth } from '../../hooks/useAuth';
import {
  MAX_FILE_SIZE_MB,
  MAX_UPLOAD_FILES,
} from '../../constants/documents';
import {
  formatDate,
  formatTime,
  getInitials,
} from '../../utils/format';
import { cn } from '../../utils/cn';

const PILL_STATES = {
  online: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  offline: 'bg-rose-50 text-rose-700 ring-rose-200',
  unknown: 'bg-amber-50 text-amber-800 ring-amber-200',
};

const DOT_STATES = {
  online: 'bg-emerald-500',
  offline: 'bg-rose-500',
  unknown: 'bg-amber-500',
};

function ConnectionPill({ state, label }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        PILL_STATES[state] ?? PILL_STATES.unknown,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', DOT_STATES[state] ?? DOT_STATES.unknown)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2.5 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-800 sm:text-right">{children}</dd>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [system, setSystem] = useState({
    data: null,
    error: null,
    isLoading: true,
    checkedAt: null,
  });

  const loadSystem = useCallback(async () => {
    setSystem((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const { data } = await systemService.getStatus();
      setSystem({
        data,
        error: null,
        isLoading: false,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      setSystem({
        data: error.response?.data ?? null,
        error: error.friendlyMessage || 'Could not reach the API.',
        isLoading: false,
        checkedAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    systemService
      .getStatus()
      .then(({ data }) => {
        if (cancelled) return;
        setSystem({
          data,
          error: null,
          isLoading: false,
          checkedAt: new Date().toISOString(),
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setSystem({
          data: error.response?.data ?? null,
          error: error.friendlyMessage || 'Could not reach the API.',
          isLoading: false,
          checkedAt: new Date().toISOString(),
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/admin/login', { replace: true });
  };

  const apiState = system.data?.api?.status === 'online'
    ? 'online'
    : system.error
      ? 'offline'
      : 'unknown';
  const databaseState = system.data?.database?.status === 'connected'
    ? 'online'
    : system.data?.database?.status
      ? 'offline'
      : system.error
        ? 'offline'
        : 'unknown';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Your administrator account, API connection and the safety rules that protect the library."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <h2 className="text-base font-semibold text-slate-900">
              Administrator profile
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Identity verified by the backend on every request.
            </p>

            <div className="mt-5 flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg font-semibold text-white">
                {getInitials(user?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900">
                  {user?.name || 'Administrator'}
                </p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
                  <ShieldCheck className="size-3" />
                  {user?.role || 'admin'}
                </span>
              </div>
            </div>

            <dl className="mt-6">
              <DetailRow label="Account status">
                <ConnectionPill
                  state={user?.isActive === false ? 'offline' : 'online'}
                  label={user?.isActive === false ? 'Inactive' : 'Active'}
                />
              </DetailRow>
              <DetailRow label="Last sign-in">
                {formatDate(user?.lastLogin) === '—'
                  ? 'Not recorded'
                  : formatDate(user?.lastLogin)}
              </DetailRow>
              <DetailRow label="Member since">{formatDate(user?.createdAt)}</DetailRow>
              <DetailRow label="Authentication">
                JWT bearer token issued by <code className="font-mono text-xs">POST /api/auth/login</code>
              </DetailRow>
            </dl>
          </Card>

          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  API &amp; database
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Live status from the Express service. Secrets are never exposed
                  to this page.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadSystem}
                disabled={system.isLoading}
              >
                <RefreshCw className={cn('size-4', system.isLoading && 'animate-spin')} />
                Check again
              </Button>
            </div>

            {system.error && (
              <div
                className={cn(
                  'mt-4 rounded-xl border px-3 py-2.5 text-xs leading-relaxed',
                  system.data
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-rose-200 bg-rose-50 text-rose-700',
                )}
                role="status"
              >
                {system.data
                  ? 'The API responded but reported a dependency problem. Check the database status below.'
                  : system.error}
              </div>
            )}

            <dl className="mt-4">
              <DetailRow label="API base URL">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                  {API_BASE_URL}
                </code>
              </DetailRow>
              <DetailRow label="API service">
                <ConnectionPill
                  state={system.isLoading ? 'unknown' : apiState}
                  label={
                    system.isLoading
                      ? 'Checking…'
                      : apiState === 'online'
                        ? 'Online'
                        : 'Unreachable'
                  }
                />
              </DetailRow>
              <DetailRow label="Environment">
                {system.data?.api?.environment || '—'}
              </DetailRow>
              <DetailRow label="Database">
                <ConnectionPill
                  state={system.isLoading ? 'unknown' : databaseState}
                  label={
                    system.isLoading
                      ? 'Checking…'
                      : system.data?.database?.status || 'Unknown'
                  }
                />
              </DetailRow>
              <DetailRow label="Uptime">{system.data?.api?.uptime || '—'}</DetailRow>
              <DetailRow label="Last checked">
                {system.checkedAt
                  ? `${formatDate(system.checkedAt)} · ${formatTime(system.checkedAt)}`
                  : '—'}
              </DetailRow>
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">
              Session &amp; security
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Signing out clears the token stored by this browser. The token is
              never logged or rendered.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleLogout}>
                <LogOut className="size-4" />
                Sign out
              </Button>
              <p className="text-xs text-slate-500">
                You will be redirected to the administrator sign-in page.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Server className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                Access rules
              </h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                Uploading, replacing, reprocessing and deleting documents requires
                an administrator token.
              </li>
              <li className="flex gap-2">
                <Database className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                The dashboard reads documents through the REST API; React never
                connects to MongoDB.
              </li>
              <li className="flex gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                Expired or revoked tokens are dropped automatically and return you
                to sign-in.
              </li>
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileUp className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                Upload policy
              </h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>PDF files only, with selectable text.</li>
              <li>Up to {MAX_FILE_SIZE_MB} MB per file.</li>
              <li>Up to {MAX_UPLOAD_FILES} files per upload batch.</li>
              <li>Each PDF is text-extracted, chunked and embedded before it is searchable.</li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              The Express API enforces these limits; the dashboard mirrors them to
              catch problems before upload.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

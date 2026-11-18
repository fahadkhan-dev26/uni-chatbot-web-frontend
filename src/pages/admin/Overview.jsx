import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CircleCheck,
  FileText,
  Layers,
  RefreshCw,
  TriangleAlert,
  UploadCloud,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import CategoryChart from '../../components/admin/CategoryChart';
import CategoryBadge from '../../components/admin/CategoryBadge';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import { useDocumentLibrary } from '../../hooks/useDocumentLibrary';
import { formatDate, formatNumber, formatTime } from '../../utils/format';
import { cn } from '../../utils/cn';

const HEALTH_SEGMENTS = [
  { key: 'completed', label: 'Processed', className: 'bg-emerald-500' },
  { key: 'failed', label: 'Failed', className: 'bg-rose-500' },
  { key: 'processing', label: 'Processing', className: 'bg-blue-500' },
  { key: 'pending', label: 'Pending', className: 'bg-slate-300' },
];

function RecentUploadsSkeleton() {
  return (
    <ul className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <span className="size-9 animate-pulse rounded-lg bg-slate-100" />
          <span className="h-4 w-48 animate-pulse rounded bg-slate-100" />
          <span className="ml-auto h-5 w-24 animate-pulse rounded-full bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

export default function Overview() {
  const { stats, isLoading, isRefreshing, error, lastUpdated, refresh } =
    useDocumentLibrary();

  const hasData = stats.totalDocuments > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Overview"
        description="Live operational data for the document library that powers student answers."
        actions={
          <>
            {lastUpdated && (
              <span className="mr-1 hidden text-xs text-slate-500 sm:inline">
                Updated {formatTime(lastUpdated)}
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => refresh({ silent: true })}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button as={Link} to="/admin/documents/upload" size="sm">
              <UploadCloud className="size-4" />
              Upload documents
            </Button>
          </>
        }
      />

      {error && <ErrorState message={error} onRetry={() => refresh()} />}

      {(!error || hasData) && (
        <>
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
            aria-label="Library statistics"
          >
            <StatCard
              label="Total documents"
              value={stats.totalDocuments}
              hint={`Across ${stats.activeCategories} categories`}
              icon={FileText}
              tone="brand"
              loading={isLoading}
            />
            <StatCard
              label="Total PDF pages"
              value={stats.totalPages}
              hint="Extracted from uploaded PDFs"
              icon={BookOpen}
              tone="violet"
              loading={isLoading}
            />
            <StatCard
              label="Total chunks"
              value={stats.totalChunks}
              hint="Search-ready passages"
              icon={Layers}
              tone="amber"
              loading={isLoading}
            />
            <StatCard
              label="Successfully processed"
              value={stats.completed}
              hint={`${stats.completionRate}% of the library`}
              icon={CircleCheck}
              tone="emerald"
              loading={isLoading}
            />
            <StatCard
              label="Failed processing"
              value={stats.failed}
              hint={stats.failed > 0 ? 'Needs review' : 'No failures'}
              icon={TriangleAlert}
              tone="rose"
              loading={isLoading}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Documents by category
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    How the indexed library is distributed.
                  </p>
                </div>
                <Link
                  to="/admin/categories"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Details
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="mt-5 h-72 animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <div className="mt-3">
                  <CategoryChart categories={stats.categories} />
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-slate-900">
                Processing health
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Ingestion status across every document.
              </p>

              {isLoading ? (
                <div className="mt-6 space-y-3" aria-hidden="true">
                  <span className="block h-10 w-32 animate-pulse rounded-lg bg-slate-100" />
                  <span className="block h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
                  <span className="block h-4 w-40 animate-pulse rounded bg-slate-100" />
                </div>
              ) : (
                <>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-slate-900">
                      {stats.completionRate}%
                    </span>
                    <span className="text-sm text-slate-500">successfully processed</span>
                  </p>

                  <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                    {HEALTH_SEGMENTS.filter(
                      (segment) => stats[segment.key] > 0,
                    ).map((segment) => (
                      <span
                        key={segment.key}
                        className={segment.className}
                        style={{
                          width: `${(stats[segment.key] / stats.totalDocuments) * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {HEALTH_SEGMENTS.map((segment) => (
                      <li
                        key={segment.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={cn('size-2.5 shrink-0 rounded-full', segment.className)}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-slate-600">{segment.label}</span>
                        <span className="font-medium text-slate-900">
                          {formatNumber(stats[segment.key])}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {stats.failed > 0 ? (
                    <Link
                      to="/admin/documents?status=failed"
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800"
                    >
                      <TriangleAlert className="size-3.5" />
                      Review {stats.failed} failed {stats.failed === 1 ? 'document' : 'documents'}
                    </Link>
                  ) : (
                    <Link
                      to="/admin/documents"
                      className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Open document library
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  )}
                </>
              )}
            </Card>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent uploads
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  The five most recently added documents.
                </p>
              </div>
              <Link
                to="/admin/documents"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                View all
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <RecentUploadsSkeleton />
            ) : stats.recent.length === 0 ? (
              <EmptyState
                icon={UploadCloud}
                title="No documents yet"
                description="Upload the first PDF to start building the assistant's knowledge base."
                className="m-4 border-0 bg-transparent py-8 sm:m-5"
              />
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-200">
                {stats.recent.map((document) => (
                  <li
                    key={document._id}
                    className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText className="size-4.5" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {document.title}
                      </p>
                      <p className="truncate font-mono text-[11px] text-slate-500">
                        {document.filename}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <CategoryBadge value={document.category} />
                      <span className="text-xs text-slate-500">
                        {formatNumber(document.totalPages)} pages
                      </span>
                      <StatusBadge status={document.processingStatus} />
                      <span className="text-xs text-slate-500 sm:w-24 sm:text-right">
                        {formatDate(document.uploadedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

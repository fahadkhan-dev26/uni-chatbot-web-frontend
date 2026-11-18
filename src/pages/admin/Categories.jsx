import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Files,
  FolderTree,
  Info,
  Layers,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import CategoryDistribution from '../../components/admin/CategoryDistribution';
import ErrorState from '../../components/admin/ErrorState';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { useDocumentLibrary } from '../../hooks/useDocumentLibrary';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

const TILE_TONES = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-orange-50 text-orange-600',
  slate: 'bg-slate-100 text-slate-600',
};

const BAR_TONES = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
};

export default function Categories() {
  const { stats, isLoading, isRefreshing, error, refresh } = useDocumentLibrary();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Categories"
        description="The fixed taxonomy the assistant retrieves from. Every document belongs to one category."
        actions={
          <>
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

      {(!error || stats.totalDocuments > 0) && (
        <>
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Category statistics"
          >
            <StatCard
              label="Categories in use"
              value={stats.activeCategories}
              hint={`${stats.categories.length} categories defined`}
              icon={FolderTree}
              tone="brand"
              loading={isLoading}
            />
            <StatCard
              label="Documents categorized"
              value={stats.totalDocuments}
              hint="In the document library"
              icon={Files}
              tone="violet"
              loading={isLoading}
            />
            <StatCard
              label="Pages across categories"
              value={stats.totalPages}
              hint="Extracted PDF pages"
              icon={BookOpen}
              tone="amber"
              loading={isLoading}
            />
            <StatCard
              label="Chunks across categories"
              value={stats.totalChunks}
              hint="Indexed text passages"
              icon={Layers}
              tone="emerald"
              loading={isLoading}
            />
          </section>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Library distribution
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Share of documents assigned to each category.
                </p>
              </div>
              <Link
                to="/admin/documents"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Open documents
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row" aria-hidden="true">
                <span className="size-52 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <span className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : (
              <div className="mt-5">
                <CategoryDistribution
                  categories={stats.categories}
                  totalDocuments={stats.totalDocuments}
                />
              </div>
            )}
          </Card>

          <section aria-label="Categories" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.categories.map((category) => {
              const share =
                stats.totalDocuments === 0
                  ? 0
                  : Math.round((category.count / stats.totalDocuments) * 100);

              return (
                <Card key={category.value} className="flex flex-col p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        TILE_TONES[category.tone] ?? TILE_TONES.slate,
                      )}
                    >
                      <FolderTree className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {category.label}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {formatNumber(category.count)}{' '}
                        {category.count === 1 ? 'document' : 'documents'} · {share}%
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {category.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                      <dt className="text-slate-400">Pages</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-800">
                        {formatNumber(category.pages)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                      <dt className="text-slate-400">Chunks</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-800">
                        {formatNumber(category.chunks)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        BAR_TONES[category.tone] ?? BAR_TONES.slate,
                      )}
                      style={{ width: `${share}%` }}
                    />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <Link
                      to={`/admin/documents?category=${category.value}`}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                    >
                      View documents
                    </Link>
                    <Link
                      to={`/admin/documents/upload?category=${category.value}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Upload
                    </Link>
                  </div>
                </Card>
              );
            })}
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-slate-600">
              Categories are defined by the backend document index. Assign the
              correct category when uploading or replacing a PDF; the assistant
              uses it to narrow retrieval.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Files, Loader2, RefreshCw, SearchX, UploadCloud } from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DocumentDetailsDialog from '../../components/admin/DocumentDetailsDialog';
import DocumentFilters from '../../components/admin/DocumentFilters';
import DocumentTable from '../../components/admin/DocumentTable';
import DocumentTableSkeleton from '../../components/admin/DocumentTableSkeleton';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import PageHeader from '../../components/admin/PageHeader';
import ReplaceDocumentDialog from '../../components/admin/ReplaceDocumentDialog';
import TablePagination from '../../components/admin/TablePagination';
import { documentService } from '../../services/documentService';
import { useDocumentLibrary } from '../../hooks/useDocumentLibrary';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 10;

const uploadTime = (document) => {
  const time = new Date(document.uploadedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export default function Documents() {
  const { documents, isLoading, isRefreshing, error, refresh } = useDocumentLibrary();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    query: '',
    category: searchParams.get('category') || 'all',
    academicYear: 'all',
    status: searchParams.get('status') || 'all',
  }));
  const [page, setPage] = useState(1);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToReplace, setDocumentToReplace] = useState(null);
  const [documentToView, setDocumentToView] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const years = useMemo(
    () =>
      [...new Set(documents.map((document) => document.academicYear).filter(Boolean))]
        .sort((a, b) => b.localeCompare(a)),
    [documents],
  );

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return documents
      .filter((document) => {
        if (filters.category !== 'all' && document.category !== filters.category) {
          return false;
        }
        if (
          filters.academicYear !== 'all' &&
          document.academicYear !== filters.academicYear
        ) {
          return false;
        }
        if (filters.status !== 'all' && document.processingStatus !== filters.status) {
          return false;
        }
        if (!query) return true;

        return (
          document.title?.toLowerCase().includes(query) ||
          document.filename?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => uploadTime(b) - uploadTime(a));
  }, [documents, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleDocuments = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const hasActiveFilters =
    filters.query !== '' ||
    filters.category !== 'all' ||
    filters.academicYear !== 'all' ||
    filters.status !== 'all';

  const updateFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      academicYear: 'all',
      status: 'all',
    });
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const { data } = await documentService.remove(documentToDelete._id);
      toast.success(data.message || 'Document deleted.');
      setDocumentToDelete(null);
      await refresh({ silent: true });
    } catch (deleteError) {
      toast.error(deleteError.friendlyMessage || 'Could not delete the document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReprocess = async (document) => {
    setPendingAction({ id: document._id, type: 'reprocess' });
    try {
      const { data } = await documentService.reprocess(document._id);
      toast.success(data.message || 'Document reprocessed successfully.');
      await refresh({ silent: true });
    } catch (reprocessError) {
      toast.error(
        reprocessError.friendlyMessage || 'Could not reprocess the document.',
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleReplaced = async () => {
    await refresh({ silent: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="Review the PDFs indexed for the student assistant. Search, filter, reprocess or replace any document."
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

      <div className="card-surface overflow-hidden">
        <DocumentFilters
          filters={filters}
          years={years}
          onChange={updateFilters}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <p className="text-sm font-medium text-slate-900">
            Library{' '}
            <span className="font-normal text-slate-400">
              ({filtered.length}
              {hasActiveFilters ? ` of ${documents.length}` : ''})
            </span>
          </p>
          {isRefreshing && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing…
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="border-t border-slate-200">
            <DocumentTableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={documents.length === 0 ? Files : SearchX}
            title={
              documents.length === 0
                ? 'No documents in the library'
                : 'No documents match these filters'
            }
            description={
              documents.length === 0
                ? 'Upload official university PDFs to give the assistant something to answer from.'
                : 'Try a different search term, category, academic year or status.'
            }
            className="m-4 border-0 bg-transparent py-8 sm:m-5"
            action={
              documents.length === 0 ? (
                <Button as={Link} to="/admin/documents/upload" size="sm">
                  <UploadCloud className="size-4" />
                  Upload documents
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="border-t border-slate-200">
              <DocumentTable
                documents={visibleDocuments}
                pendingAction={pendingAction}
                onDelete={setDocumentToDelete}
                onReplace={setDocumentToReplace}
                onReprocess={handleReprocess}
                onView={setDocumentToView}
              />
            </div>
            <TablePagination
              page={safePage}
              pageCount={pageCount}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(documentToDelete)}
        title="Delete this document?"
        description={
          documentToDelete
            ? `"${documentToDelete.title}" will be removed from the assistant permanently.`
            : undefined
        }
        confirmLabel="Delete document"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDocumentToDelete(null);
        }}
      >
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700">
          This also deletes every indexed chunk for the document and removes the
          PDF from server storage. This action cannot be undone.
        </div>
      </ConfirmDialog>

      {documentToReplace && (
        <ReplaceDocumentDialog
          key={documentToReplace._id}
          document={documentToReplace}
          onClose={() => setDocumentToReplace(null)}
          onReplaced={handleReplaced}
        />
      )}

      {documentToView && (
        <DocumentDetailsDialog
          key={documentToView._id}
          document={documentToView}
          onClose={() => setDocumentToView(null)}
        />
      )}
    </div>
  );
}

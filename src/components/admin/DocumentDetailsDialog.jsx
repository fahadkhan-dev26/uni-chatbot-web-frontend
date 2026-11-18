import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '../common/Button';
import CategoryBadge from './CategoryBadge';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { documentService } from '../../services/documentService';
import { formatDate, formatFileSize, formatNumber } from '../../utils/format';

function Field({ label, children, className }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default function DocumentDetailsDialog({ document, onClose }) {
  const [detail, setDetail] = useState(null);
  const [chunkSummary, setChunkSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    documentService
      .getById(document._id)
      .then(({ data }) => {
        if (cancelled) return;
        setDetail(data.document ?? null);
        setChunkSummary(data.chunkSummary ?? []);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(
          loadError.friendlyMessage || 'Could not load this document from the server.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [document._id]);

  const uploadedBy =
    detail?.uploadedBy && typeof detail.uploadedBy === 'object'
      ? detail.uploadedBy
      : null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Document details"
      description="Live record returned by the documents API."
      size="lg"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading document…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : detail ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.processingStatus} />
            <CategoryBadge value={detail.category} />
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              {detail.title}
            </Field>
            <Field label="Filename" className="min-w-0 sm:col-span-2">
              <span className="break-all font-mono text-xs text-slate-600">
                {detail.filename}
              </span>
            </Field>
            <Field label="Academic year">{detail.academicYear || '—'}</Field>
            <Field label="File size">{formatFileSize(detail.fileSize)}</Field>
            <Field label="Pages">{formatNumber(detail.totalPages)}</Field>
            <Field label="Chunks">{formatNumber(detail.totalChunks)}</Field>
            <Field label="Uploaded">{formatDate(detail.uploadedAt)}</Field>
            <Field label="Uploaded by">
              {uploadedBy ? (
                <span className="block">
                  {uploadedBy.name}
                  <span className="block text-xs text-slate-500">{uploadedBy.email}</span>
                </span>
              ) : (
                '—'
              )}
            </Field>
          </dl>

          {detail.processingError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                Processing error
              </p>
              <p className="mt-1 text-sm leading-relaxed text-rose-700">
                {detail.processingError}
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Chunks by page
            </p>
            {chunkSummary.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">
                No chunks are stored for this document.
              </p>
            ) : (
              <ul className="mt-2 max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                {chunkSummary.map((entry) => (
                  <li
                    key={entry._id}
                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-700"
                  >
                    <span>Page {entry._id}</span>
                    <span className="text-xs text-slate-500">
                      {formatNumber(entry.chunks)} chunk{entry.chunks === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

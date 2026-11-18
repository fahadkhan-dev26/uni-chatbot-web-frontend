import {
  CircleAlert,
  FileText,
  Replace,
  RotateCw,
  Trash2,
} from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import {
  formatDate,
  formatFileSize,
  formatNumber,
} from '../../utils/format';
import { cn } from '../../utils/cn';

function IconAction({ label, icon: Icon, onClick, disabled, spinning, tone = 'slate' }) {
  const tones = {
    slate: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    rose: 'text-slate-500 hover:bg-rose-50 hover:text-rose-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        tones[tone] ?? tones.slate,
      )}
    >
      <Icon className={cn('size-4', spinning && 'animate-spin')} />
    </button>
  );
}

function TextAction({ icon: Icon, label, onClick, disabled, tone = 'slate' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'rose'
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-600 hover:bg-slate-100',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

export default function DocumentTable({
  documents,
  pendingAction,
  onDelete,
  onReplace,
  onReprocess,
  onView,
}) {
  const isPending = (documentId, type) =>
    pendingAction?.id === documentId && pendingAction?.type === type;

  const actionsDisabled = (document) => document.processingStatus === 'processing';

  const actionsTitle = (document) =>
    document.processingStatus === 'processing'
      ? 'Wait until processing finishes'
      : undefined;

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-2 py-3">Document</th>
              <th scope="col" className="px-2 py-3">Filename</th>
              <th scope="col" className="px-2 py-3">Category</th>
              <th scope="col" className="px-2 py-3">Academic year</th>
              <th scope="col" className="px-2 py-3 text-right">Pages</th>
              <th scope="col" className="px-2 py-3">Status</th>
              <th scope="col" className="px-2 py-3">Uploaded</th>
              <th scope="col" className="px-2 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr
                key={document._id}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText className="size-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onView(document)}
                        title={`View details for ${document.title}`}
                        className="block max-w-44 truncate text-left text-sm font-medium text-slate-900 underline-offset-2 hover:text-brand-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      >
                        {document.title}
                      </button>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3.5">
                  <p
                    className="max-w-32 truncate font-mono text-xs text-slate-600"
                    title={document.filename}
                  >
                    {document.filename}
                  </p>
                </td>
                <td className="px-2 py-3.5">
                  <div className="max-w-40">
                    <CategoryBadge value={document.category} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-3.5 text-sm text-slate-600">
                  {document.academicYear || '—'}
                </td>
                <td className="whitespace-nowrap px-2 py-3.5 text-right">
                  <span className="text-sm font-medium text-slate-900">
                    {formatNumber(document.totalPages)}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {formatNumber(document.totalChunks)} chunks
                  </span>
                </td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={document.processingStatus} />
                    {document.processingStatus === 'failed' && (
                      <CircleAlert
                        className="size-3.5 shrink-0 text-rose-400"
                        aria-label="Processing failed"
                      />
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-3.5 text-sm text-slate-600">
                  {formatDate(document.uploadedAt)}
                </td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center justify-end">
                    <IconAction
                      label="Reprocess document"
                      icon={RotateCw}
                      onClick={() => onReprocess(document)}
                      disabled={Boolean(pendingAction) || actionsDisabled(document)}
                      spinning={isPending(document._id, 'reprocess')}
                    />
                    <IconAction
                      label="Replace document"
                      icon={Replace}
                      onClick={() => onReplace(document)}
                      disabled={Boolean(pendingAction) || actionsDisabled(document)}
                    />
                    <IconAction
                      label="Delete document"
                      icon={Trash2}
                      onClick={() => onDelete(document)}
                      disabled={Boolean(pendingAction) || actionsDisabled(document)}
                      tone="rose"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {documents.map((document) => (
          <li key={document._id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <FileText className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onView(document)}
                  title={`View details for ${document.title}`}
                  className="block text-left text-pretty text-sm font-semibold text-slate-900 underline-offset-2 hover:text-brand-700 hover:underline"
                >
                  {document.title}
                </button>
                <p
                  className="mt-0.5 break-all font-mono text-[11px] text-slate-500"
                  title={document.filename}
                >
                  {document.filename}
                </p>
              </div>
              <StatusBadge status={document.processingStatus} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
              <div>
                <dt className="text-slate-400">Category</dt>
                <dd className="mt-0.5">
                  <CategoryBadge value={document.category} />
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Academic year</dt>
                <dd className="mt-0.5 text-slate-700">
                  {document.academicYear || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Pages / chunks</dt>
                <dd className="mt-0.5 text-slate-700">
                  {formatNumber(document.totalPages)} pages ·{' '}
                  {formatNumber(document.totalChunks)} chunks
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Uploaded</dt>
                <dd className="mt-0.5 text-slate-700">
                  {formatDate(document.uploadedAt)}
                </dd>
              </div>
            </dl>

            <div
              className="mt-3 flex flex-wrap items-center justify-end gap-1 border-t border-slate-100 pt-2"
              title={actionsTitle(document)}
            >
              <TextAction
                icon={RotateCw}
                label="Reprocess"
                onClick={() => onReprocess(document)}
                disabled={Boolean(pendingAction) || actionsDisabled(document)}
              />
              <TextAction
                icon={Replace}
                label="Replace"
                onClick={() => onReplace(document)}
                disabled={Boolean(pendingAction) || actionsDisabled(document)}
              />
              <TextAction
                icon={Trash2}
                label="Delete"
                tone="rose"
                onClick={() => onDelete(document)}
                disabled={Boolean(pendingAction) || actionsDisabled(document)}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

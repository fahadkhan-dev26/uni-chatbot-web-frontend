import { useId } from 'react';
import {
  CircleCheck,
  FileText,
  Loader2,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  DOCUMENT_CATEGORIES,
  getAcademicYearOptions,
} from '../../constants/documents';
import { formatFileSize, formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

const YEARS = getAcademicYearOptions();

const inputClass =
  'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500';

export default function UploadFileRow({ item, index, onUpdate, onRemove }) {
  const fieldId = useId();
  const busy = item.status === 'uploading' || item.status === 'processing';
  const finished = item.status === 'completed';
  const failed = item.status === 'failed';

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            failed ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600',
          )}
        >
          <FileText className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900" title={item.file.name}>
            {item.file.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatFileSize(item.file.size)}
            <span className="mx-1.5 text-slate-300">·</span>
            {item.status === 'ready' && 'Ready to upload'}
            {item.status === 'uploading' && `Uploading ${item.progress}%`}
            {item.status === 'processing' && 'Processing on the server'}
            {item.status === 'completed' && 'Uploaded and processed'}
            {item.status === 'failed' && 'Needs attention'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {busy && <Loader2 className="size-4 animate-spin text-brand-600" aria-label="In progress" />}
          {finished && <CircleCheck className="size-5 text-emerald-500" aria-label="Completed" />}
          {failed && <TriangleAlert className="size-5 text-rose-500" aria-label="Failed" />}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={busy}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Remove ${item.file.name} from the upload list`}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {busy && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                'h-full rounded-full bg-brand-600 transition-[width] duration-300',
                item.status === 'processing' && 'w-full animate-pulse',
              )}
              style={
                item.status === 'processing'
                  ? undefined
                  : { width: `${Math.max(item.progress, 4)}%` }
              }
            />
          </div>
        </div>
      )}

      {finished && item.result && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-700">
          {formatNumber(item.result.totalPages)} pages ·{' '}
          {formatNumber(item.result.totalChunks)} chunks indexed
        </p>
      )}

      {failed && item.error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-2.5 py-2 text-xs leading-relaxed text-rose-700">
          {item.error}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <label
            htmlFor={`${fieldId}-title`}
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Document title
          </label>
          <input
            id={`${fieldId}-title`}
            type="text"
            value={item.title}
            onChange={(event) => onUpdate(item.id, { title: event.target.value })}
            maxLength={200}
            placeholder={`Title for file ${index + 1}`}
            disabled={busy || finished}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-category`}
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Category
          </label>
          <select
            id={`${fieldId}-category`}
            value={item.category}
            onChange={(event) => onUpdate(item.id, { category: event.target.value })}
            disabled={busy || finished}
            className={inputClass}
          >
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-year`}
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Academic year
          </label>
          <select
            id={`${fieldId}-year`}
            value={item.academicYear}
            onChange={(event) => onUpdate(item.id, { academicYear: event.target.value })}
            disabled={busy || finished}
            className={inputClass}
          >
            <option value="">Not specified</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </li>
  );
}

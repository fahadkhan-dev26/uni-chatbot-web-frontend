import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Loader2, TriangleAlert } from 'lucide-react';
import Button from '../common/Button';
import FileDropzone from './FileDropzone';
import Modal from './Modal';
import {
  DOCUMENT_CATEGORIES,
  getAcademicYearOptions,
} from '../../constants/documents';
import { documentService } from '../../services/documentService';
import { formatFileSize } from '../../utils/format';
import { cn } from '../../utils/cn';

const YEARS = getAcademicYearOptions();

const inputClass =
  'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

export default function ReplaceDocumentDialog({ document, onClose, onReplaced }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(document?.title ?? '');
  const [category, setCategory] = useState(
    document?.category ?? 'general-information',
  );
  const [academicYear, setAcademicYear] = useState(document?.academicYear ?? '');
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [originalRemoved, setOriginalRemoved] = useState(false);

  const busy = stage !== 'idle';
  const sameName = Boolean(file && document && file.name === document.filename);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!document || busy) return;

    if (!file) {
      setError('Choose the replacement PDF first.');
      return;
    }
    if (!title.trim()) {
      setError('Enter a title for the replacement document.');
      return;
    }

    setError('');
    let removedOriginal = originalRemoved;

    try {
      if (sameName && !removedOriginal) {
        setStage('deleting');
        await documentService.remove(document._id);
        removedOriginal = true;
        setOriginalRemoved(true);
      }

      setStage('uploading');
      setProgress(0);

      const { data } = await documentService.upload({
        files: [file],
        titles: [title.trim()],
        categories: [category],
        academicYears: [academicYear],
        onUploadProgress: (event) => {
          const percent = event.total
            ? Math.round((event.loaded / event.total) * 100)
            : 0;
          setProgress(percent);
          if (percent >= 100) setStage('processing');
        },
      });

      const result = data?.results?.[0];
      if (!result || result.error || result.processingStatus === 'failed') {
        throw new Error(
          result?.error || 'The replacement document could not be processed.',
        );
      }

      if (!sameName && !removedOriginal) {
        setStage('deleting');
        try {
          await documentService.remove(document._id);
        } catch (deleteError) {
          toast.error(
            deleteError.friendlyMessage ||
              'The new file was uploaded, but the previous document could not be removed.',
          );
          onReplaced?.();
          onClose();
          return;
        }
      }

      toast.success(`"${result.title || title.trim()}" replaced the previous document.`);
      onReplaced?.();
      onClose();
    } catch (uploadError) {
      const apiMessage = uploadError.response?.data?.results?.[0]?.error;
      setError(
        apiMessage ||
          uploadError.friendlyMessage ||
          uploadError.message ||
          'The replacement failed. Please try again.',
      );
      setProgress(0);
      setStage('idle');
    }
  };

  const stageLabel =
    stage === 'deleting'
      ? 'Updating the document library…'
      : stage === 'processing'
        ? 'Processing the new PDF on the server…'
        : `Uploading ${progress}%…`;

  return (
    <Modal
      open={Boolean(document)}
      onClose={onClose}
      title="Replace document"
      description="Upload a new PDF. The replacement is processed before it replaces the current document."
      size="lg"
      busy={busy}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="replace-document-form"
            disabled={busy || !file}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? 'Replacing…' : 'Replace document'}
          </Button>
        </>
      }
    >
      {document && (
        <form id="replace-document-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
              <FileText className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {document.title}
              </p>
              <p className="truncate font-mono text-[11px] text-slate-500">
                {document.filename}
              </p>
            </div>
          </div>

          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2.5">
              <FileText className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={busy}
              >
                Change
              </Button>
            </div>
          ) : (
            <FileDropzone
              multiple={false}
              onFiles={(files) => {
                setFile(files[0] ?? null);
                setError('');
              }}
              disabled={busy}
              compact
            />
          )}

          {sameName && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-xs leading-relaxed">
                This file has the same name as the current document. The original
                will be removed first to free the filename; if the upload then
                fails, you can retry from this dialog.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="replace-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Document title
            </label>
            <input
              id="replace-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              disabled={busy}
              className={cn(inputClass, 'disabled:bg-slate-50 disabled:text-slate-500')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="replace-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="replace-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={busy}
                className={inputClass}
              >
                {DOCUMENT_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="replace-year" className="mb-1.5 block text-sm font-medium text-slate-700">
                Academic year <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <select
                id="replace-year"
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                disabled={busy}
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

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {busy && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>{stageLabel}</span>
                {stage !== 'deleting' && <span>{progress}%</span>}
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    'h-full rounded-full bg-brand-600 transition-[width] duration-300',
                    stage === 'deleting' && 'w-full animate-pulse',
                  )}
                  style={stage === 'deleting' ? undefined : { width: `${Math.max(progress, 4)}%` }}
                />
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

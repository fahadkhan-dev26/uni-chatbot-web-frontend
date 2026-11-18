import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CircleCheck,
  Files,
  Info,
  Loader2,
  TriangleAlert,
  UploadCloud,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FileDropzone from '../../components/admin/FileDropzone';
import PageHeader from '../../components/admin/PageHeader';
import UploadFileRow from '../../components/admin/UploadFileRow';
import { documentService } from '../../services/documentService';
import {
  CATEGORY_MAP,
  MAX_UPLOAD_FILES,
} from '../../constants/documents';
import { cn } from '../../utils/cn';

const createItemId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const emptyItem = (file, category) => ({
  id: createItemId(),
  file,
  title: file.name.replace(/\.pdf$/i, ''),
  category,
  academicYear: '',
  status: 'ready',
  progress: 0,
  result: null,
  error: '',
});

export default function UploadDocuments() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const defaultCategory = CATEGORY_MAP[categoryParam]
    ? categoryParam
    : 'general-information';

  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);

  const isUploading = phase !== 'idle';

  const targetItems = useMemo(
    () => items.filter((item) => item.status === 'ready' || item.status === 'failed'),
    [items],
  );
  const completedCount = items.filter((item) => item.status === 'completed').length;
  const missingTitle = targetItems.some((item) => !item.title.trim());
  const allTargetsFailed =
    targetItems.length > 0 && targetItems.every((item) => item.status === 'failed');
  const canUpload = !isUploading && targetItems.length > 0 && !missingTitle;

  const handleFiles = (acceptedFiles) => {
    const keys = new Set(items.map((item) => `${item.file.name}:${item.file.size}`));
    const unique = acceptedFiles.filter(
      (file) => !keys.has(`${file.name}:${file.size}`),
    );
    const remaining = MAX_UPLOAD_FILES - items.length;

    if (remaining <= 0) {
      toast.error(`You can upload up to ${MAX_UPLOAD_FILES} PDFs at a time.`);
      return;
    }

    if (unique.length > remaining) {
      toast.error(`Only ${remaining} more file(s) can be added to this batch.`);
    }

    const additions = unique
      .slice(0, remaining)
      .map((file) => emptyItem(file, defaultCategory));

    setItems((current) => [...current, ...additions]);
  };

  const updateItem = (id, patch) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const applyResults = (targets, results) => {
    const byFile = new Map((results ?? []).map((result) => [result.file, result]));
    const updates = new Map();
    let uploaded = 0;

    for (const item of targets) {
      const result = byFile.get(item.file.name);

      if (result && !result.error && result.processingStatus !== 'failed') {
        uploaded += 1;
        updates.set(item.id, {
          status: 'completed',
          progress: 100,
          error: '',
          result,
        });
      } else {
        updates.set(item.id, {
          status: 'failed',
          progress: 0,
          error:
            result?.error ||
            (result
              ? 'The server could not process this PDF.'
              : 'The server did not return a result for this file.'),
        });
      }
    }

    setItems((current) =>
      current.map((item) =>
        updates.has(item.id) ? { ...item, ...updates.get(item.id) } : item,
      ),
    );

    return uploaded;
  };

  const handleUpload = async () => {
    if (isUploading) return;
    if (targetItems.length === 0) {
      toast.error('Add at least one PDF to upload.');
      return;
    }
    if (missingTitle) {
      toast.error('Every file needs a document title.');
      return;
    }

    const targets = targetItems;
    const ids = new Set(targets.map((item) => item.id));

    setPhase('uploading');
    setProgress(0);
    setSummary(null);
    setItems((current) =>
      current.map((item) =>
        ids.has(item.id)
          ? { ...item, status: 'uploading', progress: 0, error: '', result: null }
          : item,
      ),
    );

    try {
      const { data } = await documentService.upload({
        files: targets.map((item) => item.file),
        titles: targets.map((item) => item.title.trim()),
        categories: targets.map((item) => item.category),
        academicYears: targets.map((item) => item.academicYear),
        onUploadProgress: (event) => {
          const percent = event.total
            ? Math.round((event.loaded / event.total) * 100)
            : 0;

          setProgress(percent);
          if (percent >= 100) setPhase('processing');

          setItems((current) =>
            current.map((item) =>
              ids.has(item.id)
                ? {
                    ...item,
                    progress: percent,
                    status: percent >= 100 ? 'processing' : 'uploading',
                  }
                : item,
            ),
          );
        },
      });

      const uploaded = applyResults(targets, data.results);
      const failed = targets.length - uploaded;
      setSummary({ uploaded, failed, total: targets.length });

      if (failed === 0) {
        toast.success(
          `${uploaded} document${uploaded === 1 ? '' : 's'} uploaded and processed.`,
        );
      } else if (uploaded === 0) {
        toast.error('None of the files could be uploaded. Review the errors below.');
      } else {
        toast.error(`${uploaded} uploaded, ${failed} failed. Review the errors below.`);
      }
    } catch (error) {
      const results = error.response?.data?.results;

      if (Array.isArray(results) && results.length > 0) {
        const uploaded = applyResults(targets, results);
        const failed = targets.length - uploaded;
        setSummary({ uploaded, failed, total: targets.length });
        toast.error(
          uploaded === 0
            ? 'None of the files could be uploaded.'
            : `${uploaded} uploaded, ${failed} failed.`,
        );
      } else {
        const message =
          error.friendlyMessage || 'The upload failed. Please try again.';

        setItems((current) =>
          current.map((item) =>
            ids.has(item.id)
              ? { ...item, status: 'failed', progress: 0, error: message }
              : item,
          ),
        );
        setSummary({ uploaded: 0, failed: targets.length, total: targets.length });
        toast.error(message);
      }
    } finally {
      setPhase('idle');
    }
  };

  const handleReset = () => {
    if (isUploading) return;
    setItems([]);
    setSummary(null);
    setProgress(0);
  };

  const summaryTitle =
    summary?.failed === 0
      ? 'All documents processed'
      : summary?.uploaded === 0
        ? 'Upload needs attention'
        : 'Some documents need attention';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Upload documents"
        description="Add official university PDFs to the knowledge base. Each file is extracted, chunked and embedded before students can cite it."
        actions={
          <Button as={Link} to="/admin/documents" variant="secondary" size="sm">
            <Files className="size-4" />
            Back to documents
          </Button>
        }
      />

      {summary && (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between',
            summary.failed > 0
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50',
          )}
          role="status"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                summary.failed > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700',
              )}
            >
              {summary.failed > 0 ? (
                <TriangleAlert className="size-5" aria-hidden="true" />
              ) : (
                <CircleCheck className="size-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {summaryTitle}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {summary.uploaded} of {summary.total} uploaded and indexed
                {summary.failed > 0
                  ? ` · ${summary.failed} failed. Fix the metadata or file and retry.`
                  : '.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={isUploading}
            >
              New batch
            </Button>
            <Button as={Link} to="/admin/documents" size="sm">
              View documents
            </Button>
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Select PDF files
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Drag files in or browse. Up to {MAX_UPLOAD_FILES} PDFs per batch.
            </p>
          </div>
          {items.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {items.length}/{MAX_UPLOAD_FILES} selected
            </span>
          )}
        </div>

        <div className="mt-4">
          <FileDropzone
            onFiles={handleFiles}
            disabled={isUploading || items.length >= MAX_UPLOAD_FILES}
          />
        </div>

        {items.length > 0 && (
          <ul className="mt-4 space-y-3">
            {items.map((item, index) => (
              <UploadFileRow
                key={item.id}
                item={item}
                index={index}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </ul>
        )}
      </Card>

      {items.length > 0 && (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              {targetItems.length > 0
                ? `${targetItems.length} file${targetItems.length === 1 ? '' : 's'} ready to upload`
                : 'All files processed'}
              {completedCount > 0 && (
                <span className="font-normal text-slate-500">
                  {' '}
                  · {completedCount} completed
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Descriptions and academic years are sent with each file.
            </p>
            {missingTitle && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                Add a document title to every file before uploading.
              </p>
            )}

            {isUploading && (
              <div className="mt-3 max-w-md">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>
                    {phase === 'processing'
                      ? 'Processing documents on the server…'
                      : `Uploading… ${progress}%`}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={cn(
                      'h-full rounded-full bg-brand-600 transition-[width] duration-300',
                      phase === 'processing' && 'w-full animate-pulse',
                    )}
                    style={
                      phase === 'processing'
                        ? undefined
                        : { width: `${Math.max(progress, 4)}%` }
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {completedCount > 0 && (
              <Button as={Link} to="/admin/documents" variant="secondary">
                View documents
              </Button>
            )}
            {targetItems.length > 0 && (
              <Button type="button" onClick={handleUpload} disabled={!canUpload}>
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {phase === 'processing' ? 'Processing…' : 'Uploading…'}
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    {allTargetsFailed
                      ? `Retry ${targetItems.length} failed`
                      : `Upload ${targetItems.length} file${targetItems.length === 1 ? '' : 's'}`}
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-600">
          Processing runs on the server after the file is uploaded. Image-only or
          scanned PDFs without selectable text cannot be indexed and will show a
          processing error; replace them with text-based PDFs and retry.
        </p>
      </div>
    </div>
  );
}

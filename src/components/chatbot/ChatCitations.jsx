import { FileText } from 'lucide-react';

export default function ChatCitations({ sources }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <FileText className="size-3.5" />
        Sources
      </p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <li
            key={`${source.documentTitle}-${source.pageNumber}-${index}`}
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
          >
            <span
              className="min-w-0 font-medium text-slate-700 sm:truncate"
              title={source.documentTitle}
            >
              {source.documentTitle}
            </span>
            <span className="shrink-0 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand-700">
              p. {source.pageNumber}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

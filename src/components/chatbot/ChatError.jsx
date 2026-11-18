import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';

export default function ChatError({
  variant = 'inline',
  message,
  onRetry,
  onNewChat,
}) {
  if (variant === 'page') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          We couldn’t load this conversation
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus className="size-4" />
              New chat
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mx-auto mb-3 flex w-full max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
      >
        <RefreshCw className="size-3.5" />
        Try again
      </button>
    </div>
  );
}

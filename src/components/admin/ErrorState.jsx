import { RefreshCw, TriangleAlert } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

export default function ErrorState({
  title = 'Could not load data',
  message,
  onRetry,
  action,
}) {
  return (
    <Card className="border-rose-200">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-slate-600">
            {message}
          </p>
          {(onRetry || action) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onRetry && (
                <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              )}
              {action}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

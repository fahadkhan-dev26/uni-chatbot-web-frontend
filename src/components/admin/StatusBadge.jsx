import { Loader2 } from 'lucide-react';
import { getProcessingStatus } from '../../constants/documents';
import { cn } from '../../utils/cn';

const TONES = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const DOTS = {
  slate: 'bg-slate-400',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

export default function StatusBadge({ status, className }) {
  const meta = getProcessingStatus(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[meta.tone] ?? TONES.slate,
        className,
      )}
    >
      {status === 'processing' ? (
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <span
          className={cn('size-1.5 rounded-full', DOTS[meta.tone] ?? DOTS.slate)}
          aria-hidden="true"
        />
      )}
      {meta.label}
    </span>
  );
}

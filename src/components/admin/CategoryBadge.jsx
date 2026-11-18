import { getCategoryMeta } from '../../constants/documents';
import { cn } from '../../utils/cn';

const TONES = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function CategoryBadge({ value, className }) {
  const category = getCategoryMeta(value);

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[category.tone] ?? TONES.slate,
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
      <span className="truncate">{category.label}</span>
    </span>
  );
}

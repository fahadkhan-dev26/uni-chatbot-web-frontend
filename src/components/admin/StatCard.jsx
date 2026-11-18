import Card from '../common/Card';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  loading = false,
}) {
  return (
    <Card className="p-4 sm:p-5">
      <span
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-xl',
          TONES[tone] ?? TONES.brand,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="mt-4">
        {loading ? (
          <span className="block h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-slate-900">
            {formatNumber(value)}
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  );
}

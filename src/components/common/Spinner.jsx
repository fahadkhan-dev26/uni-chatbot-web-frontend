import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Spinner({ className, label = 'Loading' }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

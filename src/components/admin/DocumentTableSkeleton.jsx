export default function DocumentTableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <span className="size-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
          <span className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          <span className="hidden h-4 w-32 animate-pulse rounded bg-slate-100 md:block" />
          <span className="ml-auto hidden h-6 w-24 animate-pulse rounded-full bg-slate-100 sm:block" />
          <span className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

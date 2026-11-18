import { ChevronDown, FilterX, Search, X } from 'lucide-react';
import {
  DOCUMENT_CATEGORIES,
  PROCESSING_STATUS_MAP,
} from '../../constants/documents';
import Button from '../common/Button';

const controlClass =
  'h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-700 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Select({ label, value, onChange, children }) {
  return (
    <div className="relative min-w-0">
      <select value={value} onChange={onChange} className={controlClass} aria-label={label}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}

export default function DocumentFilters({
  filters,
  years,
  onChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="border-b border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            inputMode="search"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search by title or filename…"
            aria-label="Search documents"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChange({ query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[32rem]">
          <Select
            label="Filter by category"
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            <option value="all">All categories</option>
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>

          <Select
            label="Filter by academic year"
            value={filters.academicYear}
            onChange={(event) => onChange({ academicYear: event.target.value })}
          >
            <option value="all">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>

          <Select
            label="Filter by processing status"
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
          >
            <option value="all">All statuses</option>
            {Object.entries(PROCESSING_STATUS_MAP).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="justify-start text-slate-500 lg:justify-center"
          >
            <FilterX className="size-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

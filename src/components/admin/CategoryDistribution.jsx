import { FolderTree } from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import EmptyState from './EmptyState';

const COLORS = [
  '#2150d6',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#f43f5e',
  '#06b6d4',
  '#6366f1',
  '#f97316',
  '#64748b',
];

export default function CategoryDistribution({ categories, totalDocuments }) {
  const rows = [...categories]
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No distribution to show"
        description="Upload and process documents to see how the library is spread across categories."
        className="border-0 bg-transparent py-10"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="count"
              nameKey="label"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {rows.map((row, index) => (
                <Cell key={row.value} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                boxShadow: '0 10px 30px -12px rgb(15 23 42 / 0.18)',
              }}
              formatter={(value) => [value, 'Documents']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            {totalDocuments}
          </span>
          <span className="text-xs text-slate-500">documents</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {rows.map((row, index) => (
          <li key={row.value} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-slate-600">{row.label}</span>
            <span className="font-medium text-slate-900">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

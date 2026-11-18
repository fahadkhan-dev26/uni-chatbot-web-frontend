import { FolderTree } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from './EmptyState';

export default function CategoryChart({ categories }) {
  const rows = [...categories]
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((category) => ({ name: category.label, count: category.count }));

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No category data yet"
        description="Category statistics appear as soon as documents are processed."
        className="border-0 bg-transparent py-10"
      />
    );
  }

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Documents by category: ${rows
        .map((row) => `${row.name}, ${row.count}`)
        .join('; ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={168}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#334155' }}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              boxShadow: '0 10px 30px -12px rgb(15 23 42 / 0.18)',
            }}
            formatter={(value) => [value, 'Documents']}
          />
          <Bar dataKey="count" fill="#2150d6" radius={[0, 6, 6, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

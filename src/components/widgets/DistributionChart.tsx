'use client';

import { cn } from '@/lib/utils';

interface DistributionItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface DistributionChartProps {
  title: string;
  items: DistributionItem[];
  onItemClick?: (key: string) => void;
  activeKey?: string | null;
}

export function DistributionChart({
  title,
  items,
  onItemClick,
  activeKey,
}: DistributionChartProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...items.map(item => item.count));

  return (
    <div className="widget-card">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const isActive = activeKey === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onItemClick?.(item.key)}
              className={cn(
                'w-full text-left group transition-all duration-200',
                onItemClick && 'cursor-pointer hover:bg-zinc-800/50 -mx-2 px-2 py-1 rounded-lg',
                isActive && 'bg-zinc-800/70'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-orange-400' : 'text-zinc-300'
                )}>
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">{item.count}</span>
                  <span className="text-xs text-zinc-500">
                    ({percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                  )}
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {total === 0 && (
        <p className="text-sm text-zinc-500 text-center py-4">No data available</p>
      )}
    </div>
  );
}

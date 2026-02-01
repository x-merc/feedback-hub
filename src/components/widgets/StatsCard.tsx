'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'text-zinc-100',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  };

  const iconBgStyles = {
    default: 'bg-zinc-800',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    danger: 'bg-red-500/10',
  };

  return (
    <div className="widget-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', variantStyles[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBgStyles[variant])}>
          <Icon className={cn('w-5 h-5', variantStyles[variant])} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-zinc-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

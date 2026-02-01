'use client';

import { cn } from '@/lib/utils';

interface SentimentGaugeProps {
  score: number;
  label?: string;
}

export function SentimentGauge({ score, label }: SentimentGaugeProps) {
  const normalizedScore = Math.max(-1, Math.min(1, score));
  const percentage = ((normalizedScore + 1) / 2) * 100;
  
  const getSentimentColor = () => {
    if (normalizedScore > 0.3) return 'text-emerald-400';
    if (normalizedScore < -0.3) return 'text-red-400';
    return 'text-amber-400';
  };

  const getSentimentLabel = () => {
    if (normalizedScore > 0.3) return 'Positive';
    if (normalizedScore < -0.3) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="widget-card">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        {label || 'Average Sentiment'}
      </h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#27272a"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={`${percentage * 2.51} 251`}
              className={cn('transition-all duration-500', getSentimentColor())}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-2xl font-bold', getSentimentColor())}>
              {(normalizedScore * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-zinc-500">{getSentimentLabel()}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-xs text-zinc-500">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
      <div className="mt-1 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full opacity-50" />
    </div>
  );
}

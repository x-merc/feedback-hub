'use client';

import { useState } from 'react';
import { DailyBrief as DailyBriefType, Ticket } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Shield,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Calendar,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';

interface DailyBriefProps {
  brief: DailyBriefType | null;
  isLoading: boolean;
  onRefresh: () => void;
  selectedDate: Date;
}

const riskColors = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

const priorityColors = {
  low: 'text-zinc-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
};

export function DailyBriefPanel({ brief, isLoading, onRefresh, selectedDate }: DailyBriefProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="widget-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
            <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Generating Brief...</h2>
            <p className="text-sm text-zinc-500">Analyzing feedback with AI</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="widget-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Customer Reality Brief</h2>
              <p className="text-sm text-zinc-500">No data for selected period</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>
    );
  }

  const risk = riskColors[brief.businessRisk.level];

  return (
    <div className="widget-card mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Customer Reality Brief</h2>
            <p className="text-sm text-zinc-500">
              {formatDate(selectedDate)} • {brief.ticketCount} tickets analyzed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh brief"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight
              className={cn(
                'w-4 h-4 text-zinc-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">Avg Sentiment</span>
              </div>
              <p className={cn(
                'text-lg font-semibold',
                brief.keyMetrics.avgSentiment >= 0.5 ? 'text-emerald-400' :
                brief.keyMetrics.avgSentiment >= 0 ? 'text-amber-400' : 'text-red-400'
              )}>
                {(brief.keyMetrics.avgSentiment * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">Critical</span>
              </div>
              <p className="text-lg font-semibold text-red-400">{brief.keyMetrics.criticalCount}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">Top Source</span>
              </div>
              <p className="text-lg font-semibold text-zinc-200 capitalize">{brief.keyMetrics.topSource}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">Top Category</span>
              </div>
              <p className="text-lg font-semibold text-zinc-200 capitalize">
                {brief.keyMetrics.topCategory.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Main Insights Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Issue */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Top Issue</span>
                <span className="text-xs text-zinc-500 ml-auto">
                  {brief.topIssue.ticketCount} tickets
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">
                {brief.topIssue.title}
              </h3>
              <p className="text-sm text-zinc-400">{brief.topIssue.description}</p>
            </div>

            {/* Who's Affected */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Who&apos;s Affected</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                {brief.affectedSegment.description}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {brief.affectedSegment.details.map((detail, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>

            {/* Emotion Trend */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">Emotion Trend</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-sm rounded">
                  {brief.emotionTrend.from}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
                <span className={cn(
                  'px-2 py-1 text-sm rounded',
                  brief.emotionTrend.to.toLowerCase().includes('frustrat') 
                    ? 'bg-red-500/20 text-red-400'
                    : brief.emotionTrend.to.toLowerCase().includes('satisf')
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                )}>
                  {brief.emotionTrend.to}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{brief.emotionTrend.description}</p>
            </div>

            {/* Business Risk */}
            <div className={cn(
              'rounded-lg p-4 border',
              risk.bg,
              risk.border
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={cn('w-4 h-4', risk.text)} />
                <span className={cn('text-sm font-medium', risk.text)}>Business Risk</span>
                <span className={cn(
                  'ml-auto px-2 py-0.5 rounded text-xs font-medium uppercase',
                  risk.bg,
                  risk.text
                )}>
                  {brief.businessRisk.level}
                </span>
              </div>
              <p className="text-sm text-zinc-300 mb-2">{brief.businessRisk.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {brief.businessRisk.signals.map((signal, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-900/50 text-zinc-400 text-xs rounded"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Suggested PM Actions</span>
            </div>
            <div className="space-y-2">
              {brief.suggestedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 bg-zinc-900/30 rounded-lg"
                >
                  <span className={cn(
                    'mt-0.5 w-2 h-2 rounded-full flex-shrink-0',
                    action.priority === 'high' ? 'bg-orange-400' :
                    action.priority === 'medium' ? 'bg-amber-400' : 'bg-zinc-500'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{action.title}</p>
                    <p className="text-xs text-zinc-500">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

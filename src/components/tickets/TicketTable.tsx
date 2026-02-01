'use client';

import { Ticket } from '@/lib/types';
import { cn, formatDate, sourceLabels, categoryLabels, urgencyLabels } from '@/lib/utils';
import { ChevronRight, MessageSquare } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  selectedTicketId?: string | null;
}

export function TicketTable({ tickets, onTicketClick, selectedTicketId }: TicketTableProps) {
  const getSentimentIcon = (sentiment: string, score: number) => {
    const absScore = Math.abs(score);
    if (sentiment === 'positive') return { emoji: '😊', color: 'text-emerald-400' };
    if (sentiment === 'negative') {
      if (absScore > 0.7) return { emoji: '😠', color: 'text-red-400' };
      return { emoji: '😕', color: 'text-orange-400' };
    }
    return { emoji: '😐', color: 'text-zinc-400' };
  };

  if (tickets.length === 0) {
    return (
      <div className="widget-card text-center py-12">
        <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">No tickets match your filters</p>
        <p className="text-sm text-zinc-500 mt-1">Try adjusting your filter criteria</p>
      </div>
    );
  }

  return (
    <div className="widget-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Ticket
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Source
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Category
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Sentiment
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Urgency
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
                Created
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tickets.map((ticket) => {
              const sentimentInfo = getSentimentIcon(ticket.sentiment, ticket.sentiment_score);
              const isSelected = selectedTicketId === ticket.id;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-orange-500/10'
                      : 'hover:bg-zinc-800/50'
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="max-w-md">
                      <p className={cn(
                        'font-medium truncate',
                        isSelected ? 'text-orange-400' : 'text-zinc-200'
                      )}>
                        {ticket.title}
                      </p>
                      <p className="text-sm text-zinc-500 truncate mt-0.5">
                        {ticket.customer_name || 'Anonymous'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`source-badge source-${ticket.source}`}>
                      {sourceLabels[ticket.source]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`category-badge category-${ticket.category}`}>
                      {categoryLabels[ticket.category]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={sentimentInfo.color}>{sentimentInfo.emoji}</span>
                      <span className={cn('text-sm', sentimentInfo.color)}>
                        {(ticket.sentiment_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-md text-xs font-medium',
                      `urgency-${ticket.urgency}`
                    )}>
                      {urgencyLabels[ticket.urgency]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-zinc-400">
                      {formatDate(ticket.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className={cn(
                      'w-5 h-5 transition-colors',
                      isSelected ? 'text-orange-400' : 'text-zinc-600'
                    )} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

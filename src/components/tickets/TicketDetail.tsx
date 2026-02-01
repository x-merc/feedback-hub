'use client';

import { Ticket, RelatedTicket } from '@/lib/types';
import { cn, formatDate, sourceLabels, categoryLabels, urgencyLabels, frictionPointLabels } from '@/lib/utils';
import { X, User, Mail, Clock, Tag, Sparkles, Link2 } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  relatedTickets?: RelatedTicket[];
  onClose: () => void;
  onRelatedClick?: (ticket: Ticket) => void;
}

export function TicketDetail({
  ticket,
  relatedTickets = [],
  onClose,
  onRelatedClick,
}: TicketDetailProps) {
  const getSentimentColor = () => {
    if (ticket.sentiment === 'positive') return 'text-emerald-400';
    if (ticket.sentiment === 'negative') return 'text-red-400';
    return 'text-amber-400';
  };

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-lg font-semibold text-zinc-100 truncate">
            {ticket.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`source-badge source-${ticket.source}`}>
              {sourceLabels[ticket.source]}
            </span>
            <span className={`category-badge category-${ticket.category}`}>
              {categoryLabels[ticket.category]}
            </span>
            <span className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              `urgency-${ticket.urgency}`
            )}>
              {urgencyLabels[ticket.urgency]}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* AI Synopsis */}
        {ticket.ai_synopsis && (
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">AI Synopsis</span>
            </div>
            <p className="text-sm text-zinc-300">{ticket.ai_synopsis}</p>
          </div>
        )}

        {/* Customer Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">Customer</h3>
          <div className="flex items-center gap-4">
            {ticket.customer_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">{ticket.customer_name}</span>
              </div>
            )}
            {ticket.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">{ticket.customer_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">Feedback</h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {ticket.content}
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">Sentiment</span>
            <p className={cn('text-sm font-medium', getSentimentColor())}>
              {ticket.sentiment.charAt(0).toUpperCase() + ticket.sentiment.slice(1)}
              <span className="text-zinc-500 ml-1">
                ({(ticket.sentiment_score * 100).toFixed(0)}%)
              </span>
            </p>
          </div>
          {ticket.friction_point && (
            <div className="space-y-1">
              <span className="text-xs text-zinc-500">Friction Point</span>
              <p className="text-sm text-zinc-300">
                {frictionPointLabels[ticket.friction_point]}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">Status</span>
            <p className="text-sm text-zinc-300 capitalize">{ticket.status.replace('_', ' ')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">Created</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <p className="text-sm text-zinc-300">{formatDate(ticket.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-medium text-zinc-400">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Tickets */}
        {relatedTickets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-medium text-zinc-400">Related Tickets</h3>
            </div>
            <div className="space-y-2">
              {relatedTickets.map(({ ticket: related, similarity_score }) => (
                <button
                  key={related.id}
                  onClick={() => onRelatedClick?.(related)}
                  className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-300 truncate">
                        {related.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`source-badge source-${related.source}`}>
                          {sourceLabels[related.source]}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatDate(related.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 ml-2">
                      {(similarity_score * 100).toFixed(0)}% match
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Ticket, FilterState, DashboardStats, AlertRule, DailyBrief } from '@/lib/types';
import { mockTickets, calculateStats } from '@/lib/mock-data';
import { sourceLabels, categoryLabels, frictionPointLabels, sentimentLabels, urgencyLabels } from '@/lib/utils';
import { StatsCard } from './widgets/StatsCard';
import { DistributionChart } from './widgets/DistributionChart';
import { SentimentGauge } from './widgets/SentimentGauge';
import { TicketTable } from './tickets/TicketTable';
import { TicketDetail } from './tickets/TicketDetail';
import { AlertConfigPanel } from './alerts/AlertConfigPanel';
import { DailyBriefPanel } from './brief/DailyBrief';
import { DatePicker } from './brief/DatePicker';
import { 
  MessageSquare, 
  AlertCircle, 
  TrendingUp, 
  Inbox,
  X,
  Search,
  RefreshCw
} from 'lucide-react';

const sourceColors: Record<string, string> = {
  support: '#3b82f6',
  discord: '#6366f1',
  github: '#71717a',
  email: '#f59e0b',
  twitter: '#0ea5e9',
  forum: '#a855f7',
  other: '#52525b',
};

const categoryColors: Record<string, string> = {
  bug: '#ef4444',
  feature_request: '#10b981',
  ui_ux: '#8b5cf6',
  performance: '#f97316',
  documentation: '#3b82f6',
  question: '#06b6d4',
  other: '#71717a',
};

const sentimentColors: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#f59e0b',
};

const urgencyColors: Record<string, string> = {
  low: '#71717a',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const frictionColors: Record<string, string> = {
  ui_ux: '#8b5cf6',
  performance: '#f97316',
  missing_feature: '#10b981',
  confusing_docs: '#3b82f6',
  onboarding: '#ec4899',
  pricing: '#eab308',
  integration: '#06b6d4',
  other: '#71717a',
};

export function Dashboard() {
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const stats: DashboardStats = useMemo(() => calculateStats(tickets), [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.source && ticket.source !== filters.source) return false;
      if (filters.category && ticket.category !== filters.category) return false;
      if (filters.sentiment && ticket.sentiment !== filters.sentiment) return false;
      if (filters.urgency && ticket.urgency !== filters.urgency) return false;
      if (filters.friction_point && ticket.friction_point !== filters.friction_point) return false;
      if (filters.status && ticket.status !== filters.status) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ticket.title.toLowerCase().includes(query) ||
          ticket.content.toLowerCase().includes(query) ||
          ticket.customer_name?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tickets, filters, searchQuery]);

  const handleSaveAlertRule = (rule: AlertRule) => {
    setAlertRules(prev => {
      const existing = prev.findIndex(r => r.id === rule.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = rule;
        return updated;
      }
      return [...prev, rule];
    });
  };

  const handleDeleteAlertRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleToggleAlertRule = (ruleId: string, enabled: boolean) => {
    setAlertRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled } : r
    ));
  };

  const generateMockBrief = (): DailyBrief => {
    // Generate a mock brief based on current tickets for demo purposes
    const dateTickets = tickets.filter(t => {
      const tDate = new Date(t.created_at).toDateString();
      return tDate === selectedDate.toDateString();
    });
    
    const avgSentiment = dateTickets.length > 0 
      ? dateTickets.reduce((sum: number, t: Ticket) => sum + t.sentiment_score, 0) / dateTickets.length
      : 0;
    
    const criticalCount = dateTickets.filter((t: Ticket) => t.urgency === 'critical').length;
    
    const sourceCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    dateTickets.forEach((t: Ticket) => {
      sourceCounts[t.source] = (sourceCounts[t.source] || 0) + 1;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'support';
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'bug';
    
    return {
      date: selectedDate.toISOString().split('T')[0],
      period: 'Last 24 hours',
      ticketCount: dateTickets.length || tickets.length,
      topIssue: {
        title: 'Rate limiting false positives',
        description: 'Users reporting legitimate requests being blocked by security rules',
        ticketCount: 5,
      },
      affectedSegment: {
        description: 'Small SaaS on Free/Pro plans',
        details: ['API-heavy workloads', 'New signups', 'High-traffic periods'],
      },
      emotionTrend: {
        from: 'Confusion',
        to: 'Frustration',
        description: 'Users start confused, escalate to frustration after multiple occurrences',
      },
      businessRisk: {
        level: criticalCount > 2 ? 'high' : criticalCount > 0 ? 'medium' : 'low',
        description: 'Support load increasing + early churn signals detected',
        signals: ['Support ticket volume +40%', 'NPS mentions', 'Twitter complaints'],
      },
      suggestedActions: [
        {
          title: 'Improve rate limit documentation',
          description: 'Add clearer examples and troubleshooting guides',
          priority: 'high',
        },
        {
          title: 'Expose rule simulator in dashboard',
          description: 'Let users test rules before deploying',
          priority: 'high',
        },
        {
          title: 'Add proactive alerting',
          description: 'Notify users before they hit limits',
          priority: 'medium',
        },
      ],
      keyMetrics: {
        avgSentiment: avgSentiment || 0.35,
        criticalCount: criticalCount || 2,
        topSource,
        topCategory,
      },
    };
  };

  const handleRefreshBrief = () => {
    setIsBriefLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setDailyBrief(generateMockBrief());
      setIsBriefLoading(false);
    }, 1500);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setDailyBrief(null);
    // Auto-generate brief for new date
    setIsBriefLoading(true);
    setTimeout(() => {
      setDailyBrief(generateMockBrief());
      setIsBriefLoading(false);
    }, 1000);
  };

  // Generate initial brief on mount
  useState(() => {
    handleRefreshBrief();
  });

  const handleFilterClick = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      if (prev[filterType] === value) {
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      }
      return { ...prev, [filterType]: value };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  const sourceItems = Object.entries(stats.by_source)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: sourceLabels[key] || key,
      count,
      color: sourceColors[key] || '#71717a',
    }));

  const categoryItems = Object.entries(stats.by_category)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: categoryLabels[key] || key,
      count,
      color: categoryColors[key] || '#71717a',
    }));

  const sentimentItems = Object.entries(stats.by_sentiment)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: sentimentLabels[key] || key,
      count,
      color: sentimentColors[key] || '#71717a',
    }));

  const urgencyItems = Object.entries(stats.by_urgency)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: urgencyLabels[key] || key,
      count,
      color: urgencyColors[key] || '#71717a',
    }));

  const frictionItems = Object.entries(stats.by_friction_point)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: frictionPointLabels[key] || key,
      count,
      color: frictionColors[key] || '#71717a',
    }));

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Feedback Hub</h1>
              <p className="text-sm text-zinc-500">Product feedback aggregation & analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-64"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
                Sync
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Daily Brief */}
        <div className="flex items-center justify-between mb-4">
          <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
        </div>
        <DailyBriefPanel
          brief={dailyBrief}
          isLoading={isBriefLoading}
          onRefresh={handleRefreshBrief}
          selectedDate={selectedDate}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Tickets"
            value={stats.total_tickets}
            icon={MessageSquare}
            subtitle="All time feedback"
          />
          <StatsCard
            title="Open Tickets"
            value={stats.open_tickets}
            icon={Inbox}
            subtitle="Awaiting response"
            variant="warning"
          />
          <StatsCard
            title="Critical Issues"
            value={stats.critical_tickets}
            icon={AlertCircle}
            subtitle="Needs immediate attention"
            variant="danger"
          />
          <StatsCard
            title="Avg Sentiment"
            value={`${(stats.avg_sentiment * 100).toFixed(0)}%`}
            icon={TrendingUp}
            subtitle={stats.avg_sentiment >= 0 ? 'Leaning positive' : 'Leaning negative'}
            variant={stats.avg_sentiment >= 0 ? 'success' : 'danger'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <DistributionChart
            title="By Source"
            items={sourceItems}
            onItemClick={(key) => handleFilterClick('source', key)}
            activeKey={filters.source}
          />
          <DistributionChart
            title="By Category"
            items={categoryItems}
            onItemClick={(key) => handleFilterClick('category', key)}
            activeKey={filters.category}
          />
          <SentimentGauge score={stats.avg_sentiment} />
          <DistributionChart
            title="By Urgency"
            items={urgencyItems}
            onItemClick={(key) => handleFilterClick('urgency', key)}
            activeKey={filters.urgency}
          />
          <DistributionChart
            title="Friction Points"
            items={frictionItems}
            onItemClick={(key) => handleFilterClick('friction_point', key)}
            activeKey={filters.friction_point}
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-zinc-500">Active filters:</span>
            {filters.source && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Source: {sourceLabels[filters.source]}
              </span>
            )}
            {filters.category && (
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                Category: {categoryLabels[filters.category]}
              </span>
            )}
            {filters.sentiment && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                Sentiment: {sentimentLabels[filters.sentiment]}
              </span>
            )}
            {filters.urgency && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                Urgency: {urgencyLabels[filters.urgency]}
              </span>
            )}
            {filters.friction_point && (
              <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                Friction: {frictionPointLabels[filters.friction_point]}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-xs rounded-full">
                Search: &quot;{searchQuery}&quot;
              </span>
            )}
            <span className="text-sm text-zinc-500 ml-2">
              ({filteredTickets.length} results)
            </span>
          </div>
        )}

        {/* Tickets Section */}
        <div className="grid grid-cols-3 gap-6">
          <div className={selectedTicket ? 'col-span-2' : 'col-span-3'}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">
                Tickets
                <span className="text-zinc-500 font-normal ml-2">
                  ({filteredTickets.length})
                </span>
              </h2>
            </div>
            <TicketTable
              tickets={filteredTickets}
              onTicketClick={setSelectedTicket}
              selectedTicketId={selectedTicket?.id}
            />
          </div>

          {selectedTicket && (
            <div className="col-span-1">
              <TicketDetail
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onRelatedClick={setSelectedTicket}
              />
            </div>
          )}
        </div>
      </main>

      {/* Alert Configuration */}
      <AlertConfigPanel
        rules={alertRules}
        onSaveRule={handleSaveAlertRule}
        onDeleteRule={handleDeleteAlertRule}
        onToggleRule={handleToggleAlertRule}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <p className="text-sm text-zinc-500 text-center">
            Powered by Cloudflare Workers, D1, Workers AI & Vectorize
          </p>
        </div>
      </footer>
    </div>
  );
}

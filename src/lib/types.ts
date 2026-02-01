export type Source = 'support' | 'discord' | 'github' | 'email' | 'twitter' | 'forum' | 'other';
export type Category = 'bug' | 'feature_request' | 'ui_ux' | 'performance' | 'documentation' | 'question' | 'other';
export type FrictionPoint = 'ui_ux' | 'performance' | 'missing_feature' | 'confusing_docs' | 'onboarding' | 'pricing' | 'integration' | 'other' | null;
export type Sentiment = 'positive' | 'negative' | 'neutral';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  title: string;
  content: string;
  source: Source;
  category: Category;
  friction_point: FrictionPoint;
  sentiment: Sentiment;
  sentiment_score: number;
  urgency: Urgency;
  status: Status;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  ai_synopsis?: string;
  embedding_id?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface TicketTag {
  id: number;
  ticket_id: string;
  tag: string;
}

export interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  critical_tickets: number;
  avg_sentiment: number;
  by_source: Record<Source, number>;
  by_category: Record<Category, number>;
  by_sentiment: Record<Sentiment, number>;
  by_urgency: Record<Urgency, number>;
  by_friction_point: Record<string, number>;
  recent_trend: TrendData[];
}

export interface TrendData {
  date: string;
  count: number;
  sentiment_avg: number;
}

export interface FilterState {
  source?: Source;
  category?: Category;
  sentiment?: Sentiment;
  urgency?: Urgency;
  friction_point?: string;
  status?: Status;
  search?: string;
}

export interface RelatedTicket {
  ticket: Ticket;
  similarity_score: number;
}

// Alert types
export type AlertChannel = 'email' | 'slack' | 'discord';
export type AlertFrequency = 'instant' | 'hourly' | 'daily' | 'weekly';
export type ConditionType = 'source' | 'category' | 'sentiment' | 'urgency' | 'friction_point';

export interface AlertCondition {
  id?: number;
  type: ConditionType;
  value: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  channel: AlertChannel;
  channelConfig: EmailConfig | SlackConfig | DiscordConfig;
  frequency: AlertFrequency;
  conditions: AlertCondition[];
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailConfig {
  email: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
}

export interface DiscordConfig {
  webhookUrl: string;
}

export interface DraggableCondition {
  id: string;
  type: ConditionType;
  value: string;
  label: string;
  color: string;
}

// Daily Brief types
export interface DailyBrief {
  date: string;
  period: string;
  ticketCount: number;
  topIssue: {
    title: string;
    description: string;
    ticketCount: number;
  };
  affectedSegment: {
    description: string;
    details: string[];
  };
  emotionTrend: {
    from: string;
    to: string;
    description: string;
  };
  businessRisk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    signals: string[];
  };
  suggestedActions: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  keyMetrics: {
    avgSentiment: number;
    criticalCount: number;
    topSource: string;
    topCategory: string;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatSentimentScore(score: number): string {
  const percentage = Math.abs(score * 100).toFixed(0);
  if (score > 0) return `+${percentage}%`;
  if (score < 0) return `-${percentage}%`;
  return '0%';
}

export const sourceLabels: Record<string, string> = {
  support: 'Support',
  discord: 'Discord',
  github: 'GitHub',
  email: 'Email',
  twitter: 'X/Twitter',
  forum: 'Forum',
  other: 'Other',
};

export const categoryLabels: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  ui_ux: 'UI/UX',
  performance: 'Performance',
  documentation: 'Documentation',
  question: 'Question',
  other: 'Other',
};

export const frictionPointLabels: Record<string, string> = {
  ui_ux: 'UI/UX Issues',
  performance: 'Performance',
  missing_feature: 'Missing Feature',
  confusing_docs: 'Confusing Docs',
  onboarding: 'Onboarding',
  pricing: 'Pricing',
  integration: 'Integration',
  other: 'Other',
};

export const urgencyLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const sentimentLabels: Record<string, string> = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
};

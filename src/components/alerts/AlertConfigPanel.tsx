'use client';

import { useState } from 'react';
import { 
  AlertRule, 
  AlertChannel, 
  AlertFrequency, 
  DraggableCondition,
  ConditionType 
} from '@/lib/types';
import { 
  sourceLabels, 
  categoryLabels, 
  sentimentLabels, 
  urgencyLabels, 
  frictionPointLabels 
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Plus, 
  X, 
  GripVertical,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface AlertConfigPanelProps {
  rules: AlertRule[];
  onSaveRule: (rule: AlertRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
}

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

function getColorForCondition(type: ConditionType, value: string): string {
  switch (type) {
    case 'source': return sourceColors[value] || '#71717a';
    case 'category': return categoryColors[value] || '#71717a';
    case 'sentiment': return sentimentColors[value] || '#71717a';
    case 'urgency': return urgencyColors[value] || '#71717a';
    case 'friction_point': return frictionColors[value] || '#71717a';
    default: return '#71717a';
  }
}

function getLabelForCondition(type: ConditionType, value: string): string {
  switch (type) {
    case 'source': return sourceLabels[value] || value;
    case 'category': return categoryLabels[value] || value;
    case 'sentiment': return sentimentLabels[value] || value;
    case 'urgency': return urgencyLabels[value] || value;
    case 'friction_point': return frictionPointLabels[value] || value;
    default: return value;
  }
}

// Available conditions to drag from
const availableConditions: DraggableCondition[] = [
  // Sources
  ...Object.keys(sourceLabels).map(key => ({
    id: `source-${key}`,
    type: 'source' as ConditionType,
    value: key,
    label: sourceLabels[key],
    color: sourceColors[key],
  })),
  // Categories
  ...Object.keys(categoryLabels).map(key => ({
    id: `category-${key}`,
    type: 'category' as ConditionType,
    value: key,
    label: categoryLabels[key],
    color: categoryColors[key],
  })),
  // Sentiments
  ...Object.keys(sentimentLabels).map(key => ({
    id: `sentiment-${key}`,
    type: 'sentiment' as ConditionType,
    value: key,
    label: sentimentLabels[key],
    color: sentimentColors[key],
  })),
  // Urgencies
  ...Object.keys(urgencyLabels).map(key => ({
    id: `urgency-${key}`,
    type: 'urgency' as ConditionType,
    value: key,
    label: urgencyLabels[key],
    color: urgencyColors[key],
  })),
  // Friction points
  ...Object.keys(frictionPointLabels).map(key => ({
    id: `friction_point-${key}`,
    type: 'friction_point' as ConditionType,
    value: key,
    label: frictionPointLabels[key],
    color: frictionColors[key],
  })),
];

const channelIcons: Record<AlertChannel, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  slack: <MessageSquare className="w-4 h-4" />,
  discord: <MessageSquare className="w-4 h-4" />,
};

const frequencyLabels: Record<AlertFrequency, string> = {
  instant: 'Instant',
  hourly: 'Hourly Digest',
  daily: 'Daily Digest',
  weekly: 'Weekly Digest',
};

export function AlertConfigPanel({
  rules,
  onSaveRule,
  onDeleteRule,
  onToggleRule,
}: AlertConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [draggedCondition, setDraggedCondition] = useState<DraggableCondition | null>(null);
  
  // Form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [channel, setChannel] = useState<AlertChannel>('email');
  const [channelValue, setChannelValue] = useState('');
  const [frequency, setFrequency] = useState<AlertFrequency>('instant');
  const [selectedConditions, setSelectedConditions] = useState<DraggableCondition[]>([]);

  const resetForm = () => {
    setRuleName('');
    setRuleDescription('');
    setChannel('email');
    setChannelValue('');
    setFrequency('instant');
    setSelectedConditions([]);
    setEditingRule(null);
    setIsCreating(false);
  };

  const handleDragStart = (condition: DraggableCondition) => {
    setDraggedCondition(condition);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCondition && !selectedConditions.find(c => c.id === draggedCondition.id)) {
      setSelectedConditions([...selectedConditions, draggedCondition]);
    }
    setDraggedCondition(null);
  };

  const removeCondition = (conditionId: string) => {
    setSelectedConditions(selectedConditions.filter(c => c.id !== conditionId));
  };

  const handleSave = () => {
    if (!ruleName || !channelValue || selectedConditions.length === 0) return;

    const channelConfig = channel === 'email' 
      ? { email: channelValue }
      : { webhookUrl: channelValue };

    const rule: AlertRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      name: ruleName,
      description: ruleDescription || undefined,
      enabled: true,
      channel,
      channelConfig,
      frequency,
      conditions: selectedConditions.map(c => ({ type: c.type, value: c.value })),
      createdAt: editingRule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRule(rule);
    resetForm();
  };

  const startEditing = (rule: AlertRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description || '');
    setChannel(rule.channel);
    setChannelValue(
      'email' in rule.channelConfig 
        ? rule.channelConfig.email 
        : rule.channelConfig.webhookUrl
    );
    setFrequency(rule.frequency);
    setSelectedConditions(
      rule.conditions.map(c => ({
        id: `${c.type}-${c.value}`,
        type: c.type,
        value: c.value,
        label: getLabelForCondition(c.type, c.value),
        color: getColorForCondition(c.type, c.value),
      }))
    );
    setIsCreating(true);
  };

  const groupedConditions = {
    source: availableConditions.filter(c => c.type === 'source'),
    category: availableConditions.filter(c => c.type === 'category'),
    sentiment: availableConditions.filter(c => c.type === 'sentiment'),
    urgency: availableConditions.filter(c => c.type === 'urgency'),
    friction_point: availableConditions.filter(c => c.type === 'friction_point'),
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-zinc-200">Alert Configuration</span>
          <span className="text-sm text-zinc-500">
            ({rules.filter(r => r.enabled).length} active)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Existing Rules */}
          {rules.length > 0 && !isCreating && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Active Alert Rules</h3>
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    rule.enabled 
                      ? 'bg-zinc-800/50 border-zinc-700' 
                      : 'bg-zinc-900/50 border-zinc-800 opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {channelIcons[rule.channel]}
                        <span className="font-medium text-zinc-200">{rule.name}</span>
                        <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">
                          {frequencyLabels[rule.frequency]}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-zinc-500 mt-1">{rule.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {rule.conditions.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${getColorForCondition(c.type, c.value)}20`,
                              color: getColorForCondition(c.type, c.value),
                            }}
                          >
                            {getLabelForCondition(c.type, c.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleRule(rule.id, !rule.enabled)}
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative',
                          rule.enabled ? 'bg-orange-500' : 'bg-zinc-700'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            rule.enabled ? 'left-5' : 'left-1'
                          )}
                        />
                      </button>
                      <button
                        onClick={() => startEditing(rule)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Form */}
          {isCreating ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">
                  {editingRule ? 'Edit Alert Rule' : 'Create New Alert Rule'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>

              {/* Rule Name & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Critical Bug Alerts"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Channel & Frequency */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Notification Channel</label>
                  <div className="flex gap-2">
                    {(['email', 'slack', 'discord'] as AlertChannel[]).map(ch => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                          channel === ch
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        )}
                      >
                        {channelIcons[ch]}
                        <span className="text-xs capitalize">{ch}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    {channel === 'email' ? 'Email Address' : 'Webhook URL'}
                  </label>
                  <input
                    type={channel === 'email' ? 'email' : 'url'}
                    value={channelValue}
                    onChange={(e) => setChannelValue(e.target.value)}
                    placeholder={channel === 'email' ? 'you@example.com' : 'https://hooks...'}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as AlertFrequency)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    {Object.entries(frequencyLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drag & Drop Conditions */}
              <div>
                <label className="block text-xs text-zinc-500 mb-3">
                  Drag conditions to trigger this alert
                </label>
                
                {/* Available conditions */}
                <div className="space-y-3 mb-4">
                  {Object.entries(groupedConditions).map(([type, conditions]) => (
                    <div key={type}>
                      <span className="text-xs text-zinc-600 uppercase tracking-wider">
                        {type.replace('_', ' ')}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {conditions.map(condition => {
                          const isSelected = selectedConditions.find(c => c.id === condition.id);
                          return (
                            <div
                              key={condition.id}
                              draggable={!isSelected}
                              onDragStart={() => handleDragStart(condition)}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                                isSelected
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'cursor-grab active:cursor-grabbing hover:scale-105'
                              )}
                              style={{
                                backgroundColor: `${condition.color}20`,
                                color: condition.color,
                              }}
                            >
                              <GripVertical className="w-3 h-3 opacity-50" />
                              {condition.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    'min-h-[80px] border-2 border-dashed rounded-lg p-4 transition-colors',
                    draggedCondition
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-700 bg-zinc-800/30',
                    selectedConditions.length === 0 && 'flex items-center justify-center'
                  )}
                >
                  {selectedConditions.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Drop conditions here to create alert triggers
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedConditions.map(condition => (
                        <div
                          key={condition.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${condition.color}20`,
                            color: condition.color,
                          }}
                        >
                          {condition.label}
                          <button
                            onClick={() => removeCondition(condition.id)}
                            className="hover:bg-white/10 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  Alert triggers when a ticket matches ANY of the selected conditions
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!ruleName || !channelValue || selectedConditions.length === 0}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    ruleName && channelValue && selectedConditions.length > 0
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  )}
                >
                  <Check className="w-4 h-4" />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-700 rounded-lg text-sm text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Alert Rule
            </button>
          )}
        </div>
      )}
    </div>
  );
}

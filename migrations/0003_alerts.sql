-- Alert Rules Schema
-- Stores user-configured alert rules for notifications

DROP TABLE IF EXISTS alert_rules;
DROP TABLE IF EXISTS alert_conditions;

-- Alert rules table
CREATE TABLE alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    
    -- Notification channel
    channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'discord')),
    channel_config TEXT NOT NULL, -- JSON: { "email": "user@example.com" } or { "webhook_url": "..." }
    
    -- Frequency
    frequency TEXT NOT NULL CHECK (frequency IN ('instant', 'hourly', 'daily', 'weekly')),
    
    -- Last triggered
    last_triggered_at TEXT,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alert conditions (filters for when to trigger)
CREATE TABLE alert_conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id TEXT NOT NULL,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('source', 'category', 'sentiment', 'urgency', 'friction_point')),
    condition_value TEXT NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
);

-- Alert history for tracking sent notifications
CREATE TABLE alert_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_alert_rules_channel ON alert_rules(channel);
CREATE INDEX idx_alert_conditions_rule_id ON alert_conditions(rule_id);
CREATE INDEX idx_alert_history_rule_id ON alert_history(rule_id);
CREATE INDEX idx_alert_history_ticket_id ON alert_history(ticket_id);

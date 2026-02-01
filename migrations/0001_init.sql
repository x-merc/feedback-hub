-- Feedback Hub Database Schema
-- Stores product feedback from multiple sources

DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS ticket_tags;

-- Main tickets table
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('support', 'discord', 'github', 'email', 'twitter', 'forum', 'other')),
    category TEXT NOT NULL CHECK (category IN ('bug', 'feature_request', 'ui_ux', 'performance', 'documentation', 'question', 'other')),
    friction_point TEXT CHECK (friction_point IN ('ui_ux', 'performance', 'missing_feature', 'confusing_docs', 'onboarding', 'pricing', 'integration', 'other', NULL)),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score REAL DEFAULT 0.0,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    customer_id TEXT,
    customer_email TEXT,
    customer_name TEXT,
    ai_synopsis TEXT,
    embedding_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tags for flexible categorization
CREATE TABLE ticket_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_tickets_source ON tickets(source);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_sentiment ON tickets(sentiment);
CREATE INDEX idx_tickets_urgency ON tickets(urgency);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_friction_point ON tickets(friction_point);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_ticket_tags_ticket_id ON ticket_tags(ticket_id);
CREATE INDEX idx_ticket_tags_tag ON ticket_tags(tag);

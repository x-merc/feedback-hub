# Feedback Hub

A product feedback aggregation and analysis dashboard built with Cloudflare's developer platform.

## Features

- **Multi-source Aggregation**: Collect feedback from Support Tickets, Discord, GitHub Issues, Email, X/Twitter, Community Forums, and more
- **AI-Powered Analysis**: Automatic sentiment analysis, categorization, and synopsis generation using Workers AI
- **Interactive Dashboard**: Click on any widget to filter tickets by source, category, sentiment, urgency, or friction point
- **Related Tickets**: Find similar feedback using Vectorize embeddings for semantic search
- **Real-time Insights**: Overview widgets showing distribution of feedback across dimensions
- **Alert Configuration**: Drag-and-drop interface to create notification rules for Email, Slack, or Discord

## Cloudflare Products Used

- **Cloudflare Pages**: Hosts the Next.js dashboard
- **Cloudflare D1**: SQLite database for storing feedback tickets
- **Cloudflare Workers AI**: Powers sentiment analysis, classification, synopsis generation
- **Cloudflare Vectorize**: Stores embeddings for finding related tickets via semantic search

## Getting Started

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Installation

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database
npm run db:create

# Update wrangler.toml with your database_id

# Run migrations
npm run db:migrate
npm run db:alerts

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### Create Vectorize Index

```bash
wrangler vectorize create feedback-embeddings --dimensions=768 --metric=cosine
```

### Deployment

```bash
# Build and deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
feedback-hub/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tickets/          # Ticket CRUD + AI analysis
│   │   │   ├── alerts/           # Alert rules CRUD + notifications
│   │   │   └── stats/            # Dashboard statistics
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── widgets/              # Dashboard widgets
│   │   │   ├── StatsCard.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   └── SentimentGauge.tsx
│   │   ├── tickets/              # Ticket components
│   │   │   ├── TicketTable.tsx
│   │   │   └── TicketDetail.tsx
│   │   ├── alerts/               # Alert configuration
│   │   │   └── AlertConfigPanel.tsx
│   │   └── Dashboard.tsx
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── utils.ts              # Utility functions
│       └── mock-data.ts          # Sample data for development
├── migrations/
│   ├── 0001_init.sql             # Database schema
│   ├── 0002_seed.sql             # Sample data
│   └── 0003_alerts.sql           # Alert rules schema
├── wrangler.toml                 # Cloudflare configuration
└── package.json
```

## Dashboard Features

### Overview Widgets
- **Total Tickets**: All-time feedback count
- **Open Tickets**: Awaiting response
- **Critical Issues**: Needs immediate attention
- **Average Sentiment**: Overall sentiment score

### Distribution Charts (Clickable Filters)
- **By Source**: Support, Discord, GitHub, Email, Twitter, Forum
- **By Category**: Bug, Feature Request, UI/UX, Performance, Documentation
- **By Urgency**: Low, Medium, High, Critical
- **Friction Points**: UI/UX, Performance, Missing Feature, Docs, Onboarding, Pricing, Integration

### Ticket Table
- Sortable list of all tickets matching current filters
- Shows title, source, category, sentiment, urgency, and creation time
- Click any ticket to view details

### Ticket Detail Panel
- **AI Synopsis**: Auto-generated summary of the feedback
- **Customer Info**: Name and email
- **Full Content**: Complete feedback text
- **Metadata**: Sentiment score, friction point, status, tags
- **Related Tickets**: Semantically similar feedback (powered by Vectorize)

## API Endpoints

### GET /api/tickets
Fetch tickets with optional filters:
- `source`: Filter by source
- `category`: Filter by category
- `sentiment`: Filter by sentiment
- `urgency`: Filter by urgency
- `friction_point`: Filter by friction point
- `status`: Filter by status
- `search`: Text search in title/content

### POST /api/tickets
Create a new ticket with automatic AI analysis:
```json
{
  "title": "Feedback title",
  "content": "Detailed feedback content",
  "source": "support",
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}
```

### GET /api/tickets/[id]
Get a single ticket by ID

### PATCH /api/tickets/[id]
Update ticket status, urgency, category, or friction_point

### GET /api/tickets/[id]/related
Find related tickets using semantic search

### GET /api/stats
Get dashboard statistics and aggregations

### Alert API Endpoints

#### GET /api/alerts
Get all alert rules

#### POST /api/alerts
Create or update an alert rule:
```json
{
  "name": "Critical Bug Alerts",
  "description": "Notify on critical bugs",
  "channel": "slack",
  "channelConfig": { "webhookUrl": "https://hooks.slack.com/..." },
  "frequency": "instant",
  "conditions": [
    { "type": "urgency", "value": "critical" },
    { "type": "category", "value": "bug" }
  ]
}
```

#### DELETE /api/alerts/[id]
Delete an alert rule

#### PATCH /api/alerts/[id]
Toggle alert rule enabled/disabled

#### POST /api/alerts/send
Trigger alerts for a ticket (called automatically on ticket creation)

## Alert Configuration

The Alert Configuration panel at the bottom of the dashboard allows you to:

1. **Create Alert Rules** - Click "Create New Alert Rule"
2. **Drag & Drop Conditions** - Drag sources, categories, sentiments, urgencies, or friction points into the drop zone
3. **Choose Channel** - Email, Slack, or Discord
4. **Set Frequency** - Instant, Hourly Digest, Daily Digest, or Weekly Digest
5. **Manage Rules** - Toggle on/off, edit, or delete existing rules

### Slack/Discord Webhook Setup

For Slack:
1. Go to your Slack workspace settings
2. Create an Incoming Webhook
3. Copy the webhook URL into the alert configuration

For Discord:
1. Go to Server Settings → Integrations → Webhooks
2. Create a new webhook
3. Copy the webhook URL into the alert configuration

## License

MIT

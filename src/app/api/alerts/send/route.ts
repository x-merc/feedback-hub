import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

interface AlertRule {
  id: string;
  name: string;
  channel: string;
  channel_config: string;
  frequency: string;
  enabled: number;
}

interface AlertCondition {
  condition_type: string;
  condition_value: string;
}

interface Ticket {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  sentiment: string;
  urgency: string;
  friction_point: string | null;
  ai_synopsis: string | null;
  customer_name: string | null;
}

async function sendEmailNotification(email: string, ticket: Ticket, ruleName: string) {
  // In production, integrate with Cloudflare Email Workers or external service
  console.log(`[Email] Sending alert "${ruleName}" to ${email} for ticket: ${ticket.title}`);
  return true;
}

async function sendSlackNotification(webhookUrl: string, ticket: Ticket, ruleName: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🔔 *${ruleName}*`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🔔 ${ruleName}` }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${ticket.title}*\n${ticket.ai_synopsis || ticket.content.slice(0, 200)}...`
            }
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `*Source:* ${ticket.source}` },
              { type: 'mrkdwn', text: `*Category:* ${ticket.category}` },
              { type: 'mrkdwn', text: `*Urgency:* ${ticket.urgency}` },
              { type: 'mrkdwn', text: `*Sentiment:* ${ticket.sentiment}` },
            ]
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `From: ${ticket.customer_name || 'Anonymous'}` }
            ]
          }
        ]
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

async function sendDiscordNotification(webhookUrl: string, ticket: Ticket, ruleName: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🔔 ${ruleName}`,
          description: `**${ticket.title}**\n\n${ticket.ai_synopsis || ticket.content.slice(0, 300)}`,
          color: ticket.sentiment === 'negative' ? 0xef4444 : 
                 ticket.sentiment === 'positive' ? 0x10b981 : 0xf59e0b,
          fields: [
            { name: 'Source', value: ticket.source, inline: true },
            { name: 'Category', value: ticket.category, inline: true },
            { name: 'Urgency', value: ticket.urgency, inline: true },
            { name: 'Sentiment', value: ticket.sentiment, inline: true },
          ],
          footer: { text: `From: ${ticket.customer_name || 'Anonymous'}` },
          timestamp: new Date().toISOString(),
        }]
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
}

// This endpoint is called when a new ticket is created to check for matching alerts
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { ticketId } = await request.json() as { ticketId: string };
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
    }
    
    // Get the ticket
    const ticket = await env.DB.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).bind(ticketId).first() as Ticket | null;
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Get all enabled alert rules
    const rulesResult = await env.DB.prepare(
      'SELECT * FROM alert_rules WHERE enabled = 1'
    ).all();
    
    const alertsSent = [];
    
    for (const rule of (rulesResult.results || []) as unknown as AlertRule[]) {
      // Get conditions for this rule
      const conditionsResult = await env.DB.prepare(
        'SELECT condition_type, condition_value FROM alert_conditions WHERE rule_id = ?'
      ).bind(rule.id).all();
      
      const conditions = (conditionsResult.results || []) as unknown as AlertCondition[];
      
      // Check if ticket matches any condition (OR logic)
      const matches = conditions.some(condition => {
        switch (condition.condition_type) {
          case 'source': return ticket.source === condition.condition_value;
          case 'category': return ticket.category === condition.condition_value;
          case 'sentiment': return ticket.sentiment === condition.condition_value;
          case 'urgency': return ticket.urgency === condition.condition_value;
          case 'friction_point': return ticket.friction_point === condition.condition_value;
          default: return false;
        }
      });
      
      if (matches) {
        const config = JSON.parse(rule.channel_config);
        let success = false;
        
        switch (rule.channel) {
          case 'email':
            success = await sendEmailNotification(config.email, ticket, rule.name);
            break;
          case 'slack':
            success = await sendSlackNotification(config.webhookUrl, ticket, rule.name);
            break;
          case 'discord':
            success = await sendDiscordNotification(config.webhookUrl, ticket, rule.name);
            break;
        }
        
        // Log to alert history
        await env.DB.prepare(`
          INSERT INTO alert_history (rule_id, ticket_id, status, error_message)
          VALUES (?, ?, ?, ?)
        `).bind(
          rule.id,
          ticketId,
          success ? 'sent' : 'failed',
          success ? null : 'Delivery failed'
        ).run();
        
        // Update last triggered
        await env.DB.prepare(
          "UPDATE alert_rules SET last_triggered_at = datetime('now') WHERE id = ?"
        ).bind(rule.id).run();
        
        alertsSent.push({ ruleId: rule.id, ruleName: rule.name, success });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      alertsSent,
      message: `${alertsSent.length} alerts triggered`
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json({ error: 'Failed to process alerts' }, { status: 500 });
  }
}

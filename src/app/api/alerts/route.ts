import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    
    const rulesResult = await env.DB.prepare(
      'SELECT * FROM alert_rules ORDER BY created_at DESC'
    ).all();
    
    const rules = [];
    for (const rule of (rulesResult.results || []) as Record<string, unknown>[]) {
      const conditionsResult = await env.DB.prepare(
        'SELECT condition_type, condition_value FROM alert_conditions WHERE rule_id = ?'
      ).bind(rule.id).all();
      
      rules.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        enabled: Boolean(rule.enabled),
        channel: rule.channel,
        channelConfig: JSON.parse(rule.channel_config as string),
        frequency: rule.frequency,
        conditions: (conditionsResult.results || []).map((c: Record<string, unknown>) => ({
          type: c.condition_type,
          value: c.condition_value,
        })),
        lastTriggeredAt: rule.last_triggered_at,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
      });
    }
    
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json({ error: 'Failed to fetch alert rules' }, { status: 500 });
  }
}

interface AlertRuleBody {
  id?: string;
  name: string;
  description?: string;
  channel: string;
  channelConfig: Record<string, string>;
  frequency: string;
  conditions: Array<{ type: string; value: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const body = await request.json() as AlertRuleBody;
    
    const {
      id,
      name,
      description,
      channel,
      channelConfig,
      frequency,
      conditions,
    } = body;
    
    if (!name || !channel || !channelConfig || !frequency || !conditions?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const ruleId = id || `rule-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Check if updating existing rule
    const existing = await env.DB.prepare(
      'SELECT id FROM alert_rules WHERE id = ?'
    ).bind(ruleId).first();
    
    if (existing) {
      // Update existing rule
      await env.DB.prepare(`
        UPDATE alert_rules 
        SET name = ?, description = ?, channel = ?, channel_config = ?, 
            frequency = ?, updated_at = ?
        WHERE id = ?
      `).bind(
        name,
        description || null,
        channel,
        JSON.stringify(channelConfig),
        frequency,
        now,
        ruleId
      ).run();
      
      // Delete old conditions
      await env.DB.prepare(
        'DELETE FROM alert_conditions WHERE rule_id = ?'
      ).bind(ruleId).run();
    } else {
      // Insert new rule
      await env.DB.prepare(`
        INSERT INTO alert_rules (id, name, description, channel, channel_config, frequency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ruleId,
        name,
        description || null,
        channel,
        JSON.stringify(channelConfig),
        frequency,
        now,
        now
      ).run();
    }
    
    // Insert conditions
    for (const condition of conditions) {
      await env.DB.prepare(
        'INSERT INTO alert_conditions (rule_id, condition_type, condition_value) VALUES (?, ?, ?)'
      ).bind(ruleId, condition.type, condition.value).run();
    }
    
    return NextResponse.json({ success: true, id: ruleId });
  } catch (error) {
    console.error('Error saving alert rule:', error);
    return NextResponse.json({ error: 'Failed to save alert rule' }, { status: 500 });
  }
}

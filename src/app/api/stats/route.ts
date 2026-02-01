import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    
    // Get total counts
    const totalResult = await env.DB.prepare('SELECT COUNT(*) as count FROM tickets').first();
    const openResult = await env.DB.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'open'").first();
    const criticalResult = await env.DB.prepare("SELECT COUNT(*) as count FROM tickets WHERE urgency = 'critical'").first();
    const avgSentimentResult = await env.DB.prepare('SELECT AVG(sentiment_score) as avg FROM tickets').first();
    
    // Get counts by source
    const bySourceResult = await env.DB.prepare(
      'SELECT source, COUNT(*) as count FROM tickets GROUP BY source'
    ).all();
    
    // Get counts by category
    const byCategoryResult = await env.DB.prepare(
      'SELECT category, COUNT(*) as count FROM tickets GROUP BY category'
    ).all();
    
    // Get counts by sentiment
    const bySentimentResult = await env.DB.prepare(
      'SELECT sentiment, COUNT(*) as count FROM tickets GROUP BY sentiment'
    ).all();
    
    // Get counts by urgency
    const byUrgencyResult = await env.DB.prepare(
      'SELECT urgency, COUNT(*) as count FROM tickets GROUP BY urgency'
    ).all();
    
    // Get counts by friction point
    const byFrictionResult = await env.DB.prepare(
      'SELECT friction_point, COUNT(*) as count FROM tickets WHERE friction_point IS NOT NULL GROUP BY friction_point'
    ).all();
    
    // Get trend data for last 7 days
    const trendResult = await env.DB.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count,
        AVG(sentiment_score) as sentiment_avg
      FROM tickets
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date
    `).all();
    
    // Transform results into stats object
    const bySource: Record<string, number> = {};
    for (const row of (bySourceResult.results || []) as Array<{ source: string; count: number }>) {
      bySource[row.source] = row.count;
    }
    
    const byCategory: Record<string, number> = {};
    for (const row of (byCategoryResult.results || []) as Array<{ category: string; count: number }>) {
      byCategory[row.category] = row.count;
    }
    
    const bySentiment: Record<string, number> = {};
    for (const row of (bySentimentResult.results || []) as Array<{ sentiment: string; count: number }>) {
      bySentiment[row.sentiment] = row.count;
    }
    
    const byUrgency: Record<string, number> = {};
    for (const row of (byUrgencyResult.results || []) as Array<{ urgency: string; count: number }>) {
      byUrgency[row.urgency] = row.count;
    }
    
    const byFrictionPoint: Record<string, number> = {};
    for (const row of (byFrictionResult.results || []) as Array<{ friction_point: string; count: number }>) {
      byFrictionPoint[row.friction_point] = row.count;
    }
    
    const stats = {
      total_tickets: (totalResult as { count: number } | null)?.count || 0,
      open_tickets: (openResult as { count: number } | null)?.count || 0,
      critical_tickets: (criticalResult as { count: number } | null)?.count || 0,
      avg_sentiment: (avgSentimentResult as { avg: number } | null)?.avg || 0,
      by_source: bySource,
      by_category: byCategory,
      by_sentiment: bySentiment,
      by_urgency: byUrgency,
      by_friction_point: byFrictionPoint,
      recent_trend: (trendResult.results || []).map((row: Record<string, unknown>) => ({
        date: row.date,
        count: row.count,
        sentiment_avg: row.sentiment_avg || 0,
      })),
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

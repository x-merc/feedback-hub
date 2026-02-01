import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

interface Ticket {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  sentiment: string;
  sentiment_score: number;
  urgency: string;
  friction_point: string | null;
  ai_synopsis: string | null;
  customer_name: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { searchParams } = new URL(request.url);
    
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const startDate = `${dateStr} 00:00:00`;
    const endDate = `${dateStr} 23:59:59`;
    
    // Fetch tickets for the selected date
    const ticketsResult = await env.DB.prepare(`
      SELECT * FROM tickets 
      WHERE created_at >= ? AND created_at <= ?
      ORDER BY created_at DESC
    `).bind(startDate, endDate).all();
    
    const tickets = (ticketsResult.results || []) as unknown as Ticket[];
    
    if (tickets.length === 0) {
      return NextResponse.json({ brief: null, message: 'No tickets for this date' });
    }
    
    // Calculate basic metrics
    const avgSentiment = tickets.reduce((sum, t) => sum + t.sentiment_score, 0) / tickets.length;
    const criticalCount = tickets.filter(t => t.urgency === 'critical').length;
    
    // Count by source and category
    const sourceCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const frictionCounts: Record<string, number> = {};
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    
    tickets.forEach(t => {
      sourceCounts[t.source] = (sourceCounts[t.source] || 0) + 1;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      if (t.friction_point) {
        frictionCounts[t.friction_point] = (frictionCounts[t.friction_point] || 0) + 1;
      }
      sentimentCounts[t.sentiment as keyof typeof sentimentCounts]++;
    });
    
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const topFriction = Object.entries(frictionCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Prepare ticket summaries for AI analysis
    const ticketSummaries = tickets.slice(0, 20).map(t => 
      `- [${t.category}/${t.urgency}] ${t.title}: ${t.ai_synopsis || t.content.slice(0, 100)}`
    ).join('\n');
    
    // Generate AI brief using Workers AI
    const prompt = `You are a product analyst. Analyze these customer feedback tickets from ${dateStr} and provide insights.

TICKETS (${tickets.length} total):
${ticketSummaries}

METRICS:
- Average sentiment: ${(avgSentiment * 100).toFixed(0)}%
- Critical issues: ${criticalCount}
- Top source: ${topSource}
- Top category: ${topCategory}
- Sentiment breakdown: ${sentimentCounts.positive} positive, ${sentimentCounts.negative} negative, ${sentimentCounts.neutral} neutral
${topFriction ? `- Top friction point: ${topFriction[0]} (${topFriction[1]} tickets)` : ''}

Provide a JSON response with this exact structure:
{
  "topIssue": {
    "title": "Brief title of the main issue (max 50 chars)",
    "description": "One sentence description",
    "ticketCount": <number of related tickets>
  },
  "affectedSegment": {
    "description": "Who is affected (e.g., 'Small SaaS on Free/Pro')",
    "details": ["segment1", "segment2"]
  },
  "emotionTrend": {
    "from": "Starting emotion (one word)",
    "to": "Ending emotion (one word)",
    "description": "Brief explanation of the trend"
  },
  "businessRisk": {
    "level": "low|medium|high|critical",
    "description": "One sentence about the business impact",
    "signals": ["signal1", "signal2"]
  },
  "suggestedActions": [
    {
      "title": "Action title",
      "description": "Brief description",
      "priority": "low|medium|high"
    }
  ]
}

Return ONLY valid JSON, no markdown or explanation.`;

    let aiResponse;
    try {
      const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as Parameters<typeof env.AI.run>[0], {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }) as unknown as { response?: string };
      
      aiResponse = result.response || '';
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Fallback to basic analysis
      aiResponse = JSON.stringify({
        topIssue: {
          title: topCategory.replace('_', ' '),
          description: `Most common issue type with ${categoryCounts[topCategory]} tickets`,
          ticketCount: categoryCounts[topCategory] || 0
        },
        affectedSegment: {
          description: 'Various customer segments',
          details: [topSource]
        },
        emotionTrend: {
          from: sentimentCounts.negative > sentimentCounts.positive ? 'Concerned' : 'Neutral',
          to: avgSentiment < 0 ? 'Frustrated' : 'Satisfied',
          description: 'Based on sentiment analysis'
        },
        businessRisk: {
          level: criticalCount > 2 ? 'high' : criticalCount > 0 ? 'medium' : 'low',
          description: criticalCount > 0 ? 'Critical issues require attention' : 'No immediate concerns',
          signals: criticalCount > 0 ? ['Critical tickets present'] : ['Normal volume']
        },
        suggestedActions: [
          {
            title: 'Review top issues',
            description: `Focus on ${topCategory.replace('_', ' ')} tickets`,
            priority: criticalCount > 0 ? 'high' : 'medium'
          }
        ]
      });
    }
    
    // Parse AI response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Use fallback
      parsedResponse = {
        topIssue: {
          title: topCategory.replace('_', ' '),
          description: 'Most common issue type',
          ticketCount: categoryCounts[topCategory] || 0
        },
        affectedSegment: {
          description: 'Various customer segments',
          details: [topSource]
        },
        emotionTrend: {
          from: 'Neutral',
          to: avgSentiment < 0 ? 'Frustrated' : 'Satisfied',
          description: 'Based on sentiment scores'
        },
        businessRisk: {
          level: criticalCount > 2 ? 'high' : criticalCount > 0 ? 'medium' : 'low',
          description: 'Based on ticket urgency levels',
          signals: ['Automated analysis']
        },
        suggestedActions: [
          {
            title: 'Review feedback',
            description: 'Analyze top issues in detail',
            priority: 'medium'
          }
        ]
      };
    }
    
    const brief = {
      date: dateStr,
      period: 'Last 24 hours',
      ticketCount: tickets.length,
      ...parsedResponse,
      keyMetrics: {
        avgSentiment,
        criticalCount,
        topSource,
        topCategory,
      }
    };
    
    return NextResponse.json({ brief });
  } catch (error) {
    console.error('Error generating brief:', error);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}

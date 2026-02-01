import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { searchParams } = new URL(request.url);
    
    const source = searchParams.get('source');
    const category = searchParams.get('category');
    const sentiment = searchParams.get('sentiment');
    const urgency = searchParams.get('urgency');
    const friction_point = searchParams.get('friction_point');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: string[] = [];
    
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (sentiment) {
      query += ' AND sentiment = ?';
      params.push(sentiment);
    }
    if (urgency) {
      query += ' AND urgency = ?';
      params.push(urgency);
    }
    if (friction_point) {
      query += ' AND friction_point = ?';
      params.push(friction_point);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    // Get tags for each ticket
    const tickets = result.results || [];
    for (const ticket of tickets) {
      const tagsResult = await env.DB.prepare(
        'SELECT tag FROM ticket_tags WHERE ticket_id = ?'
      ).bind(ticket.id).all();
      (ticket as Record<string, unknown>).tags = (tagsResult.results || []).map((t: Record<string, unknown>) => t.tag);
    }
    
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

interface TicketBody {
  title: string;
  content: string;
  source: string;
  customer_name?: string;
  customer_email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const body = await request.json() as TicketBody;
    
    const {
      title,
      content,
      source,
      customer_name,
      customer_email,
    } = body;
    
    if (!title || !content || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, source' },
        { status: 400 }
      );
    }
    
    // Use Workers AI for sentiment analysis and classification
    const analysisPrompt = `Analyze this customer feedback and respond with JSON only:
{
  "category": "bug" | "feature_request" | "ui_ux" | "performance" | "documentation" | "question" | "other",
  "friction_point": "ui_ux" | "performance" | "missing_feature" | "confusing_docs" | "onboarding" | "pricing" | "integration" | "other" | null,
  "sentiment": "positive" | "negative" | "neutral",
  "sentiment_score": number between -1 and 1,
  "urgency": "low" | "medium" | "high" | "critical",
  "synopsis": "brief 1-2 sentence summary",
  "tags": ["relevant", "tags"]
}

Feedback Title: ${title}
Feedback Content: ${content}`;

    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as Parameters<typeof env.AI.run>[0], {
      messages: [
        { role: 'system', content: 'You are a product feedback analyst. Respond only with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 500,
    }) as unknown as { response?: string };

    let analysis;
    try {
      const responseText = aiResponse.response || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = {
        category: 'other',
        friction_point: null,
        sentiment: 'neutral',
        sentiment_score: 0,
        urgency: 'medium',
        synopsis: title,
        tags: [],
      };
    }
    
    const id = `t${Date.now()}`;
    
    await env.DB.prepare(`
      INSERT INTO tickets (
        id, title, content, source, category, friction_point,
        sentiment, sentiment_score, urgency, status,
        customer_name, customer_email, ai_synopsis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)
    `).bind(
      id,
      title,
      content,
      source,
      analysis.category,
      analysis.friction_point,
      analysis.sentiment,
      analysis.sentiment_score,
      analysis.urgency,
      customer_name || null,
      customer_email || null,
      analysis.synopsis
    ).run();
    
    // Insert tags
    if (analysis.tags && analysis.tags.length > 0) {
      for (const tag of analysis.tags) {
        await env.DB.prepare(
          'INSERT INTO ticket_tags (ticket_id, tag) VALUES (?, ?)'
        ).bind(id, tag).run();
      }
    }
    
    // Generate embedding for related ticket search
    try {
      const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5' as Parameters<typeof env.AI.run>[0], {
        text: `${title} ${content}`,
      }) as unknown as { data: number[][] };
      
      if (embeddingResponse.data && embeddingResponse.data[0]) {
        await env.VECTORIZE.upsert([{
          id: id,
          values: embeddingResponse.data[0],
          metadata: { title, source, category: analysis.category },
        }]);
        
        await env.DB.prepare(
          'UPDATE tickets SET embedding_id = ? WHERE id = ?'
        ).bind(id, id).run();
      }
    } catch (embeddingError) {
      console.error('Error generating embedding:', embeddingError);
    }
    
    return NextResponse.json({ 
      success: true, 
      ticket: { id, ...body, ...analysis }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    
    // Get the ticket to find its embedding
    const ticket = await env.DB.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).bind(id).first();
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Generate embedding for this ticket's content
    const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5' as Parameters<typeof env.AI.run>[0], {
      text: `${ticket.title} ${ticket.content}`,
    }) as unknown as { data: number[][] };
    
    if (!embeddingResponse.data || !embeddingResponse.data[0]) {
      return NextResponse.json({ related: [] });
    }
    
    // Query Vectorize for similar tickets
    const vectorResults = await env.VECTORIZE.query(embeddingResponse.data[0], {
      topK: 6,
      returnMetadata: true,
    });
    
    // Filter out the current ticket and get full ticket data
    const relatedTickets = [];
    for (const match of vectorResults.matches || []) {
      if (match.id !== id && match.score > 0.7) {
        const relatedTicket = await env.DB.prepare(
          'SELECT * FROM tickets WHERE id = ?'
        ).bind(match.id).first();
        
        if (relatedTicket) {
          relatedTickets.push({
            ticket: relatedTicket,
            similarity_score: match.score,
          });
        }
      }
    }
    
    return NextResponse.json({ related: relatedTickets.slice(0, 5) });
  } catch (error) {
    console.error('Error finding related tickets:', error);
    return NextResponse.json({ related: [] });
  }
}

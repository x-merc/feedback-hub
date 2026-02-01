import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    
    const ticket = await env.DB.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).bind(id).first();
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Get tags
    const tagsResult = await env.DB.prepare(
      'SELECT tag FROM ticket_tags WHERE ticket_id = ?'
    ).bind(id).all();
    (ticket as Record<string, unknown>).tags = (tagsResult.results || []).map((t: Record<string, unknown>) => t.tag);
    
    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    const body = await request.json() as Record<string, string | null>;
    
    const allowedFields = ['status', 'urgency', 'category', 'friction_point'];
    const updates: string[] = [];
    const values: (string | null)[] = [];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    updates.push("updated_at = datetime('now')");
    values.push(id);
    
    await env.DB.prepare(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

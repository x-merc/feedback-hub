import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    
    await env.DB.prepare('DELETE FROM alert_rules WHERE id = ?').bind(id).run();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json({ error: 'Failed to delete alert rule' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    const body = await request.json() as { enabled?: boolean };
    
    if (typeof body.enabled === 'boolean') {
      await env.DB.prepare(
        "UPDATE alert_rules SET enabled = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(body.enabled ? 1 : 0, id).run();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert rule:', error);
    return NextResponse.json({ error: 'Failed to update alert rule' }, { status: 500 });
  }
}

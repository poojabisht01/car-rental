import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const booking = db.prepare('SELECT * FROM Booking WHERE id = ?').get(id) as { userId: string } | undefined;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const booking = db.prepare('SELECT * FROM Booking WHERE id = ?').get(id) as { userId: string; status: string } | undefined;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Already cancelled' }, { status: 409 });
    db.prepare('UPDATE Booking SET status = ? WHERE id = ?').run('cancelled', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function requireAdmin(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return { error: 'Unauthorized', status: 401 as const };
  if (user.role !== 'admin') return { error: 'Forbidden', status: 403 as const };
  return { user };
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const bookings = db.prepare(`
      SELECT b.*, u.name as userName, u.email as userEmail, c.name as carName
      FROM Booking b
      LEFT JOIN User u ON b.userId = u.id
      LEFT JOIN Car c ON b.carId = c.id
      ORDER BY b.createdAt DESC
    `).all();

    const formatted = bookings.map((b: Record<string, unknown>) => ({
      ...b,
      user: { name: b.userName, email: b.userEmail },
      car: { name: b.carName },
    }));

    return NextResponse.json({ bookings: formatted });
  } catch (error) {
    console.error('Admin bookings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const existing = db.prepare('SELECT id FROM Booking WHERE id = ?').get(id);
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    db.prepare('UPDATE Booking SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin bookings PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function requireAdmin(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return { error: 'Unauthorized', status: 401 as const };
  if (user.role !== 'admin') return { error: 'Forbidden', status: 403 as const };
  return { user };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    const existing = db.prepare('SELECT id FROM Car WHERE id = ?').get(id);
    if (!existing) return NextResponse.json({ error: 'Car not found' }, { status: 404 });

    const body = await req.json();
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fields: Record<string, unknown> = {
      name: body.name, brand: body.brand, model: body.model, type: body.type,
      transmission: body.transmission, fuel: body.fuel, image: body.image,
      description: body.description, location: body.location, mileage: body.mileage,
      year: body.year !== undefined ? parseInt(body.year) : undefined,
      seats: body.seats !== undefined ? parseInt(body.seats) : undefined,
      pricePerDay: body.pricePerDay !== undefined ? parseFloat(body.pricePerDay) : undefined,
      rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
      reviews: body.reviews !== undefined ? parseInt(body.reviews) : undefined,
      available: body.available !== undefined ? (body.available ? 1 : 0) : undefined,
      features: body.features !== undefined ? (typeof body.features === 'string' ? body.features : JSON.stringify(body.features)) : undefined,
      images: body.images !== undefined ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : undefined,
    };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
    }
    if (sets.length) { vals.push(id); db.prepare(`UPDATE Car SET ${sets.join(', ')} WHERE id = ?`).run(...vals); }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin car PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    db.prepare('DELETE FROM Booking WHERE carId = ?').run(id);
    db.prepare('DELETE FROM Car WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin car DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

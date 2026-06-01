import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function requireAdmin(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return { error: 'Unauthorized', status: 401 as const };
  if (user.role !== 'admin') return { error: 'Forbidden', status: 403 as const };
  return { user };
}

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const cars = db.prepare('SELECT * FROM Car ORDER BY createdAt DESC').all();
    return NextResponse.json({ cars });
  } catch (error) {
    console.error('Admin cars GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { name, brand, model, year, type, transmission, seats, fuel, pricePerDay, image, images, description, features, available, rating, reviews, location, mileage } = await req.json();
    if (!name || !brand || !model || !year || !type || !fuel || !pricePerDay || !image || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = cuid();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO Car (id, name, brand, model, year, type, transmission, seats, fuel, pricePerDay, image, images, description, features, available, rating, reviews, location, mileage, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, name, brand, model, parseInt(year), type, transmission || 'automatic', parseInt(seats) || 5, fuel,
      parseFloat(pricePerDay), image, images || '[]', description, features || '[]',
      available !== false ? 1 : 0, parseFloat(rating) || 4.5, parseInt(reviews) || 0,
      location || 'City Center', mileage || 'Unlimited', now
    );

    return NextResponse.json({ car: { id, name } }, { status: 201 });
  } catch (error) {
    console.error('Admin cars POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

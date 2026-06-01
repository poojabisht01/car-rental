import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const car = db.prepare('SELECT * FROM Car WHERE id = ?').get(id);
    if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    return NextResponse.json(car);
  } catch (error) {
    console.error('Car GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

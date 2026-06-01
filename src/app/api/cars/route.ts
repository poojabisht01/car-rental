import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const transmission = searchParams.get('transmission');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const available = searchParams.get('available');

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (type) { conditions.push('type = ?'); params.push(type); }
    if (transmission) { conditions.push('transmission = ?'); params.push(transmission); }
    if (minPrice) { conditions.push('pricePerDay >= ?'); params.push(parseFloat(minPrice)); }
    if (maxPrice) { conditions.push('pricePerDay <= ?'); params.push(parseFloat(maxPrice)); }
    if (available === 'true') { conditions.push('available = 1'); }
    if (search) {
      conditions.push('(name LIKE ? OR brand LIKE ? OR model LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const cars = db.prepare(`SELECT * FROM Car ${where} ORDER BY createdAt DESC`).all(...params);
    const { count } = db.prepare(`SELECT COUNT(*) as count FROM Car ${where}`).get(...params) as { count: number };

    return NextResponse.json({ cars, totalCars: count });
  } catch (error) {
    console.error('Cars GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

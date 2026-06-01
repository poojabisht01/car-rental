import { NextResponse } from 'next/server';
import { queryAll, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await queryAll(`
      SELECT b.*, c.name as carName, c.image as carImage, c.type as carType, c.pricePerDay as carPricePerDay
      FROM Booking b LEFT JOIN Car c ON b.carId = c.id
      WHERE b.userId = ? ORDER BY b.createdAt DESC`, [user.id]);

    const formatted = bookings.map((b: Record<string, unknown>) => ({
      ...b,
      car: { id: b.carId, name: b.carName, image: b.carImage, type: b.carType, pricePerDay: b.carPricePerDay },
    }));

    return NextResponse.json({ bookings: formatted });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { carId, startDate, endDate, pickupLoc, dropoffLoc, driverName, driverPhone, notes } = await req.json();
    if (!carId || !startDate || !endDate || !pickupLoc || !dropoffLoc || !driverName || !driverPhone)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const car = await queryOne<{ pricePerDay: number; available: number }>('SELECT * FROM Car WHERE id = ?', [carId]);
    if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    if (!car.available) return NextResponse.json({ error: 'Car is not available' }, { status: 409 });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * Number(car.pricePerDay);
    const id = uid();
    const now = new Date().toISOString();

    await execute(`INSERT INTO Booking (id, userId, carId, startDate, endDate, totalDays, totalPrice, status, pickupLoc, dropoffLoc, driverName, driverPhone, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.id, carId, start.toISOString(), end.toISOString(), totalDays, totalPrice, 'pending', pickupLoc, dropoffLoc, driverName, driverPhone, notes || null, now]);

    return NextResponse.json({ booking: { id, status: 'pending', totalDays, totalPrice } }, { status: 201 });
  } catch (error) {
    console.error('Bookings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

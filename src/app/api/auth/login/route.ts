import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const user = db.prepare('SELECT * FROM User WHERE email = ?').get(email) as { id: string; name: string; email: string; password: string; role: string } | undefined;
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

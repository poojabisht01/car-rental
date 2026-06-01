import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '@/lib/db';
import { signToken } from '@/lib/auth';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });

    const existing = await queryOne('SELECT id FROM User WHERE email = ?', [email]);
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uid();
    const now = new Date().toISOString();
    await execute('INSERT INTO User (id, name, email, password, phone, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, phone || null, 'user', now]);

    const token = signToken({ id, email, role: 'user' });
    return NextResponse.json({ token, user: { id, name, email, role: 'user' } }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

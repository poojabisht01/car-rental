import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const JWT_SECRET = 'car-rental-super-secret-jwt-key-2024';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function getCurrentUser(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  try {
    const user = db.prepare('SELECT id, name, email, role, phone FROM User WHERE id = ?').get(payload.id) as { id: string; name: string; email: string; role: string; phone: string } | undefined;
    return user || null;
  } catch {
    return null;
  }
}

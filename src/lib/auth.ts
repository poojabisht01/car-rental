import jwt from 'jsonwebtoken';
import { queryOne } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-super-secret-jwt-key-2024';

export interface JwtPayload { id: string; email: string; role: string; }

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; } catch { return null; }
}

export function getTokenFromRequest(req: Request): string | null {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

export async function getCurrentUser(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  try {
    return await queryOne<{ id: string; name: string; email: string; role: string; phone: string }>(
      'SELECT id, name, email, role, phone FROM User WHERE id = ?', [payload.id]
    );
  } catch { return null; }
}

// Authentication utilities for admin panel
import { sign, verify } from 'hono/jwt';
import type { AdminRole, HonoEnv } from '../types';

// Simple password hashing (for Cloudflare Workers environment)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'doraemon_salt_2025');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// JWT token management
export async function generateToken(user: AdminRole, secret: string): Promise<string> {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return await sign(payload, secret);
}

export async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    return await verify(token, secret);
  } catch {
    return null;
  }
}

// Admin role checking
export function isAdmin(user: AdminRole): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

export function isSuperAdmin(user: AdminRole): boolean {
  return user.role === 'superadmin';
}

// Session ID generation
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Rate limiting utilities
export async function checkRateLimit(
  kv: KVNamespace, 
  key: string, 
  limit: number, 
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get current count
  const currentData = await kv.get(`rate_limit:${key}`);
  let requests: number[] = currentData ? JSON.parse(currentData) : [];
  
  // Filter out requests outside the window
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  if (requests.length >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  // Add current request
  requests.push(now);
  
  // Store updated count
  await kv.put(`rate_limit:${key}`, JSON.stringify(requests), {
    expirationTtl: Math.ceil(windowMs / 1000)
  });
  
  return { allowed: true, remaining: limit - requests.length };
}

// IP address extraction
export function getClientIP(request: Request): string {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIP = request.headers.get('X-Real-IP');
  
  return cfConnectingIP || 
         (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
         xRealIP || 
         'unknown';
}

// User agent extraction
export function getUserAgent(request: Request): string {
  return request.headers.get('User-Agent') || 'unknown';
}
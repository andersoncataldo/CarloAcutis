import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { UserProfile, UserRole } from '../../src/types/api.types';
import { calcularTitulo } from './gamification.js';

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE_NAME = 'carlo_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

const SCRYPT_KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;

  const expectedKey = Buffer.from(keyHex, 'hex');
  if (expectedKey.length !== SCRYPT_KEY_LENGTH) return false;

  const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return timingSafeEqual(expectedKey, derivedKey);
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const rawVal = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(rawVal);
    } catch {
      cookies[key] = rawVal;
    }
  }
  return cookies;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token || token.length < 32) return null;
  return token;
}

export function buildSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearSessionCookie(secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export async function cleanupExpiredSessions(
  sql: NeonQueryFunction<false, false>
): Promise<void> {
  try {
    await sql`
      DELETE FROM public.sessions
      WHERE expires_at <= now()
    `;
  } catch (err) {
    console.error('Aviso ao limpar sessões expiradas:', err);
  }
}

export async function createSession(
  sql: NeonQueryFunction<false, false>,
  userId: string
): Promise<string> {
  await cleanupExpiredSessions(sql);
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await sql`
    INSERT INTO public.sessions (user_id, token_hash, expires_at)
    VALUES (${userId}::uuid, ${tokenHash}, ${expiresAt}::timestamptz)
  `;

  return token;
}

export async function revokeSession(
  sql: NeonQueryFunction<false, false>,
  token: string
): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await sql`
    DELETE FROM public.sessions
    WHERE token_hash = ${tokenHash}
       OR expires_at <= now()
  `;
}

interface SessionUserRow {
  id: string;
  nome: string;
  email: string;
  xp: number;
  role: UserRole;
  liga_id: number | null;
  liga_nome: string | null;
  liga_criado_por: string | null;
  liga_codigo_acesso: string | null;
}

export async function getSessionUser(
  sql: NeonQueryFunction<false, false>,
  request: Request
): Promise<UserProfile | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);

  const rows = await sql`
    SELECT
      u.id,
      u.nome,
      u.email,
      u.xp,
      u.role,
      u.liga_id,
      l.nome AS liga_nome,
      l.criado_por AS liga_criado_por,
      l.codigo_acesso AS liga_codigo_acesso
    FROM public.sessions s
    JOIN public.users u ON u.id = s.user_id
    LEFT JOIN public.ligas l ON l.id = u.liga_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > now()
    LIMIT 1
  `;

  const row = rows[0] as SessionUserRow | undefined;
  if (!row) return null;

  const xp = Number(row.xp);
  const isCreator = row.liga_id !== null && row.liga_criado_por === row.id;

  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    xp,
    nivel: calcularTitulo(xp),
    role: row.role,
    liga_id: row.liga_id !== null ? Number(row.liga_id) : null,
    liga:
      row.liga_id !== null && row.liga_nome !== null
        ? {
            id: Number(row.liga_id),
            nome: row.liga_nome,
            ...(isCreator && row.liga_codigo_acesso
              ? { codigo_acesso: row.liga_codigo_acesso }
              : {}),
          }
        : null,
  };
}

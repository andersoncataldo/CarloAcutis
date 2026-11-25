import { getSql } from '../_lib/db.js';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  createSession,
  getSessionTokenFromRequest,
  getSessionUser,
  hashPassword,
  revokeSession,
  verifyPassword,
} from '../_lib/auth.js';
import { calcularTitulo, registrarAcessoDiario } from '../_lib/gamification.js';
import {
  errorResponse,
  getClientIp,
  getLastPathSegment,
  isSecureRequest,
  jsonResponse,
  parseJsonBody,
  validateSameOrigin,
} from '../_lib/http.js';
import { checkRateLimit, cleanupExpiredRateLimits } from '../_lib/rateLimit.js';
import type { UserProfile, UserRole } from '../../src/types/api.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const MAX_LOGIN_ATTEMPTS_PER_IP = 15;
const MAX_LOGIN_ATTEMPTS_PER_EMAIL = 10;
const MAX_REGISTER_ATTEMPTS_PER_IP = 8;

interface DbUserRow {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  xp: number;
  role: UserRole;
  liga_id: number | null;
  liga_nome: string | null;
  liga_criado_por: string | null;
  liga_codigo_acesso: string | null;
}

function mapUserRow(row: DbUserRow): UserProfile {
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

export async function GET(request: Request): Promise<Response> {
  const action = getLastPathSegment(request);
  if (action !== 'me') {
    return errorResponse('Rota de autenticação não encontrada.', 404);
  }

  try {
    const sql = getSql();
    const user = await getSessionUser(sql, request);
    if (!user) {
      return jsonResponse({ user: null, streak: null }, 200);
    }

    const streak = await registrarAcessoDiario(sql, user.id);
    return jsonResponse({ user, streak }, 200);
  } catch (err) {
    console.error('Erro em GET /api/auth/me:', err);
    return errorResponse('Não foi possível verificar a sessão no momento.', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const originErr = validateSameOrigin(request);
  if (originErr) return originErr;

  const action = getLastPathSegment(request);

  if (action === 'logout') {
    try {
      const token = getSessionTokenFromRequest(request);
      if (token) {
        const sql = getSql();
        await revokeSession(sql, token);
      }
    } catch (err) {
      console.error('Erro em POST /api/auth/logout:', err);
    }
    return jsonResponse(
      { ok: true },
      200,
      { 'Set-Cookie': buildClearSessionCookie(isSecureRequest(request)) }
    );
  }

  const body = await parseJsonBody<{ nome?: unknown; email?: unknown; password?: unknown }>(request);
  if (!body) {
    return errorResponse('Corpo da requisição inválido.', 400);
  }

  if (action === 'register') {
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const rawNome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const nome = rawNome.length > 0 ? rawNome.slice(0, 120) : 'Peregrino';

    if (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 255) {
      return errorResponse('Informe um endereço de e-mail válido.', 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
      return errorResponse(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`, 400);
    }

    try {
      const sql = getSql();
      const ipLimit = await checkRateLimit(sql, {
        scope: 'register:ip',
        identifier: getClientIp(request),
        maxHits: MAX_REGISTER_ATTEMPTS_PER_IP,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      });
      if (!ipLimit.allowed) {
        return errorResponse(
          'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.',
          429,
          { 'Retry-After': String(ipLimit.retryAfter) }
        );
      }

      const passwordHash = await hashPassword(password);

      const inserted = await sql`
        INSERT INTO public.users (nome, email, password_hash)
        VALUES (${nome}, ${rawEmail}, ${passwordHash})
        ON CONFLICT (email) DO NOTHING
        RETURNING id, nome, email, xp, role, liga_id
      `;

      const created = inserted[0] as
        | { id: string; nome: string; email: string; xp: number; role: UserRole; liga_id: number | null }
        | undefined;

      if (!created) {
        return errorResponse('Este e-mail já está cadastrado.', 409);
      }

      const token = await createSession(sql, created.id);
      const streak = await registrarAcessoDiario(sql, created.id);
      await cleanupExpiredRateLimits(sql);

      const user: UserProfile = {
        id: created.id,
        nome: created.nome,
        email: created.email,
        xp: Number(created.xp),
        nivel: calcularTitulo(Number(created.xp)),
        role: created.role,
        liga_id: null,
        liga: null,
      };

      return jsonResponse(
        { user, streak },
        201,
        { 'Set-Cookie': buildSessionCookie(token, isSecureRequest(request)) }
      );
    } catch (err) {
      console.error('Erro em POST /api/auth/register:', err);
      return errorResponse('Não foi possível concluir o cadastro. Tente novamente.', 500);
    }
  }

  if (action === 'login') {
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!EMAIL_REGEX.test(rawEmail) || !password) {
      return errorResponse('Credenciais inválidas. Verifique e-mail e senha.', 401);
    }

    try {
      const sql = getSql();
      const ipLimit = await checkRateLimit(sql, {
        scope: 'login:ip',
        identifier: getClientIp(request),
        maxHits: MAX_LOGIN_ATTEMPTS_PER_IP,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      });
      if (!ipLimit.allowed) {
        return errorResponse(
          'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
          429,
          { 'Retry-After': String(ipLimit.retryAfter) }
        );
      }

      const emailLimit = await checkRateLimit(sql, {
        scope: 'login:email',
        identifier: rawEmail,
        maxHits: MAX_LOGIN_ATTEMPTS_PER_EMAIL,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      });
      if (!emailLimit.allowed) {
        return errorResponse(
          'Muitas tentativas para esta conta. Aguarde alguns minutos e tente novamente.',
          429,
          { 'Retry-After': String(emailLimit.retryAfter) }
        );
      }

      const rows = await sql`
        SELECT
          u.id,
          u.nome,
          u.email,
          u.password_hash,
          u.xp,
          u.role,
          u.liga_id,
          l.nome AS liga_nome,
          l.criado_por AS liga_criado_por,
          l.codigo_acesso AS liga_codigo_acesso
        FROM public.users u
        LEFT JOIN public.ligas l ON l.id = u.liga_id
        WHERE LOWER(u.email) = ${rawEmail}
        LIMIT 1
      `;

      const row = rows[0] as DbUserRow | undefined;
      if (!row) {
        return errorResponse('Credenciais inválidas. Verifique e-mail e senha.', 401);
      }

      const valid = await verifyPassword(password, row.password_hash);
      if (!valid) {
        return errorResponse('Credenciais inválidas. Verifique e-mail e senha.', 401);
      }

      const token = await createSession(sql, row.id);
      const streak = await registrarAcessoDiario(sql, row.id);
      await cleanupExpiredRateLimits(sql);
      const user = mapUserRow(row);

      return jsonResponse(
        { user, streak },
        200,
        { 'Set-Cookie': buildSessionCookie(token, isSecureRequest(request)) }
      );
    } catch (err) {
      console.error('Erro em POST /api/auth/login:', err);
      return errorResponse('Não foi possível fazer login agora. Tente novamente.', 500);
    }
  }

  return errorResponse('Rota de autenticação não encontrada.', 404);
}

export async function PATCH(request: Request): Promise<Response> {
  const originErr = validateSameOrigin(request);
  if (originErr) return originErr;

  const action = getLastPathSegment(request);
  if (action !== 'me') {
    return errorResponse('Rota de autenticação não encontrada.', 404);
  }

  const body = await parseJsonBody<{ nome?: unknown }>(request);
  if (!body) {
    return errorResponse('Corpo da requisição inválido.', 400);
  }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  if (!nome || nome.length > 120) {
    return errorResponse('Informe um nome válido (entre 1 e 120 caracteres).', 400);
  }

  try {
    const sql = getSql();
    const sessionUser = await getSessionUser(sql, request);
    if (!sessionUser) {
      return errorResponse('Usuário não autenticado.', 401);
    }

    await sql`
      UPDATE public.users
      SET nome = ${nome}, updated_at = now()
      WHERE id = ${sessionUser.id}::uuid
    `;

    return jsonResponse({ user: { ...sessionUser, nome } }, 200);
  } catch (err) {
    console.error('Erro em PATCH /api/auth/me:', err);
    return errorResponse('Não foi possível atualizar seu nome agora.', 500);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const originErr = validateSameOrigin(request);
  if (originErr) return originErr;

  const action = getLastPathSegment(request);
  if (action !== 'me') {
    return errorResponse('Rota de autenticação não encontrada.', 404);
  }

  const body = await parseJsonBody<{ password?: unknown }>(request);
  if (!body) {
    return errorResponse('Informe sua senha atual para confirmar a exclusão da conta.', 400);
  }

  const password = typeof body.password === 'string' ? body.password : '';
  if (!password) {
    return errorResponse('Informe sua senha atual para confirmar a exclusão da conta.', 400);
  }

  try {
    const sql = getSql();
    const sessionUser = await getSessionUser(sql, request);
    if (!sessionUser) {
      return errorResponse('Usuário não autenticado.', 401);
    }

    const rows = await sql`
      SELECT password_hash
      FROM public.users
      WHERE id = ${sessionUser.id}::uuid
      LIMIT 1
    `;
    const row = rows[0] as { password_hash: string } | undefined;
    if (!row) {
      return errorResponse('Conta não encontrada.', 404);
    }

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      return errorResponse('Senha incorreta. Confirme sua senha atual para excluir a conta.', 401);
    }

    await sql`
      DELETE FROM public.users
      WHERE id = ${sessionUser.id}::uuid
    `;

    return jsonResponse(
      { ok: true },
      200,
      { 'Set-Cookie': buildClearSessionCookie(isSecureRequest(request)) }
    );
  } catch (err) {
    console.error('Erro em DELETE /api/auth/me:', err);
    return errorResponse('Não foi possível excluir sua conta agora. Tente novamente.', 500);
  }
}

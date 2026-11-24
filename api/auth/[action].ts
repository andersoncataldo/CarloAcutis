import { getSql } from '../_lib/db';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  createSession,
  getSessionTokenFromRequest,
  getSessionUser,
  hashPassword,
  revokeSession,
  verifyPassword,
} from '../_lib/auth';
import { calcularTitulo, registrarAcessoDiario } from '../_lib/gamification';
import {
  errorResponse,
  getLastPathSegment,
  isSecureRequest,
  jsonResponse,
  parseJsonBody,
} from '../_lib/http';
import type { UserProfile, UserRole } from '../../src/types/api.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

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

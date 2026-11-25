import { randomBytes } from 'node:crypto';
import { getSql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/auth.js';
import { calcularTitulo, concederConquista } from '../_lib/gamification.js';
import {
  errorResponse,
  getLastPathSegment,
  jsonResponse,
  parseJsonBody,
  validateSameOrigin,
} from '../_lib/http.js';
import type { RankingMembro } from '../../src/types/api.types';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_LEAGUES_PER_USER = 3;

function generateLeagueCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function GET(request: Request): Promise<Response> {
  const action = getLastPathSegment(request);
  if (action !== 'ranking') {
    return errorResponse('Rota de liga não encontrada.', 404);
  }

  try {
    const sql = getSql();
    const user = await getSessionUser(sql, request);
    if (!user) {
      return errorResponse('Usuário não autenticado.', 401);
    }

    if (!user.liga_id) {
      return jsonResponse({ ranking: [] }, 200);
    }

    // Nunca expõe e-mail nem password_hash no ranking.
    const rows = await sql`
      SELECT id, nome, xp
      FROM public.users
      WHERE liga_id = ${user.liga_id}
      ORDER BY xp DESC, nome ASC
    `;

    const ranking: RankingMembro[] = (rows as Array<{ id: string; nome: string; xp: number }>).map(
      (m) => {
        const xp = Number(m.xp);
        return {
          id: m.id,
          nome: m.nome,
          xp,
          nivel: calcularTitulo(xp),
        };
      }
    );

    return jsonResponse({ ranking }, 200);
  } catch (err) {
    console.error('Erro em GET /api/leagues/ranking:', err);
    return errorResponse('Não foi possível carregar o ranking da liga.', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const originErr = validateSameOrigin(request);
  if (originErr) return originErr;

  const action = getLastPathSegment(request);

  try {
    const sql = getSql();
    const user = await getSessionUser(sql, request);
    if (!user) {
      return errorResponse('Usuário não autenticado.', 401);
    }

    if (action === 'leave') {
      await sql`
        UPDATE public.users
        SET liga_id = NULL, updated_at = now()
        WHERE id = ${user.id}::uuid
      `;
      return jsonResponse({ success: true }, 200);
    }

    const body = await parseJsonBody<{ nome?: unknown; codigo?: unknown }>(request);
    if (!body) {
      return errorResponse('Corpo da requisição inválido.', 400);
    }

    if (action === 'create') {
      const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
      if (!nome || nome.length > 100) {
        return errorResponse('Informe um nome válido para a liga (1 a 100 caracteres).', 400);
      }

      const countRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM public.ligas
        WHERE criado_por = ${user.id}::uuid
      `;
      const createdCount = Number((countRows[0] as { total: number } | undefined)?.total ?? 0);
      if (createdCount >= MAX_LEAGUES_PER_USER) {
        return errorResponse(
          `Você já atingiu o limite máximo de ${MAX_LEAGUES_PER_USER} ligas criadas.`,
          400
        );
      }

      let createdLeague: { id: number; nome: string; codigo_acesso: string } | undefined;
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateLeagueCode(8);
        const inserted = await sql`
          INSERT INTO public.ligas (nome, codigo_acesso, criado_por)
          VALUES (${nome}, ${code}, ${user.id}::uuid)
          ON CONFLICT (codigo_acesso) DO NOTHING
          RETURNING id, nome, codigo_acesso
        `;
        if (inserted.length > 0) {
          createdLeague = inserted[0] as { id: number; nome: string; codigo_acesso: string };
          break;
        }
      }

      if (!createdLeague) {
        return errorResponse('Não foi possível gerar o código da liga. Tente novamente.', 500);
      }

      const ligaId = Number(createdLeague.id);
      await sql`
        UPDATE public.users
        SET liga_id = ${ligaId}, updated_at = now()
        WHERE id = ${user.id}::uuid
      `;

      const unlocked = [];
      const achCreate = await concederConquista(sql, user.id, 'criou_liga');
      if (achCreate) unlocked.push(achCreate);
      const achJoin = await concederConquista(sql, user.id, 'entrou_liga');
      if (achJoin) unlocked.push(achJoin);

      return jsonResponse(
        {
          liga_id: ligaId,
          nome: createdLeague.nome,
          codigo_acesso: createdLeague.codigo_acesso,
          unlocked_achievements: unlocked,
        },
        201
      );
    }

    if (action === 'join') {
      const codigo = typeof body.codigo === 'string' ? body.codigo.trim().toUpperCase() : '';
      if (!codigo) {
        return errorResponse('Informe o código de acesso da liga.', 400);
      }

      const found = await sql`
        SELECT id, nome
        FROM public.ligas
        WHERE UPPER(codigo_acesso) = ${codigo}
        LIMIT 1
      `;

      const liga = found[0] as { id: number; nome: string } | undefined;
      if (!liga) {
        return errorResponse('Código de liga inválido ou não encontrado.', 404);
      }

      const ligaId = Number(liga.id);
      await sql`
        UPDATE public.users
        SET liga_id = ${ligaId}, updated_at = now()
        WHERE id = ${user.id}::uuid
      `;

      const unlocked = [];
      const achJoin = await concederConquista(sql, user.id, 'entrou_liga');
      if (achJoin) unlocked.push(achJoin);

      return jsonResponse({ liga_id: ligaId, nome: liga.nome, unlocked_achievements: unlocked }, 200);
    }

    return errorResponse('Rota de liga não encontrada.', 404);
  } catch (err) {
    console.error(`Erro em POST /api/leagues/${action}:`, err);
    return errorResponse('Não foi possível concluir a operação na liga.', 500);
  }
}

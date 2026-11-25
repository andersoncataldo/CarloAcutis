import { getSql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/auth.js';
import { errorResponse, jsonResponse } from '../_lib/http.js';
import type { TemporadaPublica } from '../../src/types/api.types';

interface SeasonDbRow {
  id: number;
  titulo: string;
  descricao: string;
  total_perguntas: number;
  pergunta_ids: number[] | null;
  respondidas: number | null;
  acertos: number | null;
}

export async function GET(request?: Request): Promise<Response> {
  try {
    const sql = getSql();
    const sessionUser = request ? await getSessionUser(sql, request) : null;

    const rows = sessionUser
      ? await sql`
          SELECT
            t.id,
            t.titulo,
            t.descricao,
            COUNT(p.id)::int AS total_perguntas,
            COALESCE(
              ARRAY_AGG(p.id ORDER BY p.ordem ASC, p.id ASC) FILTER (WHERE p.id IS NOT NULL),
              ARRAY[]::bigint[]
            ) AS pergunta_ids,
            COUNT(ru.id)::int AS respondidas,
            COUNT(ru.id) FILTER (WHERE ru.acertou = true)::int AS acertos
          FROM public.temporadas t
          LEFT JOIN public.perguntas p
            ON p.temporada_id = t.id AND p.ativa = true
          LEFT JOIN public.respostas_usuario ru
            ON ru.pergunta_id = p.id AND ru.user_id = ${sessionUser.id}::uuid
          WHERE t.ativa = true
          GROUP BY t.id
          ORDER BY t.ordem ASC, t.id ASC
        `
      : await sql`
          SELECT
            t.id,
            t.titulo,
            t.descricao,
            COUNT(p.id)::int AS total_perguntas,
            COALESCE(
              ARRAY_AGG(p.id ORDER BY p.ordem ASC, p.id ASC) FILTER (WHERE p.id IS NOT NULL),
              ARRAY[]::bigint[]
            ) AS pergunta_ids,
            NULL::int AS respondidas,
            NULL::int AS acertos
          FROM public.temporadas t
          LEFT JOIN public.perguntas p
            ON p.temporada_id = t.id AND p.ativa = true
          WHERE t.ativa = true
          GROUP BY t.id
          ORDER BY t.ordem ASC, t.id ASC
        `;

    const temporadas: TemporadaPublica[] = (rows as SeasonDbRow[]).map((r) => ({
      id: Number(r.id),
      titulo: r.titulo,
      descricao: r.descricao,
      total_perguntas: Number(r.total_perguntas ?? 0),
      pergunta_ids: Array.isArray(r.pergunta_ids) ? r.pergunta_ids.map(Number) : [],
      respondidas: r.respondidas !== null && r.respondidas !== undefined ? Number(r.respondidas) : null,
      acertos: r.acertos !== null && r.acertos !== undefined ? Number(r.acertos) : null,
    }));

    return jsonResponse({ temporadas }, 200);
  } catch (err) {
    console.error('Erro em GET /api/quiz/seasons:', err);
    return errorResponse('Não foi possível carregar as temporadas do quiz.', 500);
  }
}

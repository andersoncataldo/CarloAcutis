import { getSql } from '../_lib/db';
import { errorResponse, jsonResponse } from '../_lib/http';
import type { TemporadaPublica } from '../../src/types/api.types';

export async function GET(): Promise<Response> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, titulo, descricao
      FROM public.temporadas
      WHERE ativa = true
      ORDER BY ordem ASC, id ASC
    `;

    const temporadas: TemporadaPublica[] = (rows as Array<{ id: number; titulo: string; descricao: string }>).map(
      (r) => ({
        id: Number(r.id),
        titulo: r.titulo,
        descricao: r.descricao,
      })
    );

    return jsonResponse({ temporadas }, 200);
  } catch (err) {
    console.error('Erro em GET /api/quiz/seasons:', err);
    return errorResponse('Não foi possível carregar as temporadas do quiz.', 500);
  }
}

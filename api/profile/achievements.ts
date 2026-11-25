import { getSql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/auth.js';
import { errorResponse, jsonResponse } from '../_lib/http.js';
import type { ConquistaItem } from '../../src/types/api.types';

export async function GET(request: Request): Promise<Response> {
  try {
    const sql = getSql();
    const user = await getSessionUser(sql, request);
    if (!user) {
      return errorResponse('Usuário não autenticado.', 401);
    }

    const rows = await sql`
      SELECT
        c.id,
        c.codigo,
        c.nome,
        c.descricao,
        c.icone,
        (uc.id IS NOT NULL) AS conquistada
      FROM public.conquistas c
      LEFT JOIN public.usuario_conquistas uc
        ON uc.conquista_id = c.id
       AND uc.user_id = ${user.id}::uuid
      ORDER BY c.id ASC
    `;

    const conquistas: ConquistaItem[] = (
      rows as Array<{
        id: number;
        codigo: string;
        nome: string;
        descricao: string;
        icone: string;
        conquistada: boolean;
      }>
    ).map((row) => ({
      id: Number(row.id),
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      icone: row.icone,
      conquistada: Boolean(row.conquistada),
    }));

    return jsonResponse({ conquistas }, 200);
  } catch (err) {
    console.error('Erro em GET /api/profile/achievements:', err);
    return errorResponse('Não foi possível carregar as conquistas.', 500);
  }
}

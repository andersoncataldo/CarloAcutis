import { getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';
import { errorResponse, jsonResponse, parsePositiveInt } from '../_lib/http';
import type { PerguntaPublica, RespostaUsuarioResumo } from '../../src/types/api.types';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const temporadaId = parsePositiveInt(url.searchParams.get('temporadaId'));
  if (!temporadaId) {
    return errorResponse('Parâmetro temporadaId inválido.', 400);
  }

  try {
    const sql = getSql();

    // Nunca seleciona resposta_correta neste endpoint público/jogador.
    const questionRows = await sql`
      SELECT
        p.id,
        p.texto_pergunta,
        p.opcao_a,
        p.opcao_b,
        p.opcao_c,
        p.opcao_d
      FROM public.perguntas p
      JOIN public.temporadas t ON t.id = p.temporada_id
      WHERE p.temporada_id = ${temporadaId}
        AND p.ativa = true
        AND t.ativa = true
      ORDER BY p.ordem ASC, p.id ASC
    `;

    const perguntas: PerguntaPublica[] = (
      questionRows as Array<{
        id: number;
        texto_pergunta: string;
        opcao_a: string;
        opcao_b: string;
        opcao_c: string;
        opcao_d: string;
      }>
    ).map((q) => ({
      id: Number(q.id),
      texto_pergunta: q.texto_pergunta,
      opcao_a: q.opcao_a,
      opcao_b: q.opcao_b,
      opcao_c: q.opcao_c,
      opcao_d: q.opcao_d,
    }));

    const sessionUser = await getSessionUser(sql, request);
    if (!sessionUser) {
      return jsonResponse({ perguntas, respostas: [], authenticated: false }, 200);
    }

    let respostas: RespostaUsuarioResumo[] = [];
    if (perguntas.length > 0) {
      const perguntaIds = perguntas.map((p) => p.id);
      const answerRows = await sql`
        SELECT pergunta_id, acertou
        FROM public.respostas_usuario
        WHERE user_id = ${sessionUser.id}::uuid
          AND pergunta_id = ANY(${perguntaIds}::bigint[])
      `;
      respostas = (answerRows as Array<{ pergunta_id: number; acertou: boolean }>).map((a) => ({
        pergunta_id: Number(a.pergunta_id),
        acertou: Boolean(a.acertou),
      }));
    }

    return jsonResponse({ perguntas, respostas, authenticated: true }, 200);
  } catch (err) {
    console.error('Erro em GET /api/quiz/questions:', err);
    return errorResponse('Não foi possível carregar as perguntas desta temporada.', 500);
  }
}

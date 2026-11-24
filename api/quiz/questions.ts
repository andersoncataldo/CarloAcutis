import { getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';
import { selectDailyQuestionIds } from '../_lib/gamification';
import { errorResponse, jsonResponse, parsePositiveInt } from '../_lib/http';
import type { PerguntaPublica, QuizMode, RespostaUsuarioResumo } from '../../src/types/api.types';

interface PublicQuestionRow {
  id: number;
  texto_pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
}

function mapQuestions(rows: PublicQuestionRow[]): PerguntaPublica[] {
  return rows.map((q) => ({
    id: Number(q.id),
    texto_pergunta: q.texto_pergunta,
    opcao_a: q.opcao_a,
    opcao_b: q.opcao_b,
    opcao_c: q.opcao_c,
    opcao_d: q.opcao_d,
  }));
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rawMode = (url.searchParams.get('mode') ?? 'season').trim().toLowerCase();
  const mode: QuizMode =
    rawMode === 'daily' || rawMode === 'lightning' ? rawMode : 'season';

  try {
    const sql = getSql();

    if (mode === 'daily') {
      const dateUtc = new Date().toISOString().slice(0, 10);
      // Nunca seleciona resposta_correta nem explicacao.
      const allActiveRows = await sql`
        SELECT
          p.id,
          p.texto_pergunta,
          p.opcao_a,
          p.opcao_b,
          p.opcao_c,
          p.opcao_d
        FROM public.perguntas p
        JOIN public.temporadas t ON t.id = p.temporada_id
        WHERE p.ativa = true AND t.ativa = true
        ORDER BY p.id ASC
      `;

      const mapped = mapQuestions(allActiveRows as PublicQuestionRow[]);
      const selectedIds = selectDailyQuestionIds(
        mapped.map((q) => q.id),
        dateUtc,
        3
      );
      const byId = new Map(mapped.map((q) => [q.id, q]));
      const perguntas = selectedIds
        .map((id) => byId.get(id))
        .filter((q): q is PerguntaPublica => Boolean(q));

      const sessionUser = await getSessionUser(sql, request);
      return jsonResponse(
        {
          perguntas,
          respostas: [],
          authenticated: Boolean(sessionUser),
          mode: 'daily',
          date_utc: dateUtc,
        },
        200
      );
    }

    if (mode === 'lightning') {
      // Até 10 perguntas ativas em ordem aleatória (sem gabarito nem explicação).
      const rows = await sql`
        SELECT
          p.id,
          p.texto_pergunta,
          p.opcao_a,
          p.opcao_b,
          p.opcao_c,
          p.opcao_d
        FROM public.perguntas p
        JOIN public.temporadas t ON t.id = p.temporada_id
        WHERE p.ativa = true AND t.ativa = true
        ORDER BY random()
        LIMIT 10
      `;

      const sessionUser = await getSessionUser(sql, request);
      return jsonResponse(
        {
          perguntas: mapQuestions(rows as PublicQuestionRow[]),
          respostas: [],
          authenticated: Boolean(sessionUser),
          mode: 'lightning',
        },
        200
      );
    }

    // Modo padrão: temporada específica
    const temporadaId = parsePositiveInt(url.searchParams.get('temporadaId'));
    if (!temporadaId) {
      return errorResponse('Parâmetro temporadaId inválido.', 400);
    }

    // Nunca seleciona resposta_correta nem explicacao neste endpoint.
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

    const perguntas = mapQuestions(questionRows as PublicQuestionRow[]);
    const sessionUser = await getSessionUser(sql, request);

    if (!sessionUser) {
      return jsonResponse(
        { perguntas, respostas: [], authenticated: false, mode: 'season' },
        200
      );
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

    return jsonResponse(
      { perguntas, respostas, authenticated: true, mode: 'season' },
      200
    );
  } catch (err) {
    console.error('Erro em GET /api/quiz/questions:', err);
    return errorResponse('Não foi possível carregar as perguntas do quiz.', 500);
  }
}

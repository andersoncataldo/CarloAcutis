import { getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';
import { calcularTitulo, concederConquista, registrarAcessoDiario } from '../_lib/gamification';
import { errorResponse, jsonResponse, parseJsonBody, parsePositiveInt } from '../_lib/http';
import type { AnswerOption, ResponderPerguntaResult } from '../../src/types/api.types';

const VALID_OPTIONS = new Set<AnswerOption>(['A', 'B', 'C', 'D']);

export async function POST(request: Request): Promise<Response> {
  const body = await parseJsonBody<{ perguntaId?: unknown; resposta?: unknown }>(request);
  if (!body) {
    return errorResponse('Corpo da requisição inválido.', 400);
  }

  const perguntaId = parsePositiveInt(body.perguntaId);
  const respostaLimpa =
    typeof body.resposta === 'string' ? body.resposta.trim().toUpperCase() : '';

  if (!perguntaId) {
    return errorResponse('Identificador da pergunta inválido.', 400);
  }

  if (!VALID_OPTIONS.has(respostaLimpa as AnswerOption)) {
    return errorResponse('Resposta inválida. Deve ser A, B, C ou D.', 400);
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT
        p.resposta_correta,
        p.temporada_id,
        p.ativa AS pergunta_ativa,
        t.ativa AS temporada_ativa
      FROM public.perguntas p
      JOIN public.temporadas t ON t.id = p.temporada_id
      WHERE p.id = ${perguntaId}
      LIMIT 1
    `;

    const pergunta = rows[0] as
      | {
          resposta_correta: string;
          temporada_id: number;
          pergunta_ativa: boolean;
          temporada_ativa: boolean;
        }
      | undefined;

    if (!pergunta) {
      return errorResponse('Pergunta não encontrada.', 404);
    }

    if (!pergunta.pergunta_ativa || !pergunta.temporada_ativa) {
      return errorResponse('Esta pergunta não está mais disponível.', 400);
    }

    const isCorrect = pergunta.resposta_correta.trim().toUpperCase() === respostaLimpa;
    const sessionUser = await getSessionUser(sql, request);

    // Modo visitante: valida no servidor sem expor gabarito e sem gravar no banco.
    if (!sessionUser) {
      const guestResult: ResponderPerguntaResult = {
        correct: isCorrect,
        first_attempt: true,
        xp_gained: isCorrect ? 100 : 0,
        xp: null,
        nivel: null,
        guest: true,
      };
      return jsonResponse(guestResult, 200);
    }

    // Modo autenticado: registro atômico da primeira tentativa via constraint UNIQUE (user_id, pergunta_id).
    const inserted = await sql`
      INSERT INTO public.respostas_usuario (user_id, pergunta_id, resposta_dada, acertou)
      VALUES (${sessionUser.id}::uuid, ${perguntaId}, ${respostaLimpa}, ${isCorrect})
      ON CONFLICT (user_id, pergunta_id) DO NOTHING
      RETURNING id
    `;

    const isFirstAttempt = inserted.length > 0;
    let currentXp = sessionUser.xp;
    let xpGained = 0;

    if (isFirstAttempt) {
      if (isCorrect) {
        xpGained = 100;
        const updated = await sql`
          UPDATE public.users
          SET xp = xp + 100, updated_at = now()
          WHERE id = ${sessionUser.id}::uuid
          RETURNING xp
        `;
        currentXp = Number((updated[0] as { xp: number } | undefined)?.xp ?? sessionUser.xp + 100);

        await concederConquista(sql, sessionUser.id, 'primeira_resposta');
      }

      // Verifica se concluiu todas as perguntas ativas da temporada.
      const seasonProgress = await sql`
        SELECT
          (SELECT COUNT(*)::int FROM public.perguntas WHERE temporada_id = ${Number(pergunta.temporada_id)} AND ativa = true) AS total_perguntas,
          (SELECT COUNT(*)::int
             FROM public.respostas_usuario ru
             JOIN public.perguntas p ON p.id = ru.pergunta_id
            WHERE ru.user_id = ${sessionUser.id}::uuid
              AND p.temporada_id = ${Number(pergunta.temporada_id)}
              AND p.ativa = true) AS total_respondidas
      `;
      const counts = seasonProgress[0] as
        | { total_perguntas: number; total_respondidas: number }
        | undefined;
      if (
        counts &&
        Number(counts.total_perguntas) > 0 &&
        Number(counts.total_respondidas) >= Number(counts.total_perguntas)
      ) {
        await concederConquista(sql, sessionUser.id, 'temporada_completa');
      }

      await registrarAcessoDiario(sql, sessionUser.id);
    }

    const result: ResponderPerguntaResult = {
      correct: isCorrect,
      first_attempt: isFirstAttempt,
      xp_gained: xpGained,
      xp: currentXp,
      nivel: calcularTitulo(currentXp),
      guest: false,
    };

    return jsonResponse(result, 200);
  } catch (err) {
    console.error('Erro em POST /api/quiz/answer:', err);
    return errorResponse('Não foi possível registrar sua resposta. Tente novamente.', 500);
  }
}

import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';
import {
  errorResponse,
  getLastPathSegment,
  jsonResponse,
  parseJsonBody,
  parsePositiveInt,
} from '../_lib/http';
import type { AnswerOption, PerguntaAdmin, TemporadaAdmin, UserProfile } from '../../src/types/api.types';

const VALID_OPTIONS = new Set<AnswerOption>(['A', 'B', 'C', 'D']);
const MAX_TITULO_TEMPORADA = 100;
const MAX_TEXTO_PERGUNTA = 300;
const MAX_OPCAO = 150;
const MAX_EXPLICACAO = 500;

async function requireAdmin(
  sql: NeonQueryFunction<false, false>,
  request: Request
): Promise<{ user: UserProfile } | { response: Response }> {
  const user = await getSessionUser(sql, request);
  if (!user) {
    return { response: errorResponse('Usuário não autenticado.', 401) };
  }
  if (user.role !== 'admin') {
    return { response: errorResponse('Acesso restrito a administradores.', 403) };
  }
  return { user };
}

async function recordAudit(
  sql: NeonQueryFunction<false, false>,
  adminId: string,
  acao: 'INSERT' | 'UPDATE',
  entidade: 'temporadas' | 'perguntas',
  entidadeId: number,
  valoresAntigos: Record<string, unknown> | null,
  valoresNovos: Record<string, unknown>
): Promise<void> {
  await sql`
    INSERT INTO public.auditoria_admin (admin_id, acao, entidade, entidade_id, valores_antigos, valores_novos)
    VALUES (
      ${adminId}::uuid,
      ${acao},
      ${entidade},
      ${String(entidadeId)},
      ${valoresAntigos ? JSON.stringify(valoresAntigos) : null}::jsonb,
      ${JSON.stringify(valoresNovos)}::jsonb
    )
  `;
}

export async function GET(request: Request): Promise<Response> {
  const resource = getLastPathSegment(request);

  try {
    const sql = getSql();
    const auth = await requireAdmin(sql, request);
    if ('response' in auth) return auth.response;

    if (resource === 'seasons') {
      const rows = await sql`
        SELECT id, titulo, descricao, ordem, ativa
        FROM public.temporadas
        ORDER BY ordem ASC, id ASC
      `;
      const temporadas: TemporadaAdmin[] = (rows as TemporadaAdmin[]).map((t) => ({
        id: Number(t.id),
        titulo: t.titulo,
        descricao: t.descricao,
        ordem: Number(t.ordem),
        ativa: Boolean(t.ativa),
      }));
      return jsonResponse({ temporadas }, 200);
    }

    if (resource === 'questions') {
      const temporadaId = parsePositiveInt(new URL(request.url).searchParams.get('temporadaId'));
      if (!temporadaId) {
        return errorResponse('Parâmetro temporadaId inválido.', 400);
      }

      const rows = await sql`
        SELECT
          id,
          temporada_id,
          texto_pergunta,
          opcao_a,
          opcao_b,
          opcao_c,
          opcao_d,
          resposta_correta,
          explicacao,
          ordem,
          ativa
        FROM public.perguntas
        WHERE temporada_id = ${temporadaId}
        ORDER BY ordem ASC, id ASC
      `;

      const perguntas: PerguntaAdmin[] = (rows as PerguntaAdmin[]).map((p) => ({
        id: Number(p.id),
        temporada_id: Number(p.temporada_id),
        texto_pergunta: p.texto_pergunta,
        opcao_a: p.opcao_a,
        opcao_b: p.opcao_b,
        opcao_c: p.opcao_c,
        opcao_d: p.opcao_d,
        resposta_correta: p.resposta_correta.trim().toUpperCase() as AnswerOption,
        explicacao: p.explicacao ?? '',
        ordem: Number(p.ordem),
        ativa: Boolean(p.ativa),
      }));
      return jsonResponse({ perguntas }, 200);
    }

    return errorResponse('Recurso administrativo não encontrado.', 404);
  } catch (err) {
    console.error(`Erro em GET /api/admin/${resource}:`, err);
    return errorResponse('Erro ao carregar dados administrativos.', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const resource = getLastPathSegment(request);

  try {
    const sql = getSql();
    const auth = await requireAdmin(sql, request);
    if ('response' in auth) return auth.response;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    if (!body) {
      return errorResponse('Corpo da requisição inválido.', 400);
    }

    if (resource === 'seasons') {
      const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : '';
      const descricao = typeof body.descricao === 'string' ? body.descricao.trim() : '';
      const ordem = parsePositiveInt(body.ordem) ?? 1;

      if (!titulo) return errorResponse('O título da temporada não pode ficar vazio.', 400);
      if (titulo.length > MAX_TITULO_TEMPORADA) {
        return errorResponse(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 400);
      }

      const inserted = await sql`
        INSERT INTO public.temporadas (titulo, descricao, ordem, ativa)
        VALUES (${titulo}, ${descricao}, ${ordem}, true)
        RETURNING id, titulo, descricao, ordem, ativa
      `;
      const created = inserted[0] as TemporadaAdmin;
      const result: TemporadaAdmin = {
        id: Number(created.id),
        titulo: created.titulo,
        descricao: created.descricao,
        ordem: Number(created.ordem),
        ativa: Boolean(created.ativa),
      };

      await recordAudit(sql, auth.user.id, 'INSERT', 'temporadas', result.id, null, { ...result });
      return jsonResponse({ temporada: result }, 201);
    }

    if (resource === 'questions') {
      const temporadaId = parsePositiveInt(body.temporada_id);
      const texto = typeof body.texto_pergunta === 'string' ? body.texto_pergunta.trim() : '';
      const opcaoA = typeof body.opcao_a === 'string' ? body.opcao_a.trim() : '';
      const opcaoB = typeof body.opcao_b === 'string' ? body.opcao_b.trim() : '';
      const opcaoC = typeof body.opcao_c === 'string' ? body.opcao_c.trim() : '';
      const opcaoD = typeof body.opcao_d === 'string' ? body.opcao_d.trim() : '';
      const resposta =
        typeof body.resposta_correta === 'string'
          ? body.resposta_correta.trim().toUpperCase()
          : '';
      const explicacao = typeof body.explicacao === 'string' ? body.explicacao.trim() : '';
      const ordem = parsePositiveInt(body.ordem) ?? 1;

      if (!temporadaId) return errorResponse('Temporada inválida.', 400);
      if (!texto || !opcaoA || !opcaoB || !opcaoC || !opcaoD) {
        return errorResponse('Preencha todos os campos da pergunta.', 400);
      }
      if (texto.length > MAX_TEXTO_PERGUNTA) {
        return errorResponse(`A pergunta está muito longa (máx. ${MAX_TEXTO_PERGUNTA} caracteres).`, 400);
      }
      if ([opcaoA, opcaoB, opcaoC, opcaoD].some((o) => o.length > MAX_OPCAO)) {
        return errorResponse(`Cada opção pode ter no máximo ${MAX_OPCAO} caracteres.`, 400);
      }
      if (explicacao.length > MAX_EXPLICACAO) {
        return errorResponse(`A explicação pode ter no máximo ${MAX_EXPLICACAO} caracteres.`, 400);
      }
      if (!VALID_OPTIONS.has(resposta as AnswerOption)) {
        return errorResponse('A resposta correta precisa ser A, B, C ou D.', 400);
      }

      const inserted = await sql`
        INSERT INTO public.perguntas (
          temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, ordem, ativa
        )
        VALUES (
          ${temporadaId}, ${texto}, ${opcaoA}, ${opcaoB}, ${opcaoC}, ${opcaoD}, ${resposta}, ${explicacao}, ${ordem}, true
        )
        RETURNING id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, ordem, ativa
      `;
      const created = inserted[0] as PerguntaAdmin;
      const result: PerguntaAdmin = {
        id: Number(created.id),
        temporada_id: Number(created.temporada_id),
        texto_pergunta: created.texto_pergunta,
        opcao_a: created.opcao_a,
        opcao_b: created.opcao_b,
        opcao_c: created.opcao_c,
        opcao_d: created.opcao_d,
        resposta_correta: created.resposta_correta.trim().toUpperCase() as AnswerOption,
        explicacao: created.explicacao ?? '',
        ordem: Number(created.ordem),
        ativa: Boolean(created.ativa),
      };

      await recordAudit(sql, auth.user.id, 'INSERT', 'perguntas', result.id, null, { ...result });
      return jsonResponse({ pergunta: result }, 201);
    }

    return errorResponse('Recurso administrativo não encontrado.', 404);
  } catch (err) {
    console.error(`Erro em POST /api/admin/${resource}:`, err);
    return errorResponse('Não foi possível criar o registro.', 500);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const resource = getLastPathSegment(request);

  try {
    const sql = getSql();
    const auth = await requireAdmin(sql, request);
    if ('response' in auth) return auth.response;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    if (!body) {
      return errorResponse('Corpo da requisição inválido.', 400);
    }

    const id = parsePositiveInt(body.id);
    if (!id) {
      return errorResponse('Identificador inválido.', 400);
    }

    if (resource === 'seasons') {
      const existingRows = await sql`
        SELECT id, titulo, descricao, ordem, ativa
        FROM public.temporadas
        WHERE id = ${id}
        LIMIT 1
      `;
      const existing = existingRows[0] as TemporadaAdmin | undefined;
      if (!existing) {
        return errorResponse('Temporada não encontrada.', 404);
      }

      const titulo =
        typeof body.titulo === 'string' ? body.titulo.trim() : existing.titulo;
      const descricao =
        typeof body.descricao === 'string' ? body.descricao.trim() : existing.descricao;
      const ordem =
        body.ordem !== undefined ? (parsePositiveInt(body.ordem) ?? Number(existing.ordem)) : Number(existing.ordem);
      const ativa = typeof body.ativa === 'boolean' ? body.ativa : Boolean(existing.ativa);

      if (!titulo) return errorResponse('O título da temporada não pode ficar vazio.', 400);
      if (titulo.length > MAX_TITULO_TEMPORADA) {
        return errorResponse(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 400);
      }

      const updatedRows = await sql`
        UPDATE public.temporadas
        SET titulo = ${titulo}, descricao = ${descricao}, ordem = ${ordem}, ativa = ${ativa}
        WHERE id = ${id}
        RETURNING id, titulo, descricao, ordem, ativa
      `;
      const updated = updatedRows[0] as TemporadaAdmin;
      const result: TemporadaAdmin = {
        id: Number(updated.id),
        titulo: updated.titulo,
        descricao: updated.descricao,
        ordem: Number(updated.ordem),
        ativa: Boolean(updated.ativa),
      };

      await recordAudit(
        sql,
        auth.user.id,
        'UPDATE',
        'temporadas',
        result.id,
        { ...existing },
        { ...result }
      );
      return jsonResponse({ temporada: result }, 200);
    }

    if (resource === 'questions') {
      const existingRows = await sql`
        SELECT id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, ordem, ativa
        FROM public.perguntas
        WHERE id = ${id}
        LIMIT 1
      `;
      const existing = existingRows[0] as PerguntaAdmin | undefined;
      if (!existing) {
        return errorResponse('Pergunta não encontrada.', 404);
      }

      const texto =
        typeof body.texto_pergunta === 'string' ? body.texto_pergunta.trim() : existing.texto_pergunta;
      const opcaoA =
        typeof body.opcao_a === 'string' ? body.opcao_a.trim() : existing.opcao_a;
      const opcaoB =
        typeof body.opcao_b === 'string' ? body.opcao_b.trim() : existing.opcao_b;
      const opcaoC =
        typeof body.opcao_c === 'string' ? body.opcao_c.trim() : existing.opcao_c;
      const opcaoD =
        typeof body.opcao_d === 'string' ? body.opcao_d.trim() : existing.opcao_d;
      const resposta =
        typeof body.resposta_correta === 'string'
          ? body.resposta_correta.trim().toUpperCase()
          : existing.resposta_correta.trim().toUpperCase();
      const explicacao =
        typeof body.explicacao === 'string' ? body.explicacao.trim() : (existing.explicacao ?? '');
      const ordem =
        body.ordem !== undefined ? (parsePositiveInt(body.ordem) ?? Number(existing.ordem)) : Number(existing.ordem);
      const ativa = typeof body.ativa === 'boolean' ? body.ativa : Boolean(existing.ativa);

      if (!texto || !opcaoA || !opcaoB || !opcaoC || !opcaoD) {
        return errorResponse('Preencha todos os campos da pergunta.', 400);
      }
      if (texto.length > MAX_TEXTO_PERGUNTA) {
        return errorResponse(`A pergunta está muito longa (máx. ${MAX_TEXTO_PERGUNTA} caracteres).`, 400);
      }
      if ([opcaoA, opcaoB, opcaoC, opcaoD].some((o) => o.length > MAX_OPCAO)) {
        return errorResponse(`Cada opção pode ter no máximo ${MAX_OPCAO} caracteres.`, 400);
      }
      if (explicacao.length > MAX_EXPLICACAO) {
        return errorResponse(`A explicação pode ter no máximo ${MAX_EXPLICACAO} caracteres.`, 400);
      }
      if (!VALID_OPTIONS.has(resposta as AnswerOption)) {
        return errorResponse('A resposta correta precisa ser A, B, C ou D.', 400);
      }

      const updatedRows = await sql`
        UPDATE public.perguntas
        SET
          texto_pergunta = ${texto},
          opcao_a = ${opcaoA},
          opcao_b = ${opcaoB},
          opcao_c = ${opcaoC},
          opcao_d = ${opcaoD},
          resposta_correta = ${resposta},
          explicacao = ${explicacao},
          ordem = ${ordem},
          ativa = ${ativa}
        WHERE id = ${id}
        RETURNING id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, ordem, ativa
      `;
      const updated = updatedRows[0] as PerguntaAdmin;
      const result: PerguntaAdmin = {
        id: Number(updated.id),
        temporada_id: Number(updated.temporada_id),
        texto_pergunta: updated.texto_pergunta,
        opcao_a: updated.opcao_a,
        opcao_b: updated.opcao_b,
        opcao_c: updated.opcao_c,
        opcao_d: updated.opcao_d,
        resposta_correta: updated.resposta_correta.trim().toUpperCase() as AnswerOption,
        explicacao: updated.explicacao ?? '',
        ordem: Number(updated.ordem),
        ativa: Boolean(updated.ativa),
      };

      await recordAudit(
        sql,
        auth.user.id,
        'UPDATE',
        'perguntas',
        result.id,
        { ...existing },
        { ...result }
      );
      return jsonResponse({ pergunta: result }, 200);
    }

    return errorResponse('Recurso administrativo não encontrado.', 404);
  } catch (err) {
    console.error(`Erro em PATCH /api/admin/${resource}:`, err);
    return errorResponse('Não foi possível atualizar o registro.', 500);
  }
}

// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as answerPost } from './quiz/answer';
import { GET as questionsGet } from './quiz/questions';
import { GET as leaguesGet, POST as leaguesPost } from './leagues/[action]';
import { GET as adminGet } from './admin/[resource]';

const { sqlResponses, mockSql } = vi.hoisted(() => {
  const responses: unknown[][] = [];
  const fn = vi.fn(async () => {
    return responses.shift() ?? [];
  });
  return { sqlResponses: responses, mockSql: fn };
});

vi.mock('./_lib/db', () => ({
  getSql: () => mockSql,
}));

const VALID_COOKIE = `carlo_session=${'a'.repeat(64)}`;

describe('API handlers — segurança, quiz visitante/logado, ligas e admin', () => {
  beforeEach(() => {
    sqlResponses.length = 0;
    mockSql.mockClear();
  });

  it('rejeita alternativa inválida fora de A–D em POST /api/quiz/answer', async () => {
    const req = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaId: 1, resposta: 'E' }),
    });
    const res = await answerPost(req);
    expect(res.status).toBe(400);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('valida resposta em modo visitante sem gravar no banco', async () => {
    sqlResponses.push([
      { resposta_correta: 'B', temporada_id: 1, pergunta_ativa: true, temporada_ativa: true },
    ]);

    const req = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaId: 1, resposta: 'b' }),
    });
    const res = await answerPost(req);
    const data = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(data).toEqual({
      correct: true,
      first_attempt: true,
      xp_gained: 100,
      xp: null,
      nivel: null,
      guest: true,
    });
    // Apenas 1 query (leitura da pergunta); nenhum INSERT/UPDATE em respostas_usuario ou users.
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('rejeita pergunta arquivada/inativa com status 400', async () => {
    sqlResponses.push([
      { resposta_correta: 'B', temporada_id: 1, pergunta_ativa: false, temporada_ativa: true },
    ]);

    const req = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaId: 1, resposta: 'B' }),
    });
    const res = await answerPost(req);
    expect(res.status).toBe(400);
  });

  it('concede +100 XP na primeira tentativa correta de usuário autenticado e 0 na repetida', async () => {
    // 1) Busca pergunta
    sqlResponses.push([
      { resposta_correta: 'A', temporada_id: 1, pergunta_ativa: true, temporada_ativa: true },
    ]);
    // 2) getSessionUser
    sqlResponses.push([
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'João',
        email: 'joao@exemplo.com',
        xp: 400,
        role: 'user',
        liga_id: null,
        liga_nome: null,
        liga_criado_por: null,
        liga_codigo_acesso: null,
      },
    ]);
    // 3) INSERT respostas_usuario RETURNING id
    sqlResponses.push([{ id: 99 }]);
    // 4) UPDATE users RETURNING xp
    sqlResponses.push([{ xp: 500 }]);
    // 5) concederConquista primeira_resposta
    sqlResponses.push([]);
    // 6) seasonProgress
    sqlResponses.push([{ total_perguntas: 5, total_respondidas: 1 }]);
    // 7) registrarAcessoDiario
    sqlResponses.push([{ streak_atual: 1, maior_streak: 1 }]);

    const req1 = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: VALID_COOKIE },
      body: JSON.stringify({ perguntaId: 3, resposta: 'A' }),
    });
    const res1 = await answerPost(req1);
    const data1 = (await res1.json()) as Record<string, unknown>;

    expect(res1.status).toBe(200);
    expect(data1).toEqual({
      correct: true,
      first_attempt: true,
      xp_gained: 100,
      xp: 500,
      nivel: 'Aprendiz da Fé',
      guest: false,
    });

    // Segunda tentativa na mesma pergunta: INSERT ON CONFLICT DO NOTHING retorna []
    sqlResponses.push([
      { resposta_correta: 'A', temporada_id: 1, pergunta_ativa: true, temporada_ativa: true },
    ]);
    sqlResponses.push([
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'João',
        email: 'joao@exemplo.com',
        xp: 500,
        role: 'user',
        liga_id: null,
        liga_nome: null,
        liga_criado_por: null,
        liga_codigo_acesso: null,
      },
    ]);
    sqlResponses.push([]);

    const req2 = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: VALID_COOKIE },
      body: JSON.stringify({ perguntaId: 3, resposta: 'A' }),
    });
    const res2 = await answerPost(req2);
    const data2 = (await res2.json()) as Record<string, unknown>;

    expect(res2.status).toBe(200);
    expect(data2.first_attempt).toBe(false);
    expect(data2.xp_gained).toBe(0);
    expect(data2.xp).toBe(500);
  });

  it('nunca expõe resposta_correta em GET /api/quiz/questions', async () => {
    sqlResponses.push([
      {
        id: 1,
        texto_pergunta: 'Em qual cidade Carlo Acutis nasceu?',
        opcao_a: 'Milão',
        opcao_b: 'Londres',
        opcao_c: 'Roma',
        opcao_d: 'Assis',
      },
    ]);

    const req = new Request('http://localhost/api/quiz/questions?temporadaId=1');
    const res = await questionsGet(req);
    const data = (await res.json()) as { perguntas: Array<Record<string, unknown>>; authenticated: boolean };

    expect(res.status).toBe(200);
    expect(data.authenticated).toBe(false);
    expect(data.perguntas).toHaveLength(1);
    expect(data.perguntas[0]).not.toHaveProperty('resposta_correta');
  });

  it('bloqueia ranking de liga sem sessão (401) e omite e-mails quando autenticado', async () => {
    const unauthRes = await leaguesGet(new Request('http://localhost/api/leagues/ranking'));
    expect(unauthRes.status).toBe(401);

    // Usuário autenticado em liga 7
    sqlResponses.push([
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Maria',
        email: 'maria@exemplo.com',
        xp: 600,
        role: 'user',
        liga_id: 7,
        liga_nome: 'Paróquia São José',
        liga_criado_por: 'outro-usuario',
        liga_codigo_acesso: 'SECRETO1',
      },
    ]);
    sqlResponses.push([{ id: 'u1', nome: 'Maria', xp: 600 }]);

    const authRes = await leaguesGet(
      new Request('http://localhost/api/leagues/ranking', { headers: { Cookie: VALID_COOKIE } })
    );
    const data = (await authRes.json()) as { ranking: Array<Record<string, unknown>> };
    expect(authRes.status).toBe(200);
    expect(data.ranking[0]).toEqual({ id: 'u1', nome: 'Maria', xp: 600, nivel: 'Aprendiz da Fé' });
    expect(data.ranking[0]).not.toHaveProperty('email');
  });

  it('impõe limite de 3 ligas criadas por usuário', async () => {
    sqlResponses.push([
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Pedro',
        email: 'pedro@exemplo.com',
        xp: 100,
        role: 'user',
        liga_id: null,
        liga_nome: null,
        liga_criado_por: null,
        liga_codigo_acesso: null,
      },
    ]);
    sqlResponses.push([{ total: 3 }]);

    const res = await leaguesPost(
      new Request('http://localhost/api/leagues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: VALID_COOKIE },
        body: JSON.stringify({ nome: 'Quarta Liga' }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('rejeita acesso ao painel admin para usuário comum (403)', async () => {
    sqlResponses.push([
      {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Comum',
        email: 'comum@exemplo.com',
        xp: 100,
        role: 'user',
        liga_id: null,
        liga_nome: null,
        liga_criado_por: null,
        liga_codigo_acesso: null,
      },
    ]);

    const res = await adminGet(
      new Request('http://localhost/api/admin/seasons', { headers: { Cookie: VALID_COOKIE } })
    );
    expect(res.status).toBe(403);
  });
});

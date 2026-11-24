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

describe('API handlers — segurança, Quiz 2.0 (explicação, daily, lightning, conquistas), ligas e admin', () => {
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

  it('valida resposta em modo visitante retornando correct_option e explicacao sem gravar no banco', async () => {
    sqlResponses.push([
      {
        resposta_correta: 'B',
        explicacao: 'Carlo nasceu em Londres em 3 de maio de 1991.',
        temporada_id: 1,
        pergunta_ativa: true,
        temporada_ativa: true,
      },
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
      correct_option: 'B',
      explicacao: 'Carlo nasceu em Londres em 3 de maio de 1991.',
      first_attempt: true,
      xp_gained: 100,
      xp: null,
      nivel: null,
      previous_nivel: null,
      leveled_up: false,
      unlocked_achievements: [],
      guest: true,
      mode: 'season',
    });
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('valida Modo Relâmpago sem gravar em respostas_usuario nem conceder XP infinito', async () => {
    sqlResponses.push([
      {
        resposta_correta: 'C',
        explicacao: 'Ele criou uma exposição virtual dos Milagres Eucarísticos.',
        temporada_id: 2,
        pergunta_ativa: true,
        temporada_ativa: true,
      },
    ]);
    sqlResponses.push([]); // getSessionUser (visitante)

    const req = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaId: 6, resposta: 'C', mode: 'lightning' }),
    });
    const res = await answerPost(req);
    const data = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(data.correct).toBe(true);
    expect(data.correct_option).toBe('C');
    expect(data.xp_gained).toBe(0);
    expect(data.mode).toBe('lightning');
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('rejeita pergunta arquivada/inativa com status 400', async () => {
    sqlResponses.push([
      {
        resposta_correta: 'B',
        explicacao: '',
        temporada_id: 1,
        pergunta_ativa: false,
        temporada_ativa: true,
      },
    ]);

    const req = new Request('http://localhost/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaId: 1, resposta: 'B' }),
    });
    const res = await answerPost(req);
    expect(res.status).toBe(400);
  });

  it('concede +100 XP, detecta level-up e retorna conquista recém-desbloqueada na 1ª tentativa', async () => {
    sqlResponses.push([
      {
        resposta_correta: 'A',
        explicacao: 'Primeira Comunhão aos 7 anos.',
        temporada_id: 1,
        pergunta_ativa: true,
        temporada_ativa: true,
      },
    ]);
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
    sqlResponses.push([{ id: 99 }]); // INSERT respostas_usuario
    sqlResponses.push([{ xp: 500 }]); // UPDATE users
    sqlResponses.push([
      {
        codigo: 'primeira_resposta',
        nome: 'Primeiro Passo',
        descricao: 'Acertou sua primeira pergunta no quiz',
        icone: '🌱',
      },
    ]); // concederConquista
    sqlResponses.push([{ total_perguntas: 5, total_respondidas: 1 }]); // seasonProgress
    sqlResponses.push([{ streak_atual: 1, maior_streak: 1 }]); // registrarAcessoDiario

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
      correct_option: 'A',
      explicacao: 'Primeira Comunhão aos 7 anos.',
      first_attempt: true,
      xp_gained: 100,
      xp: 500,
      nivel: 'Aprendiz da Fé',
      previous_nivel: 'Peregrino',
      leveled_up: true,
      unlocked_achievements: [
        {
          codigo: 'primeira_resposta',
          nome: 'Primeiro Passo',
          descricao: 'Acertou sua primeira pergunta no quiz',
          icone: '🌱',
        },
      ],
      guest: false,
      mode: 'season',
    });
  });

  it('nunca expõe resposta_correta nem explicacao em GET /api/quiz/questions (temporada e daily)', async () => {
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
    const data = (await res.json()) as { perguntas: Array<Record<string, unknown>>; mode: string };

    expect(res.status).toBe(200);
    expect(data.mode).toBe('season');
    expect(data.perguntas[0]).not.toHaveProperty('resposta_correta');
    expect(data.perguntas[0]).not.toHaveProperty('explicacao');

    // Modo daily
    sqlResponses.push([
      { id: 1, texto_pergunta: 'P1', opcao_a: 'A', opcao_b: 'B', opcao_c: 'C', opcao_d: 'D' },
      { id: 2, texto_pergunta: 'P2', opcao_a: 'A', opcao_b: 'B', opcao_c: 'C', opcao_d: 'D' },
      { id: 3, texto_pergunta: 'P3', opcao_a: 'A', opcao_b: 'B', opcao_c: 'C', opcao_d: 'D' },
      { id: 4, texto_pergunta: 'P4', opcao_a: 'A', opcao_b: 'B', opcao_c: 'C', opcao_d: 'D' },
    ]);
    const dailyRes = await questionsGet(new Request('http://localhost/api/quiz/questions?mode=daily'));
    const dailyData = (await dailyRes.json()) as {
      perguntas: Array<Record<string, unknown>>;
      mode: string;
      date_utc?: string;
    };
    expect(dailyRes.status).toBe(200);
    expect(dailyData.mode).toBe('daily');
    expect(dailyData.perguntas).toHaveLength(3);
    expect(dailyData.date_utc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bloqueia ranking de liga sem sessão (401) e omite e-mails quando autenticado', async () => {
    const unauthRes = await leaguesGet(new Request('http://localhost/api/leagues/ranking'));
    expect(unauthRes.status).toBe(401);

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

import type {
  AnswerOption,
  AuthMeResponse,
  ConquistaItem,
  LeagueMutationResult,
  PerguntaAdmin,
  QuizMode,
  QuizQuestionsResponse,
  RankingMembro,
  ResponderPerguntaResult,
  TemporadaAdmin,
  TemporadaPublica,
} from '../types/api.types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers,
  });

  let payload: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof (payload as { error: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : 'Não foi possível completar a solicitação. Tente novamente.';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const api = {
  // ---------- Auth ----------
  getMe(signal?: AbortSignal): Promise<AuthMeResponse> {
    return requestJson<AuthMeResponse>('/api/auth/me', { method: 'GET', signal });
  },

  register(input: { nome: string; email: string; password: string }): Promise<AuthMeResponse> {
    return requestJson<AuthMeResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }): Promise<AuthMeResponse> {
    return requestJson<AuthMeResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  // ---------- Quiz ----------
  getSeasons(signal?: AbortSignal): Promise<{ temporadas: TemporadaPublica[] }> {
    return requestJson<{ temporadas: TemporadaPublica[] }>('/api/quiz/seasons', {
      method: 'GET',
      signal,
    });
  },

  getQuizQuestions(temporadaId: number, signal?: AbortSignal): Promise<QuizQuestionsResponse> {
    return requestJson<QuizQuestionsResponse>(
      `/api/quiz/questions?mode=season&temporadaId=${encodeURIComponent(String(temporadaId))}`,
      { method: 'GET', signal }
    );
  },

  getDailyQuestions(signal?: AbortSignal): Promise<QuizQuestionsResponse> {
    return requestJson<QuizQuestionsResponse>('/api/quiz/questions?mode=daily', {
      method: 'GET',
      signal,
    });
  },

  getLightningQuestions(signal?: AbortSignal): Promise<QuizQuestionsResponse> {
    return requestJson<QuizQuestionsResponse>('/api/quiz/questions?mode=lightning', {
      method: 'GET',
      signal,
    });
  },

  answerQuestion(
    perguntaId: number,
    resposta: AnswerOption,
    mode: QuizMode = 'season'
  ): Promise<ResponderPerguntaResult> {
    return requestJson<ResponderPerguntaResult>('/api/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({ perguntaId, resposta, mode }),
    });
  },

  // ---------- Profile & Leagues ----------
  getAchievements(signal?: AbortSignal): Promise<{ conquistas: ConquistaItem[] }> {
    return requestJson<{ conquistas: ConquistaItem[] }>('/api/profile/achievements', {
      method: 'GET',
      signal,
    });
  },

  getLeagueRanking(signal?: AbortSignal): Promise<{ ranking: RankingMembro[] }> {
    return requestJson<{ ranking: RankingMembro[] }>('/api/leagues/ranking', {
      method: 'GET',
      signal,
    });
  },

  createLeague(nome: string): Promise<LeagueMutationResult> {
    return requestJson<LeagueMutationResult>('/api/leagues/create', {
      method: 'POST',
      body: JSON.stringify({ nome }),
    });
  },

  joinLeague(codigo: string): Promise<LeagueMutationResult> {
    return requestJson<LeagueMutationResult>('/api/leagues/join', {
      method: 'POST',
      body: JSON.stringify({ codigo }),
    });
  },

  leaveLeague(): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>('/api/leagues/leave', {
      method: 'POST',
    });
  },

  // ---------- Admin ----------
  getAdminSeasons(): Promise<{ temporadas: TemporadaAdmin[] }> {
    return requestJson<{ temporadas: TemporadaAdmin[] }>('/api/admin/seasons', { method: 'GET' });
  },

  createSeason(input: {
    titulo: string;
    descricao: string;
    ordem: number;
  }): Promise<{ temporada: TemporadaAdmin }> {
    return requestJson<{ temporada: TemporadaAdmin }>('/api/admin/seasons', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateSeason(input: {
    id: number;
    titulo?: string;
    descricao?: string;
    ordem?: number;
    ativa?: boolean;
  }): Promise<{ temporada: TemporadaAdmin }> {
    return requestJson<{ temporada: TemporadaAdmin }>('/api/admin/seasons', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  getAdminQuestions(temporadaId: number): Promise<{ perguntas: PerguntaAdmin[] }> {
    return requestJson<{ perguntas: PerguntaAdmin[] }>(
      `/api/admin/questions?temporadaId=${encodeURIComponent(String(temporadaId))}`,
      { method: 'GET' }
    );
  },

  createQuestion(input: {
    temporada_id: number;
    texto_pergunta: string;
    opcao_a: string;
    opcao_b: string;
    opcao_c: string;
    opcao_d: string;
    resposta_correta: AnswerOption;
    explicacao?: string;
    ordem: number;
  }): Promise<{ pergunta: PerguntaAdmin }> {
    return requestJson<{ pergunta: PerguntaAdmin }>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateQuestion(input: {
    id: number;
    texto_pergunta?: string;
    opcao_a?: string;
    opcao_b?: string;
    opcao_c?: string;
    opcao_d?: string;
    resposta_correta?: AnswerOption;
    explicacao?: string;
    ordem?: number;
    ativa?: boolean;
  }): Promise<{ pergunta: PerguntaAdmin }> {
    return requestJson<{ pergunta: PerguntaAdmin }>('/api/admin/questions', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};

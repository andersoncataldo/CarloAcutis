export type AnswerOption = 'A' | 'B' | 'C' | 'D';
export type UserRole = 'user' | 'admin';

export interface LigaInfo {
  id: number;
  nome: string;
  codigo_acesso?: string | null;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  xp: number;
  nivel: string;
  role: UserRole;
  liga_id: number | null;
  liga: LigaInfo | null;
}

export interface StreakInfo {
  streak_atual: number;
  maior_streak: number;
}

export interface AuthMeResponse {
  user: UserProfile | null;
  streak: StreakInfo | null;
}

export interface TemporadaPublica {
  id: number;
  titulo: string;
  descricao: string;
}

export interface TemporadaAdmin extends TemporadaPublica {
  ordem: number;
  ativa: boolean;
}

export interface PerguntaPublica {
  id: number;
  texto_pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
}

export interface PerguntaAdmin extends PerguntaPublica {
  temporada_id: number;
  resposta_correta: AnswerOption;
  ordem: number;
  ativa: boolean;
}

export interface RespostaUsuarioResumo {
  pergunta_id: number;
  acertou: boolean;
}

export interface QuizQuestionsResponse {
  perguntas: PerguntaPublica[];
  respostas: RespostaUsuarioResumo[];
  authenticated: boolean;
}

export interface ResponderPerguntaResult {
  correct: boolean;
  first_attempt: boolean;
  xp_gained: number;
  xp: number | null;
  nivel: string | null;
  guest: boolean;
}

export interface ConquistaItem {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  conquistada: boolean;
}

export interface RankingMembro {
  id: string;
  nome: string;
  xp: number;
  nivel: string;
}

export interface LeagueMutationResult {
  liga_id: number;
  nome: string;
  codigo_acesso?: string;
}

export interface ApiErrorPayload {
  error: string;
}

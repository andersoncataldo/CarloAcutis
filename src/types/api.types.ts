export type AnswerOption = 'A' | 'B' | 'C' | 'D';
export type UserRole = 'user' | 'admin';
export type QuizMode = 'season' | 'daily' | 'lightning';

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

export interface ConquistaDesbloqueada {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
}

export interface TemporadaPublica {
  id: number;
  titulo: string;
  descricao: string;
  total_perguntas: number;
  pergunta_ids: number[];
  respondidas: number | null;
  acertos: number | null;
}

export interface TemporadaAdmin {
  id: number;
  titulo: string;
  descricao: string;
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
  explicacao: string;
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
  mode: QuizMode;
  date_utc?: string;
}

export interface ResponderPerguntaResult {
  correct: boolean;
  correct_option: AnswerOption;
  explicacao: string;
  first_attempt: boolean;
  xp_gained: number;
  xp: number | null;
  nivel: string | null;
  previous_nivel: string | null;
  leveled_up: boolean;
  unlocked_achievements: ConquistaDesbloqueada[];
  guest: boolean;
  mode: QuizMode;
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
  unlocked_achievements?: ConquistaDesbloqueada[];
}

export interface ApiErrorPayload {
  error: string;
}

import type { RespostaUsuarioResumo } from '../types/api.types';
import { calcularTitulo } from './quiz';

const STORAGE_KEY = 'carlo_guest_progress_v1';

export interface GuestProgressState {
  answers: Record<number, boolean>;
  xp: number;
  streakAtual: number;
  maiorStreak: number;
  ultimoAcesso: string | null;
}

function getTodayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayUtcDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const emptyState: GuestProgressState = {
  answers: {},
  xp: 0,
  streakAtual: 0,
  maiorStreak: 0,
  ultimoAcesso: null,
};

export function loadGuestProgress(): GuestProgressState {
  if (typeof window === 'undefined') return { ...emptyState, answers: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState, answers: {} };
    const parsed = JSON.parse(raw) as Partial<GuestProgressState>;
    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : 0,
      streakAtual: typeof parsed.streakAtual === 'number' ? parsed.streakAtual : 0,
      maiorStreak: typeof parsed.maiorStreak === 'number' ? parsed.maiorStreak : 0,
      ultimoAcesso: typeof parsed.ultimoAcesso === 'string' ? parsed.ultimoAcesso : null,
    };
  } catch {
    return { ...emptyState, answers: {} };
  }
}

function saveGuestProgress(state: GuestProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignora silenciosamente se localStorage estiver bloqueado/cheio
  }
}

export function getGuestAnswersForQuestions(perguntaIds: number[]): RespostaUsuarioResumo[] {
  const state = loadGuestProgress();
  const result: RespostaUsuarioResumo[] = [];
  for (const id of perguntaIds) {
    if (Object.prototype.hasOwnProperty.call(state.answers, id)) {
      result.push({ pergunta_id: id, acertou: Boolean(state.answers[id]) });
    }
  }
  return result;
}

export function recordGuestAnswer(
  perguntaId: number,
  isCorrect: boolean
): { state: GuestProgressState; firstAttempt: boolean; xpGained: number; nivel: string } {
  const state = loadGuestProgress();
  const alreadyAnswered = Object.prototype.hasOwnProperty.call(state.answers, perguntaId);

  let xpGained = 0;
  if (!alreadyAnswered) {
    state.answers[perguntaId] = isCorrect;
    if (isCorrect) {
      xpGained = 100;
      state.xp += 100;
    }
  }

  const today = getTodayUtcDate();
  if (state.ultimoAcesso !== today) {
    if (state.ultimoAcesso === getYesterdayUtcDate()) {
      state.streakAtual += 1;
    } else {
      state.streakAtual = 1;
    }
    state.maiorStreak = Math.max(state.maiorStreak, state.streakAtual);
    state.ultimoAcesso = today;
  }

  saveGuestProgress(state);
  return {
    state,
    firstAttempt: !alreadyAnswered,
    xpGained,
    nivel: calcularTitulo(state.xp),
  };
}

export function resetGuestSeasonProgress(perguntaIds: number[]): GuestProgressState {
  const state = loadGuestProgress();
  for (const id of perguntaIds) {
    delete state.answers[id];
  }
  saveGuestProgress(state);
  return state;
}

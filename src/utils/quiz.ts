// Funções puras extraídas do Quiz.tsx para permitir testes unitários sem
// precisar montar o componente inteiro nem mockar o Supabase.

export interface RespostaResumo {
  pergunta_id: number;
  acertou: boolean;
}

export interface ProgressoCalculado {
  score: number;
  currentIndex: number;
  completed: boolean;
}

/**
 * A partir da lista de perguntas de uma temporada (em ordem) e das
 * respostas já registradas para o usuário, calcula: quantas ele acertou,
 * em qual pergunta ele deve continuar, e se a temporada já foi concluída.
 */
export function calcularProgresso(
  perguntaIds: number[],
  respostas: RespostaResumo[]
): ProgressoCalculado {
  const respondidasIds = new Set(respostas.map(r => r.pergunta_id));
  const acertos = respostas.filter(r => r.acertou).length;
  const proximoIndex = perguntaIds.findIndex(id => !respondidasIds.has(id));

  if (proximoIndex === -1) {
    return {
      score: acertos,
      currentIndex: Math.max(perguntaIds.length - 1, 0),
      completed: perguntaIds.length > 0 && respondidasIds.size === perguntaIds.length,
    };
  }

  return {
    score: acertos,
    currentIndex: proximoIndex,
    completed: false,
  };
}

/** XP concedido por uma resposta: só na primeira tentativa correta. */
export function calcularXpGanho(isCorrect: boolean, isFirstAttempt: boolean, xpPorAcerto = 100): number {
  return isCorrect && isFirstAttempt ? xpPorAcerto : 0;
}

/** Percentual de progresso na barra do quiz (0–100). */
export function progressoPercentual(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (currentIndex / total) * 100));
}

// Fisher-Yates simples para embaralhar a ordem visual das alternativas.
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

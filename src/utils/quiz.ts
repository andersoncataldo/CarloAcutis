// Funções puras extraídas do Quiz e da gamificação para testes unitários
// sem precisar montar componentes nem simular rede.

export interface RespostaResumo {
  pergunta_id: number;
  acertou: boolean;
}

export interface ProgressoCalculado {
  score: number;
  currentIndex: number;
  completed: boolean;
}

export interface ProgressoTitulo {
  tituloAtual: string;
  proximoTitulo: string | null;
  xpAtualNaFaixa: number;
  xpNecessarioNaFaixa: number;
  percentual: number;
  xpFaltante: number;
}

/**
 * Invariante de domínio (openspec/specs/gamification/spec.md):
 * Peregrino (< 500) · Aprendiz da Fé (>= 500) · Discípulo (>= 2000) · Apóstolo (>= 5000).
 */
export function calcularTitulo(xp: number): string {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  if (safeXp >= 5000) return 'Apóstolo';
  if (safeXp >= 2000) return 'Discípulo';
  if (safeXp >= 500) return 'Aprendiz da Fé';
  return 'Peregrino';
}

export function calcularProgressoTitulo(xp: number): ProgressoTitulo {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;

  const faixas = [
    { nome: 'Peregrino', min: 0, max: 500, proximo: 'Aprendiz da Fé' },
    { nome: 'Aprendiz da Fé', min: 500, max: 2000, proximo: 'Discípulo' },
    { nome: 'Discípulo', min: 2000, max: 5000, proximo: 'Apóstolo' },
  ] as const;

  for (const faixa of faixas) {
    if (safeXp < faixa.max) {
      const span = faixa.max - faixa.min;
      const atual = safeXp - faixa.min;
      return {
        tituloAtual: faixa.nome,
        proximoTitulo: faixa.proximo,
        xpAtualNaFaixa: atual,
        xpNecessarioNaFaixa: span,
        percentual: Math.min(100, Math.max(0, (atual / span) * 100)),
        xpFaltante: faixa.max - safeXp,
      };
    }
  }

  return {
    tituloAtual: 'Apóstolo',
    proximoTitulo: null,
    xpAtualNaFaixa: safeXp,
    xpNecessarioNaFaixa: 5000,
    percentual: 100,
    xpFaltante: 0,
  };
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
  const respondidasIds = new Set(respostas.map((r) => r.pergunta_id));
  const acertos = respostas.filter((r) => r.acertou).length;
  const proximoIndex = perguntaIds.findIndex((id) => !respondidasIds.has(id));

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
export function calcularXpGanho(
  isCorrect: boolean,
  isFirstAttempt: boolean,
  xpPorAcerto = 100
): number {
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

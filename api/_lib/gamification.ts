import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { ConquistaDesbloqueada, StreakInfo } from '../../src/types/api.types';

export type AchievementCode =
  | 'primeira_resposta'
  | 'temporada_completa'
  | 'entrou_liga'
  | 'criou_liga'
  | 'streak_7';

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

/**
 * Seleciona deterministicamente `count` IDs de perguntas para a data UTC (`YYYY-MM-DD`).
 * Todos os jogadores recebem exatamente o mesmo conjunto no mesmo dia.
 */
export function selectDailyQuestionIds(
  allIds: number[],
  dateUtc: string,
  count = 3
): number[] {
  if (allIds.length <= count) return [...allIds];

  // Hash FNV-1a 32-bit da data UTC para semente determinística
  let seed = 2166136261;
  for (let i = 0; i < dateUtc.length; i++) {
    seed ^= dateUtc.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  // PRNG Mulberry32 determinístico
  const nextRand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const pool = [...allIds].sort((a, b) => a - b);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Concede conquista de forma idempotente e retorna os detalhes APENAS
 * se ela foi recém-desbloqueada nesta chamada (null se já possuía).
 */
export async function concederConquista(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  codigo: AchievementCode
): Promise<ConquistaDesbloqueada | null> {
  const rows = await sql`
    WITH ins AS (
      INSERT INTO public.usuario_conquistas (user_id, conquista_id)
      SELECT ${userId}::uuid, id
      FROM public.conquistas
      WHERE codigo = ${codigo}
      ON CONFLICT (user_id, conquista_id) DO NOTHING
      RETURNING conquista_id
    )
    SELECT c.codigo, c.nome, c.descricao, c.icone
    FROM ins
    JOIN public.conquistas c ON c.id = ins.conquista_id
  `;

  const row = rows[0] as ConquistaDesbloqueada | undefined;
  if (!row) return null;
  return {
    codigo: row.codigo,
    nome: row.nome,
    descricao: row.descricao,
    icone: row.icone,
  };
}

/**
 * Registra o acesso diário (calendário UTC) de forma idempotente,
 * mantendo o maior streak histórico e concedendo a conquista streak_7 ao atingir 7 dias.
 */
export async function registrarAcessoDiario(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  unlockedCollector?: ConquistaDesbloqueada[]
): Promise<StreakInfo> {
  const rows = await sql`
    WITH hoje AS (
      SELECT (timezone('utc', now()))::date AS d
    ),
    upsert AS (
      INSERT INTO public.streaks (user_id, streak_atual, maior_streak, ultimo_acesso, updated_at)
      SELECT ${userId}::uuid, 1, 1, hoje.d, now()
      FROM hoje
      ON CONFLICT (user_id) DO UPDATE
      SET
        streak_atual = CASE
          WHEN public.streaks.ultimo_acesso = (SELECT d FROM hoje) THEN public.streaks.streak_atual
          WHEN public.streaks.ultimo_acesso = (SELECT d FROM hoje) - INTERVAL '1 day' THEN public.streaks.streak_atual + 1
          ELSE 1
        END,
        maior_streak = CASE
          WHEN public.streaks.ultimo_acesso = (SELECT d FROM hoje) THEN public.streaks.maior_streak
          WHEN public.streaks.ultimo_acesso = (SELECT d FROM hoje) - INTERVAL '1 day'
            THEN GREATEST(public.streaks.maior_streak, public.streaks.streak_atual + 1)
          ELSE public.streaks.maior_streak
        END,
        ultimo_acesso = (SELECT d FROM hoje),
        updated_at = now()
      RETURNING streak_atual, maior_streak
    )
    SELECT streak_atual, maior_streak FROM upsert
  `;

  const row = rows[0] as { streak_atual: number; maior_streak: number } | undefined;
  const streak: StreakInfo = {
    streak_atual: Number(row?.streak_atual ?? 1),
    maior_streak: Number(row?.maior_streak ?? 1),
  };

  if (streak.streak_atual >= 7) {
    const ach = await concederConquista(sql, userId, 'streak_7');
    if (ach && unlockedCollector) unlockedCollector.push(ach);
  }

  return streak;
}

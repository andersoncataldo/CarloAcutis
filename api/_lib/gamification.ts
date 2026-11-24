import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { StreakInfo } from '../../src/types/api.types';

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

export async function concederConquista(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  codigo: AchievementCode
): Promise<void> {
  await sql`
    INSERT INTO public.usuario_conquistas (user_id, conquista_id)
    SELECT ${userId}::uuid, id
    FROM public.conquistas
    WHERE codigo = ${codigo}
    ON CONFLICT (user_id, conquista_id) DO NOTHING
  `;
}

/**
 * Registra o acesso diário (calendário UTC) de forma idempotente,
 * mantendo o maior streak histórico e concedendo a conquista streak_7 ao atingir 7 dias.
 */
export async function registrarAcessoDiario(
  sql: NeonQueryFunction<false, false>,
  userId: string
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
    await concederConquista(sql, userId, 'streak_7');
  }

  return streak;
}

import { createHash } from 'node:crypto';
import type { NeonQueryFunction } from '@neondatabase/serverless';

export interface RateLimitOptions {
  scope: string;
  identifier: string;
  maxHits: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  hits: number;
  retryAfter: number;
}

export function hashRateLimitKey(scope: string, identifier: string): string {
  return createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
}

export async function checkRateLimit(
  sql: NeonQueryFunction<false, false>,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = hashRateLimitKey(options.scope, options.identifier);

  const rows = await sql`
    INSERT INTO public.rate_limits (key, hits, window_start)
    VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE
      SET hits = CASE
            WHEN public.rate_limits.window_start + (${options.windowSeconds} * interval '1 second') <= now()
              THEN 1
            ELSE public.rate_limits.hits + 1
          END,
          window_start = CASE
            WHEN public.rate_limits.window_start + (${options.windowSeconds} * interval '1 second') <= now()
              THEN now()
            ELSE public.rate_limits.window_start
          END
    RETURNING
      hits,
      GREATEST(
        1,
        CEIL(EXTRACT(EPOCH FROM (window_start + (${options.windowSeconds} * interval '1 second') - now())))
      )::int AS retry_after
  `;

  const row = rows[0] as { hits?: number; retry_after?: number } | undefined;
  if (!row || row.hits === undefined) {
    return { allowed: true, hits: 1, retryAfter: 0 };
  }

  const hits = Number(row.hits);
  const retryAfter = Math.max(1, Number(row.retry_after ?? options.windowSeconds));

  return {
    allowed: hits <= options.maxHits,
    hits,
    retryAfter: hits > options.maxHits ? retryAfter : 0,
  };
}

export async function cleanupExpiredRateLimits(
  sql: NeonQueryFunction<false, false>
): Promise<void> {
  try {
    await sql`
      DELETE FROM public.rate_limits
      WHERE window_start < now() - interval '1 hour'
    `;
  } catch (err) {
    console.error('Aviso ao limpar rate_limits expirados:', err);
  }
}

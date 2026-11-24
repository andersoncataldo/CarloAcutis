import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

/**
 * Inicialização lazy do cliente Neon PostgreSQL Serverless.
 * Evita falhas em tempo de importação/build quando DATABASE_URL ainda não está definida.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Configuração do banco ausente: defina DATABASE_URL no ambiente do servidor.');
  }

  cachedSql = neon(databaseUrl);
  return cachedSql;
}

/** Utilitário para testes resetarem o cache de conexão. */
export function resetSqlClient(): void {
  cachedSql = null;
}

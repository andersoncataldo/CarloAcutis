import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Erro: defina DATABASE_URL (ou DATABASE_URL_UNPOOLED) no arquivo .env/.env.local.');
  process.exit(1);
}

const schemaPath = resolve(process.cwd(), 'db/schema.sql');
const sqlText = readFileSync(schemaPath, 'utf8');

const pool = new Pool({ connectionString });

try {
  const ping = await pool.query('SELECT 1 AS ok');
  console.log('Conexão Neon OK:', ping.rows[0]);

  await pool.query(sqlText);
  console.log('db/schema.sql aplicado com sucesso.');

  const summary = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM public.temporadas) AS temporadas,
      (SELECT COUNT(*)::int FROM public.perguntas) AS perguntas,
      (SELECT COUNT(*)::int FROM public.conquistas) AS conquistas
  `);
  console.log('Contagem pós-migração:', summary.rows[0]);
} finally {
  await pool.end();
}

import type { IncomingMessage } from 'node:http';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

type RouteHandler = (request: Request) => Promise<Response>;

function resolveApiFile(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, '');
  if (clean === '/api/quiz/seasons') return 'api/quiz/seasons.ts';
  if (clean === '/api/quiz/questions') return 'api/quiz/questions.ts';
  if (clean === '/api/quiz/answer') return 'api/quiz/answer.ts';
  if (clean === '/api/profile/achievements') return 'api/profile/achievements.ts';
  if (/^\/api\/auth\/[^/]+$/.test(clean)) return 'api/auth/[action].ts';
  if (/^\/api\/leagues\/[^/]+$/.test(clean)) return 'api/leagues/[action].ts';
  if (/^\/api\/admin\/[^/]+$/.test(clean)) return 'api/admin/[resource].ts';
  return null;
}

async function readRequestBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return undefined;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return chunks.length > 0 ? new Uint8Array(Buffer.concat(chunks)) : undefined;
}

function localApiDevPlugin(mode: string): Plugin {
  return {
    name: 'local-api-dev-middleware',
    apply: 'serve',
    configureServer(server) {
      // Carrega .env e .env.local (incluindo DATABASE_URL) para process.env apenas em dev local
      const env = loadEnv(mode, process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? '/';
        if (!rawUrl.startsWith('/api/')) {
          return next();
        }

        const host = req.headers.host ?? 'localhost:5173';
        const fullUrl = new URL(rawUrl, `http://${host}`);
        const apiRelPath = resolveApiFile(fullUrl.pathname);

        if (!apiRelPath) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Rota de API não encontrada.' }));
          return;
        }

        try {
          const mod = (await server.ssrLoadModule(resolve(process.cwd(), apiRelPath))) as Record<
            string,
            RouteHandler | undefined
          >;
          const method = (req.method ?? 'GET').toUpperCase();
          const handler = mod[method];

          if (typeof handler !== 'function') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: `Método ${method} não permitido.` }));
            return;
          }

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              for (const v of value) headers.append(key, v);
            } else if (typeof value === 'string') {
              headers.set(key, value);
            }
          }

          const body = await readRequestBody(req);
          const webRequest = new Request(fullUrl.toString(), {
            method,
            headers,
            body: body ? Buffer.from(body) : undefined,
          });

          const webResponse = await handler(webRequest);
          res.statusCode = webResponse.status;

          const setCookies =
            typeof webResponse.headers.getSetCookie === 'function'
              ? webResponse.headers.getSetCookie()
              : [];

          webResponse.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'set-cookie') {
              res.setHeader(key, value);
            }
          });
          if (setCookies.length > 0) {
            res.setHeader('Set-Cookie', setCookies);
          }

          const responseBuffer = Buffer.from(await webResponse.arrayBuffer());
          res.end(responseBuffer);
        } catch (err) {
          console.error(`Erro na rota local ${rawUrl}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Erro interno ao processar a rota local.' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    localApiDevPlugin(mode),
    process.env.ANALYZE === 'true' &&
      visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true, open: true }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
}));

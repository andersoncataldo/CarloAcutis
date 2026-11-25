export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });

  return new Response(JSON.stringify(body), { status, headers });
}

export function errorResponse(
  message: string,
  status = 400,
  extraHeaders?: Record<string, string>
): Response {
  return jsonResponse({ error: message }, status, extraHeaders);
}

export async function parseJsonBody<T extends Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    const data: unknown = await request.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

export function getLastPathSegment(request: Request): string {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, '');
  const parts = pathname.split('/');
  return parts[parts.length - 1] ?? '';
}

export function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

export function isSecureRequest(request: Request): boolean {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    return true;
  }
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto === 'https') return true;
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwarded) {
    const first = vercelForwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

export function validateSameOrigin(request: Request): Response | null {
  const secFetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase();
  if (secFetchSite === 'cross-site') {
    return errorResponse('Origem da requisição não autorizada.', 403);
  }

  const origin = request.headers.get('origin')?.trim();
  if (!origin) {
    return null;
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return errorResponse('Origem da requisição não autorizada.', 403);
  }

  let expectedHost = '';
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostHeader = request.headers.get('host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    expectedHost = forwardedHost.toLowerCase();
  } else if (hostHeader) {
    expectedHost = hostHeader.toLowerCase();
  } else {
    try {
      expectedHost = new URL(request.url).host.toLowerCase();
    } catch {
      return errorResponse('Origem da requisição não autorizada.', 403);
    }
  }

  if (originHost !== expectedHost) {
    return errorResponse('Origem da requisição não autorizada.', 403);
  }

  return null;
}

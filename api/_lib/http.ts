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

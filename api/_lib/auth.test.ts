// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  hashPassword,
  hashSessionToken,
  parseCookieHeader,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from './auth';
import { calcularTitulo } from './gamification';

describe('api/_lib/auth', () => {
  it('gera hash scrypt distinto com salt aleatório e valida senha corretamente', async () => {
    const hash1 = await hashPassword('SenhaForte123!');
    const hash2 = await hashPassword('SenhaForte123!');

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword('SenhaForte123!', hash1)).toBe(true);
    expect(await verifyPassword('SenhaErrada', hash1)).toBe(false);
    expect(await verifyPassword('SenhaForte123!', 'formato-invalido')).toBe(false);
  });

  it('gera SHA-256 determinístico para tokens de sessão', () => {
    const h1 = hashSessionToken('abc123');
    const h2 = hashSessionToken('abc123');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('faz parsing de cabeçalho Cookie e monta cookies HttpOnly seguros', () => {
    const parsed = parseCookieHeader(`foo=bar; ${SESSION_COOKIE_NAME}=tok_123456; other=1`);
    expect(parsed[SESSION_COOKIE_NAME]).toBe('tok_123456');
    expect(parsed.foo).toBe('bar');

    const prodCookie = buildSessionCookie('token_xyz', true);
    expect(prodCookie).toContain(`${SESSION_COOKIE_NAME}=token_xyz`);
    expect(prodCookie).toContain('HttpOnly');
    expect(prodCookie).toContain('SameSite=Lax');
    expect(prodCookie).toContain('Secure');

    const clearCookie = buildClearSessionCookie(true);
    expect(clearCookie).toContain('Max-Age=0');
    expect(clearCookie).toContain('HttpOnly');
  });
});

describe('api/_lib/gamification — calcularTitulo', () => {
  it('respeita exatamente as faixas oficiais da spec gamification', () => {
    expect(calcularTitulo(0)).toBe('Peregrino');
    expect(calcularTitulo(499)).toBe('Peregrino');
    expect(calcularTitulo(500)).toBe('Aprendiz da Fé');
    expect(calcularTitulo(1999)).toBe('Aprendiz da Fé');
    expect(calcularTitulo(2000)).toBe('Discípulo');
    expect(calcularTitulo(4999)).toBe('Discípulo');
    expect(calcularTitulo(5000)).toBe('Apóstolo');
    expect(calcularTitulo(12000)).toBe('Apóstolo');
  });
});

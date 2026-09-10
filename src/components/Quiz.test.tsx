import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Quiz from '../components/Quiz';

// Mocka o cliente Supabase inteiro: cada teste configura o retorno das
// chamadas encadeadas (.from().select().eq()...) via mockState.
// vi.mock() é hoisted para o topo do arquivo, então qualquer estado usado
// dentro do factory precisa vir de vi.hoisted() — senão dá erro de
// "Cannot access before initialization".
const { mockRpc, mockState } = vi.hoisted(() => {
  return {
    mockRpc: vi.fn(),
    mockState: {
      perguntasResult: { data: [] as unknown[], error: null as unknown },
      respostasResult: { data: [] as unknown[], error: null as unknown },
      lastRespostasFilters: {} as Record<string, unknown>,
    },
  };
});

vi.mock('../services/supabase', () => {
  const buildQuery = (table: string) => {
    const query: Record<string, unknown> = {};
    const chain = () => query;
    query.select = vi.fn(chain);
    query.eq = vi.fn((col: string, val: unknown) => {
      if (table === 'respostas_usuario') mockState.lastRespostasFilters[col] = val;
      return query;
    });
    query.in = vi.fn(chain);
    query.order = vi.fn(chain);
    query.abortSignal = vi.fn(() =>
      table === 'perguntas'
        ? Promise.resolve(mockState.perguntasResult)
        : Promise.resolve(mockState.respostasResult)
    );
    return query;
  };

  return {
    supabase: {
      from: vi.fn((table: string) => buildQuery(table)),
      rpc: mockRpc,
    },
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', xp: 300, nome: 'Teste', email: 't@t.com', nivel: 'Peregrino', role: 'user', liga_id: null },
    refreshUser: vi.fn(),
  }),
}));

describe('Quiz', () => {
  beforeEach(() => {
    mockState.perguntasResult = { data: [], error: null };
    mockState.respostasResult = { data: [], error: null };
    mockState.lastRespostasFilters = {};
    mockRpc.mockReset();
  });

  it('mostra o skeleton de carregamento antes de resolver as consultas', async () => {
    const { container } = render(<Quiz temporadaId={1} />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    // deixa as promises da consulta resolverem antes de encerrar o teste,
    // só para não vazar updates de estado sem act() para o próximo teste.
    await waitFor(() => expect(mockRpc).not.toHaveBeenCalled());
  });

  it('mostra mensagem de "nenhuma pergunta" quando a temporada está vazia', async () => {
    mockState.perguntasResult = { data: [], error: null };
    render(<Quiz temporadaId={1} />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma pergunta encontrada/i)).toBeInTheDocument();
    });
  });

  it('filtra o progresso pelo usuário autenticado (user_id) e não quebra a ordem dos Hooks', async () => {
    mockState.perguntasResult = {
      data: [
        { id: 10, texto_pergunta: 'Pergunta 1', opcao_a: 'A', opcao_b: 'B', opcao_c: 'C', opcao_d: 'D' }
      ],
      error: null
    };
    mockState.respostasResult = { data: [], error: null };

    render(<Quiz temporadaId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
    });

    // A consulta de respostas_usuario precisa ser filtrada por user_id —
    // sem isso, o progresso de um usuário pode vazar para outro.
    expect(mockState.lastRespostasFilters.user_id).toBe('user-1');
  });
});

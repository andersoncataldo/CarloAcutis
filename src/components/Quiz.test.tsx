import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Quiz from '../components/Quiz';
import type { UserProfile } from '../types/api.types';

const { mockGetQuizQuestions, mockAnswerQuestion, mockAuthState } = vi.hoisted(() => ({
  mockGetQuizQuestions: vi.fn(),
  mockAnswerQuestion: vi.fn(),
  mockAuthState: {
    user: null as UserProfile | null,
    refreshUser: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../services/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  api: {
    getQuizQuestions: mockGetQuizQuestions,
    answerQuestion: mockAnswerQuestion,
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('Quiz', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockGetQuizQuestions.mockReset();
    mockAnswerQuestion.mockReset();
    mockAuthState.refreshUser.mockClear();
    mockAuthState.user = {
      id: 'user-1',
      xp: 300,
      nome: 'Teste',
      email: 't@t.com',
      nivel: 'Peregrino',
      role: 'user',
      liga_id: null,
      liga: null,
    };
  });

  it('mostra o skeleton de carregamento antes de resolver as consultas', async () => {
    mockGetQuizQuestions.mockResolvedValueOnce({ perguntas: [], respostas: [], authenticated: true });
    const { container } = render(
      <MemoryRouter>
        <Quiz temporadaId={1} />
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma pergunta encontrada/i)).toBeInTheDocument();
    });
  });

  it('exibe rótulos visuais sequenciais A–D e envia a chave original da alternativa', async () => {
    const user = userEvent.setup();
    mockGetQuizQuestions.mockResolvedValueOnce({
      perguntas: [
        {
          id: 10,
          texto_pergunta: 'Em qual cidade Carlo Acutis nasceu?',
          opcao_a: 'Milão',
          opcao_b: 'Londres',
          opcao_c: 'Roma',
          opcao_d: 'Assis',
        },
      ],
      respostas: [],
      authenticated: true,
    });
    mockAnswerQuestion.mockResolvedValueOnce({
      correct: true,
      first_attempt: true,
      xp_gained: 100,
      xp: 400,
      nivel: 'Peregrino',
      guest: false,
    });

    render(
      <MemoryRouter>
        <Quiz temporadaId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Em qual cidade Carlo Acutis nasceu?')).toBeInTheDocument();
    });

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios.map((btn) => btn.querySelector('span')?.textContent)).toEqual(['A', 'B', 'C', 'D']);

    const londresButton = screen.getByRole('radio', { name: /Londres/i });
    await user.click(londresButton);

    await waitFor(() => {
      expect(mockAnswerQuestion).toHaveBeenCalledWith(10, 'B');
      expect(screen.getByText(/Correto! \+100 XP/i)).toBeInTheDocument();
    });
  });

  it('permite jogar em modo visitante sem login e persiste progresso localmente', async () => {
    const user = userEvent.setup();
    mockAuthState.user = null;
    mockGetQuizQuestions.mockResolvedValueOnce({
      perguntas: [
        {
          id: 21,
          texto_pergunta: 'Qual expressão Carlo usava para a Eucaristia?',
          opcao_a: 'Plano',
          opcao_b: 'Autoestrada para o céu',
          opcao_c: 'Refúgio',
          opcao_d: 'Luz',
        },
      ],
      respostas: [],
      authenticated: false,
    });
    mockAnswerQuestion.mockResolvedValueOnce({
      correct: true,
      first_attempt: true,
      xp_gained: 100,
      xp: null,
      nivel: null,
      guest: true,
    });

    render(
      <MemoryRouter>
        <Quiz temporadaId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/XP Local: 0/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /Autoestrada para o céu/i }));

    await waitFor(() => {
      expect(mockAnswerQuestion).toHaveBeenCalledWith(21, 'B');
      expect(screen.getByText(/XP Local: 100/i)).toBeInTheDocument();
    });
  });
});

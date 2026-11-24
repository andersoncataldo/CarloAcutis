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
    mockGetQuizQuestions.mockResolvedValueOnce({
      perguntas: [],
      respostas: [],
      authenticated: true,
      mode: 'season',
    });
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

  it('exibe rótulos A–D, explicação pós-resposta, conquista e botão Próxima Pergunta', async () => {
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
        {
          id: 11,
          texto_pergunta: 'Segunda pergunta da temporada',
          opcao_a: 'A1',
          opcao_b: 'B1',
          opcao_c: 'C1',
          opcao_d: 'D1',
        },
      ],
      respostas: [],
      authenticated: true,
      mode: 'season',
    });
    mockAnswerQuestion.mockResolvedValueOnce({
      correct: true,
      correct_option: 'B',
      explicacao: 'Carlo nasceu em Londres em 3 de maio de 1991.',
      first_attempt: true,
      xp_gained: 100,
      xp: 400,
      nivel: 'Peregrino',
      previous_nivel: 'Peregrino',
      leveled_up: false,
      unlocked_achievements: [
        {
          codigo: 'primeira_resposta',
          nome: 'Primeiro Passo',
          descricao: 'Acertou sua primeira pergunta no quiz',
          icone: '🌱',
        },
      ],
      guest: false,
      mode: 'season',
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

    await user.click(screen.getByRole('radio', { name: /Londres/i }));

    await waitFor(() => {
      expect(mockAnswerQuestion).toHaveBeenCalledWith(10, 'B', 'season');
      expect(screen.getByText(/Correto! \+100 XP/i)).toBeInTheDocument();
      expect(screen.getByText(/Carlo nasceu em Londres em 3 de maio de 1991/i)).toBeInTheDocument();
      expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    });

    // Avança somente após clicar no botão Próxima Pergunta
    await user.click(screen.getByRole('button', { name: /Próxima Pergunta/i }));

    await waitFor(() => {
      expect(screen.getByText('Segunda pergunta da temporada')).toBeInTheDocument();
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
      mode: 'season',
    });
    mockAnswerQuestion.mockResolvedValueOnce({
      correct: true,
      correct_option: 'B',
      explicacao: 'Autoestrada para o céu.',
      first_attempt: true,
      xp_gained: 100,
      xp: null,
      nivel: null,
      previous_nivel: null,
      leveled_up: false,
      unlocked_achievements: [],
      guest: true,
      mode: 'season',
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
      expect(mockAnswerQuestion).toHaveBeenCalledWith(21, 'B', 'season');
      expect(screen.getByText(/XP Local: 100/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver Resultado Final/i })).toBeInTheDocument();
    });
  });
});

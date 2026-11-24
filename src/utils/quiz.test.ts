import { describe, it, expect, beforeEach } from 'vitest';
import {
  shuffle,
  calcularProgresso,
  calcularXpGanho,
  progressoPercentual,
  calcularTitulo,
  calcularProgressoTitulo,
} from './quiz';
import {
  getGuestAnswersForQuestions,
  loadGuestProgress,
  recordGuestAnswer,
  resetGuestSeasonProgress,
} from './guestProgress';

describe('shuffle', () => {
  it('mantém todos os elementos originais, apenas reordenados', () => {
    const original = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }];
    const embaralhado = shuffle(original);

    expect(embaralhado).toHaveLength(original.length);
    expect(embaralhado.map(o => o.label).sort()).toEqual(original.map(o => o.label).sort());
  });

  it('não modifica o array original (imutabilidade)', () => {
    const original = [1, 2, 3, 4];
    const copia = [...original];
    shuffle(original);
    expect(original).toEqual(copia);
  });

  it('preserva o label de cada opção junto do seu texto original', () => {
    const opcoes = [
      { label: 'A', text: 'Roma' },
      { label: 'B', text: 'Assis' },
      { label: 'C', text: 'Milão' },
      { label: 'D', text: 'Florença' }
    ];
    const embaralhado = shuffle(opcoes);
    for (const opt of embaralhado) {
      const original = opcoes.find(o => o.label === opt.label);
      expect(opt.text).toBe(original?.text);
    }
  });
});

describe('calcularProgresso', () => {
  it('começa do zero quando não há respostas registradas', () => {
    const resultado = calcularProgresso([1, 2, 3], []);
    expect(resultado).toEqual({ score: 0, currentIndex: 0, completed: false });
  });

  it('retoma na primeira pergunta ainda não respondida', () => {
    const resultado = calcularProgresso(
      [1, 2, 3, 4],
      [
        { pergunta_id: 1, acertou: true },
        { pergunta_id: 2, acertou: false }
      ]
    );
    expect(resultado.currentIndex).toBe(2);
    expect(resultado.score).toBe(1);
    expect(resultado.completed).toBe(false);
  });

  it('marca como concluída quando todas as perguntas já foram respondidas', () => {
    const resultado = calcularProgresso(
      [1, 2],
      [
        { pergunta_id: 1, acertou: true },
        { pergunta_id: 2, acertou: true }
      ]
    );
    expect(resultado.completed).toBe(true);
    expect(resultado.score).toBe(2);
    expect(resultado.currentIndex).toBe(1);
  });

  it('não quebra com lista de perguntas vazia', () => {
    const resultado = calcularProgresso([], []);
    expect(resultado).toEqual({ score: 0, currentIndex: 0, completed: false });
  });
});

describe('calcularXpGanho', () => {
  it('concede XP na primeira tentativa correta', () => {
    expect(calcularXpGanho(true, true)).toBe(100);
  });

  it('não concede XP em resposta incorreta', () => {
    expect(calcularXpGanho(false, true)).toBe(0);
  });

  it('não concede XP em tentativa repetida, mesmo que correta', () => {
    expect(calcularXpGanho(true, false)).toBe(0);
  });

  it('respeita um valor de XP customizado', () => {
    expect(calcularXpGanho(true, true, 50)).toBe(50);
  });
});

describe('progressoPercentual', () => {
  it('calcula a porcentagem correta no meio do quiz', () => {
    expect(progressoPercentual(2, 4)).toBe(50);
  });

  it('retorna 0 quando o total de perguntas é zero (evita divisão por zero)', () => {
    expect(progressoPercentual(0, 0)).toBe(0);
  });

  it('nunca ultrapassa 100', () => {
    expect(progressoPercentual(10, 4)).toBe(100);
  });
});

describe('calcularTitulo e calcularProgressoTitulo', () => {
  it('calcula faixas oficiais de título e progresso proporcional', () => {
    expect(calcularTitulo(0)).toBe('Peregrino');
    expect(calcularTitulo(500)).toBe('Aprendiz da Fé');
    expect(calcularTitulo(2000)).toBe('Discípulo');
    expect(calcularTitulo(5000)).toBe('Apóstolo');

    const p1 = calcularProgressoTitulo(250);
    expect(p1.tituloAtual).toBe('Peregrino');
    expect(p1.proximoTitulo).toBe('Aprendiz da Fé');
    expect(p1.percentual).toBe(50);
    expect(p1.xpFaltante).toBe(250);

    const pMax = calcularProgressoTitulo(6000);
    expect(pMax.tituloAtual).toBe('Apóstolo');
    expect(pMax.proximoTitulo).toBeNull();
    expect(pMax.percentual).toBe(100);
  });
});

describe('guestProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('salva progresso local de visitante sem duplicar XP e permite reiniciar temporada', () => {
    const r1 = recordGuestAnswer(10, true);
    expect(r1.firstAttempt).toBe(true);
    expect(r1.xpGained).toBe(100);
    expect(loadGuestProgress().xp).toBe(100);

    const r2 = recordGuestAnswer(10, true);
    expect(r2.firstAttempt).toBe(false);
    expect(r2.xpGained).toBe(0);
    expect(loadGuestProgress().xp).toBe(100);

    expect(getGuestAnswersForQuestions([10, 11])).toEqual([{ pergunta_id: 10, acertou: true }]);

    resetGuestSeasonProgress([10]);
    expect(getGuestAnswersForQuestions([10])).toEqual([]);
  });
});

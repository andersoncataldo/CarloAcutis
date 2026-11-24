import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api, ApiError } from '../services/api';
import type { AnswerOption, PerguntaPublica } from '../types/api.types';
import { formatDailyShareText, shuffle } from '../utils/quiz';
import { playClickSound, playSacredChime } from '../utils/sound';

const DAILY_STORAGE_KEY = 'carlo_daily_challenge_v1';
const DISPLAY_LABELS: readonly AnswerOption[] = ['A', 'B', 'C', 'D'];

interface DailySavedState {
  dateUtc: string;
  results: boolean[];
}

function loadDailySaved(dateUtc: string): boolean[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DailySavedState>;
    if (parsed.dateUtc === dateUtc && Array.isArray(parsed.results)) {
      return parsed.results.map(Boolean);
    }
    return null;
  } catch {
    return null;
  }
}

function saveDailyCompleted(dateUtc: string, results: boolean[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ dateUtc, results }));
  } catch {
    // Ignora se localStorage estiver bloqueado
  }
}

const DailyChallenge: React.FC = () => {
  const [perguntas, setPerguntas] = useState<PerguntaPublica[]>([]);
  const [dateUtc, setDateUtc] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [completed, setCompleted] = useState(false);

  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [correctOption, setCorrectOption] = useState<AnswerOption | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [explicacao, setExplicacao] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState('');

  const loadDaily = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDailyQuestions(signal);
      const day = data.date_utc ?? new Date().toISOString().slice(0, 10);
      setDateUtc(day);
      setPerguntas(data.perguntas);

      const saved = loadDailySaved(day);
      if (saved && saved.length === data.perguntas.length && saved.length > 0) {
        setResults(saved);
        setCompleted(true);
      } else {
        setResults([]);
        setCurrentIndex(0);
        setCompleted(false);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar o Desafio Diário. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDaily(controller.signal);
    return () => controller.abort();
  }, [loadDaily]);

  const perguntaAtual = perguntas[currentIndex];

  const opcoesEmbaralhadas = useMemo(() => {
    if (!perguntaAtual) return [];
    const shuffled = shuffle<Array<{ originalKey: AnswerOption; text: string }>[number]>([
      { originalKey: 'A', text: perguntaAtual.opcao_a },
      { originalKey: 'B', text: perguntaAtual.opcao_b },
      { originalKey: 'C', text: perguntaAtual.opcao_c },
      { originalKey: 'D', text: perguntaAtual.opcao_d },
    ]);
    return shuffled.map((item, idx) => ({
      ...item,
      displayLabel: DISPLAY_LABELS[idx] ?? item.originalKey,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaAtual?.id]);

  const handleAnswer = async (originalKey: AnswerOption) => {
    if (submitting || feedback || !perguntaAtual) return;
    playClickSound();
    setSubmitting(true);
    setAnswerError(null);
    setSelectedOption(originalKey);

    try {
      const data = await api.answerQuestion(perguntaAtual.id, originalKey, 'daily');
      setCorrectOption(data.correct_option);
      setExplicacao(data.explicacao ?? '');
      setFeedback(data.correct ? 'correct' : 'wrong');
      setResults((prev) => [...prev, data.correct]);
      if (data.correct) playSacredChime();
    } catch (err) {
      setSelectedOption(null);
      setAnswerError(
        err instanceof ApiError ? err.message : 'Falha de conexão ao enviar sua resposta.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption(null);
    setCorrectOption(null);
    setExplicacao('');

    if (currentIndex < perguntas.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      saveDailyCompleted(dateUtc, results);
      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#dc2626', '#2563eb', '#eab308', '#10b981'],
      });
    }
  };

  const handleShareDaily = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : '';
    const texto = formatDailyShareText(dateUtc, results, shareUrl);
    if (navigator.share) {
      navigator.share({ title: 'Desafio Diário | São Carlo Acutis', text: texto, url: shareUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiedMsg('Placar em emojis copiado para o WhatsApp!');
        window.setTimeout(() => setCopiedMsg(''), 3500);
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl animate-pulse space-y-6" role="status">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded w-3/4"></div>
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <span className="sr-only">Carregando Desafio Diário...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-4" role="alert">
        <p className="font-black uppercase tracking-widest text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadDaily()}
          className="px-6 py-3 bg-blue-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl text-center text-slate-500 font-bold">
        Nenhuma pergunta disponível para o Desafio Diário hoje.
      </div>
    );
  }

  if (completed) {
    const acertos = results.filter(Boolean).length;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-widest">
          Desafio Diário Concluído · {dateUtc.split('-').reverse().join('/')}
        </span>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-blue-950">
          {acertos}/{results.length} Acertos
        </h2>
        <div className="text-4xl tracking-[0.25em] py-2" aria-label={`Grade de resultado: ${acertos} de ${results.length}`}>
          {results.map((ok, i) => (
            <span key={i}>{ok ? '🟩' : '🟥'}</span>
          ))}
        </div>
        <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
          Volte amanhã para 3 novas perguntas iguais para toda a comunidade!
        </p>

        <div aria-live="polite" className="min-h-[1.25rem]">
          {copiedMsg && (
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">{copiedMsg}</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleShareDaily}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20"
          >
            📱 Compartilhar Placar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-slate-600">
        <span>
          Desafio Diário · Pergunta {currentIndex + 1} de {perguntas.length}
        </span>
        <span className="text-red-600">{dateUtc.split('-').reverse().join('/')}</span>
      </div>

      <motion.div
        key={perguntaAtual.id}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
      >
        <h2 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
          {perguntaAtual.texto_pergunta}
        </h2>

        <div role="radiogroup" aria-label="Alternativas do Desafio Diário" className="grid gap-4">
          {opcoesEmbaralhadas.map((opt) => {
            const isSelected = selectedOption === opt.originalKey;
            const isCorrectReveal = Boolean(feedback && correctOption === opt.originalKey);
            const isWrongSelected = feedback === 'wrong' && isSelected;

            return (
              <button
                key={opt.originalKey}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleAnswer(opt.originalKey)}
                disabled={submitting || !!feedback}
                className={`group flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left disabled:cursor-not-allowed ${
                  isCorrectReveal
                    ? 'bg-green-50 border-green-500'
                    : isWrongSelected
                    ? 'bg-red-50 border-red-500'
                    : 'bg-slate-50 border-transparent hover:border-blue-600'
                }`}
              >
                <span
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black ${
                    isCorrectReveal
                      ? 'bg-green-600 text-white'
                      : isWrongSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-blue-900 group-hover:bg-blue-600 group-hover:text-white shadow-sm'
                  }`}
                >
                  {opt.displayLabel}
                </span>
                <span className="font-bold text-slate-800">{opt.text}</span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 border-2 space-y-4 ${
                  feedback === 'correct'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <p
                  className={`font-black uppercase tracking-widest text-xs ${
                    feedback === 'correct' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {feedback === 'correct' ? '✅ Resposta Correta!' : '❌ Resposta Incorreta'}
                </p>
                {explicacao && <p className="text-sm text-slate-700 font-medium">{explicacao}</p>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="px-7 py-3 bg-blue-950 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    {currentIndex >= perguntas.length - 1 ? 'Ver Placar do Dia' : 'Próxima Pergunta →'}
                  </button>
                </div>
              </motion.div>
            )}
            {answerError && (
              <p className="text-center font-black text-xs uppercase text-red-600 pt-2">{answerError}</p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyChallenge;

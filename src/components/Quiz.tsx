import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import type { ResponderPerguntaResult } from '../types/database.types';
import { shuffle, calcularProgresso, progressoPercentual } from '../utils/quiz';

interface Pergunta {
  id: number;
  texto_pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
}

interface QuizProps {
  temporadaId: number;
}

function isValidRpcResult(data: unknown): data is ResponderPerguntaResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.correct === 'boolean' && typeof d.xp === 'number';
}

const Quiz: React.FC<QuizProps> = ({ temporadaId }) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [perguntasLoading, setPerguntasLoading] = useState(true);
  const [perguntasError, setPerguntasError] = useState<string | null>(null);

  const [progressLoading, setProgressLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const { user, refreshUser } = useAuth();

  const mountedRef = useRef(true);
  const advanceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  // Efeito 1: carrega as perguntas ativas da temporada. Independente do
  // usuário — perguntas são conteúdo público, progresso não é.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchPerguntas = async () => {
      setPerguntasLoading(true);
      setPerguntasError(null);
      try {
        const { data, error } = await supabase
          .from('perguntas')
          .select('id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d')
          .eq('temporada_id', temporadaId)
          .eq('ativa', true)
          .order('ordem', { ascending: true, nullsFirst: false })
          .order('id', { ascending: true })
          .abortSignal(controller.signal);

        if (cancelled) return;

        if (error) {
          console.error('Erro ao buscar perguntas:', error.message);
          setPerguntasError('Não foi possível carregar as perguntas desta temporada. Tente novamente em instantes.');
          setPerguntas([]);
          return;
        }

        setPerguntas((data ?? []) as Pergunta[]);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Erro de rede ao buscar perguntas:', err);
        setPerguntasError('Falha de conexão ao carregar as perguntas. Verifique sua internet.');
        setPerguntas([]);
      } finally {
        if (!cancelled) setPerguntasLoading(false);
      }
    };

    fetchPerguntas();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [temporadaId]);

  // Efeito 2: carrega o progresso do usuário (o que já foi respondido) para
  // retomar de onde parou. Só roda quando há usuário autenticado e as
  // perguntas já foram carregadas — evita disparar consulta com user_id
  // indefinido e evita recarregar o progresso a cada refresh de XP
  // (depende de user?.id, não do objeto "user" inteiro).
  useEffect(() => {
    if (perguntasLoading) return;

    if (!user) {
      // Sem sessão: não há progresso para retomar; começa do zero e a UI
      // de resposta ficará desabilitada (handleAnswer também valida isso).
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      setProgressLoading(false);
      return;
    }

    if (perguntas.length === 0) {
      setProgressLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchProgresso = async () => {
      setProgressLoading(true);
      try {
        const { data: respostas, error } = await supabase
          .from('respostas_usuario')
          .select('pergunta_id, acertou')
          .eq('user_id', user.id)
          .in('pergunta_id', perguntas.map(p => p.id))
          .abortSignal(controller.signal);

        if (cancelled) return;

        if (error) {
          console.error('Erro ao buscar progresso:', error.message);
          setCurrentIndex(0);
          setScore(0);
          return;
        }

        const progresso = calcularProgresso(perguntas.map(p => p.id), respostas ?? []);
        setScore(progresso.score);
        setCurrentIndex(progresso.currentIndex);
        setCompleted(progresso.completed);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Erro de rede ao buscar progresso:', err);
      } finally {
        if (!cancelled) setProgressLoading(false);
      }
    };

    fetchProgresso();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, perguntas, perguntasLoading]);

  const perguntaAtual = perguntas[currentIndex];

  // Embaralha a ordem visual das opções a cada pergunta nova, mas mantém
  // o label original (A/B/C/D) atrelado ao texto certo, então o backend
  // continua recebendo a letra correta independente da posição na tela.
  // IMPORTANTE: este Hook precisa rodar sempre, antes de qualquer "return"
  // condicional abaixo — senão a ordem dos Hooks muda entre renders
  // (loading -> conteúdo) e o React quebra.
  const opcoesEmbaralhadas = useMemo(() => {
    if (!perguntaAtual) return [];
    return shuffle([
      { label: 'A', text: perguntaAtual.opcao_a },
      { label: 'B', text: perguntaAtual.opcao_b },
      { label: 'C', text: perguntaAtual.opcao_c },
      { label: 'D', text: perguntaAtual.opcao_d }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaAtual?.id]);

  const handleAnswer = async (opcao: string) => {
    if (submitting || feedback || selectedOption) return;

    if (!user) {
      setAnswerError('Você precisa estar logado para responder.');
      return;
    }

    if (!perguntaAtual) return;

    setSubmitting(true);
    setAnswerError(null);
    setSelectedOption(opcao);

    try {
      const { data, error } = await supabase.rpc('responder_pergunta', {
        p_pergunta_id: perguntaAtual.id,
        p_resposta_selecionada: opcao
      });

      if (!mountedRef.current) return;

      if (error) {
        console.error('Erro RPC responder_pergunta:', error.message);
        setSelectedOption(null);
        setAnswerError('Não foi possível registrar sua resposta. Tente novamente.');
        return;
      }

      if (!isValidRpcResult(data)) {
        console.error('Resposta inesperada do banco:', data);
        setSelectedOption(null);
        setAnswerError('Resposta inesperada do servidor. Tente novamente.');
        return;
      }

      const isCorrect = data.correct;
      const isFirstAttempt = data.first_attempt;

      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect && isFirstAttempt) {
        setScore(prev => prev + 1);
        setFeedbackMsg('Correto! +100 XP');
      } else if (isCorrect && !isFirstAttempt) {
        setFeedbackMsg('Correto! (Pergunta já respondida anteriormente)');
      } else {
        setFeedbackMsg('Resposta Incorreta');
      }

      // Atualiza XP exibido no header sem bloquear o avanço do quiz.
      refreshUser().catch(err => console.error('Erro ao atualizar perfil:', err));

      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
      advanceTimeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        setFeedback(null);
        setSelectedOption(null);
        setFeedbackMsg('');
        setCurrentIndex(prev => {
          if (prev < perguntas.length - 1) return prev + 1;
          setCompleted(true);
          return prev;
        });
        advanceTimeoutRef.current = null;
      }, 1500);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Erro de rede ao processar resposta:', err);
      setSelectedOption(null);
      setAnswerError('Falha de conexão ao enviar sua resposta. Verifique sua internet.');
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const loading = perguntasLoading || progressLoading;

  if (loading) return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="h-3 w-16 bg-slate-200 rounded"></div>
      </div>
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10">
        <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border-2 border-transparent bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (perguntasError) return (
    <div className="p-12 text-center space-y-4">
      <p className="font-black uppercase tracking-widest text-red-600">{perguntasError}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
      >
        Tentar novamente
      </button>
    </div>
  );

  if (!user) return (
    <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">
      Faça login para responder ao quiz.
    </div>
  );

  if (perguntas.length === 0) return (
    <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">
      Nenhuma pergunta encontrada para esta temporada.
    </div>
  );

  if (completed) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-8 relative overflow-hidden"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 relative z-10"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="text-4xl md:text-5xl font-black italic uppercase text-blue-950">Temporada Concluída!</h3>
        <p className="text-slate-500 font-medium">Você acertou {score} de {perguntas.length} perguntas.</p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="text-6xl md:text-7xl font-black text-red-600 py-4"
        >
          +{score * 100} XP
        </motion.div>
      </motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 1 }} className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, duration: 1 }} className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></motion.div>
    </motion.div>
  );

  const progressPercent = progressoPercentual(currentIndex, perguntas.length);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* ProgressBar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="h-full bg-blue-600"
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span>Questão {currentIndex + 1} de {perguntas.length}</span>
        <span className="text-blue-600">XP Atual: {user.xp}</span>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10"
      >
        <h2 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
          {perguntaAtual.texto_pergunta}
        </h2>

        <div className="grid gap-4">
          {opcoesEmbaralhadas.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.label)}
              disabled={submitting || !!feedback}
              aria-pressed={selectedOption === opt.label}
              className={`group flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left disabled:cursor-not-allowed ${
                feedback === 'correct' && selectedOption === opt.label
                ? 'bg-green-50 border-green-500'
                : feedback === 'wrong' && opt.label === selectedOption
                ? 'bg-red-50 border-red-500'
                : 'bg-slate-50 border-transparent hover:border-blue-600'
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                feedback === 'correct' && selectedOption === opt.label
                ? 'bg-green-500 text-white'
                : feedback === 'wrong' && opt.label === selectedOption
                ? 'bg-red-500 text-white'
                : 'bg-white text-blue-900 group-hover:bg-blue-600 group-hover:text-white shadow-sm'
              }`}>
                {opt.label}
              </span>
              <span className="font-bold text-slate-700">{opt.text}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div aria-live="polite" className="min-h-[1.5rem]">
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center font-black uppercase tracking-[0.3em] ${feedback === 'correct' ? 'text-green-500' : 'text-red-600'}`}
            >
              {feedbackMsg}
            </motion.div>
          )}
          {answerError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-black uppercase tracking-[0.2em] text-red-600 text-xs"
            >
              {answerError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;

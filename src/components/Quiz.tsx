import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

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

const Quiz: React.FC<QuizProps> = ({ temporadaId }) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchPerguntas = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('perguntas')
          .select('id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d')
          .eq('temporada_id', temporadaId);

        if (error) {
          console.error("Erro ao buscar perguntas", error);
        } else {
          setPerguntas(data as Pergunta[]);
          setCurrentIndex(0);
          setCompleted(false);
          setScore(0);
        }
      } catch (err) {
        console.error("Erro ao buscar perguntas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerguntas();
  }, [temporadaId]);

  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const handleAnswer = async (opcao: string) => {
    if (feedback || selectedOption || !user) return;

    setSelectedOption(opcao);
    try {
      // Chama a função RPC segura no banco do Supabase para processar a resposta sem expor o gabarito
      const { data, error } = await supabase.rpc('responder_pergunta', {
        p_pergunta_id: perguntas[currentIndex].id,
        p_resposta_selecionada: opcao
      });

      if (error) {
        console.error("Erro RPC:", error);
        setSelectedOption(null);
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

      await refreshUser();

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        setFeedbackMsg('');
        if (currentIndex < perguntas.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setCompleted(true);
        }
      }, 1500);

    } catch (err) {
      console.error("Erro ao processar resposta", err);
      setSelectedOption(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Carregando Questões...</div>;
  if (perguntas.length === 0) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Nenhuma pergunta encontrada para esta temporada.</div>;

  if (completed) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-6">
      <h3 className="text-4xl font-black italic uppercase text-blue-950">Temporada Concluída!</h3>
      <p className="text-slate-500 font-medium">Você acertou {score} de {perguntas.length} perguntas.</p>
      <div className="text-6xl font-black text-red-600">+{score * 100} XP</div>
      <button onClick={() => { setCurrentIndex(0); setCompleted(false); setScore(0); }} className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest">Jogar Novamente</button>
    </motion.div>
  );

  const perguntaAtual = perguntas[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span>Questão {currentIndex + 1} de {perguntas.length}</span>
        <span className="text-blue-600">XP Atual: {user?.xp}</span>
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
          {[
            { label: 'A', text: perguntaAtual.opcao_a },
            { label: 'B', text: perguntaAtual.opcao_b },
            { label: 'C', text: perguntaAtual.opcao_c },
            { label: 'D', text: perguntaAtual.opcao_d }
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.label)}
              disabled={!!feedback}
              className={`group flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
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
      </AnimatePresence>
    </div>
  );
};

export default Quiz;

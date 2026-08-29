import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface Temporada {
  id: number;
  titulo: string;
  descricao: string;
  ordem: number | null;
  ativa: boolean;
}

interface Pergunta {
  id: number;
  temporada_id: number;
  texto_pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: string;
  ordem: number | null;
}

const emptyPergunta = {
  texto_pergunta: '',
  opcao_a: '',
  opcao_b: '',
  opcao_c: '',
  opcao_d: '',
  resposta_correta: 'A'
};

// Painel de administração de conteúdo (temporadas e perguntas do quiz).
// Acesso restrito a usuários com profiles.role = 'admin' (garantido pelo RLS
// no banco — esta tela só evita que um não-admin veja os controles, a
// segurança de verdade está nas policies do Supabase).
const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [novaTemporada, setNovaTemporada] = useState({ titulo: '', descricao: '' });
  const [novaPergunta, setNovaPergunta] = useState(emptyPergunta);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchTemporadas = useCallback(async () => {
    const { data, error } = await supabase
      .from('temporadas')
      .select('id, titulo, descricao, ordem, ativa')
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setTemporadas((data ?? []) as Temporada[]);
    if (!selectedTemporadaId && data && data.length > 0) {
      setSelectedTemporadaId(data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPerguntas = useCallback(async (temporadaId: number) => {
    const { data, error } = await supabase
      .from('perguntas')
      .select('id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem')
      .eq('temporada_id', temporadaId)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setPerguntas((data ?? []) as Pergunta[]);
  }, []);

  useEffect(() => { fetchTemporadas(); }, [fetchTemporadas]);
  useEffect(() => {
    if (selectedTemporadaId) fetchPerguntas(selectedTemporadaId);
  }, [selectedTemporadaId, fetchPerguntas]);

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="font-black uppercase tracking-widest text-slate-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const handleCriarTemporada = async () => {
    if (!novaTemporada.titulo.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('temporadas').insert({
      titulo: novaTemporada.titulo.trim(),
      descricao: novaTemporada.descricao.trim(),
      ordem: temporadas.length + 1
    });
    setLoading(false);
    if (error) { showMsg('Erro ao criar temporada.', 'error'); return; }
    setNovaTemporada({ titulo: '', descricao: '' });
    showMsg('Temporada criada!');
    fetchTemporadas();
  };

  const toggleAtiva = async (t: Temporada) => {
    const { error } = await supabase.from('temporadas').update({ ativa: !t.ativa }).eq('id', t.id);
    if (error) { showMsg('Erro ao atualizar temporada.', 'error'); return; }
    fetchTemporadas();
  };

  const handleCriarPergunta = async () => {
    if (!selectedTemporadaId) return;
    const p = novaPergunta;
    if (!p.texto_pergunta.trim() || !p.opcao_a.trim() || !p.opcao_b.trim() || !p.opcao_c.trim() || !p.opcao_d.trim()) {
      showMsg('Preencha todos os campos da pergunta.', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('perguntas').insert({
      temporada_id: selectedTemporadaId,
      texto_pergunta: p.texto_pergunta.trim(),
      opcao_a: p.opcao_a.trim(),
      opcao_b: p.opcao_b.trim(),
      opcao_c: p.opcao_c.trim(),
      opcao_d: p.opcao_d.trim(),
      resposta_correta: p.resposta_correta,
      ordem: perguntas.length + 1
    });
    setLoading(false);
    if (error) { showMsg('Erro ao criar pergunta.', 'error'); return; }
    setNovaPergunta(emptyPergunta);
    showMsg('Pergunta adicionada!');
    fetchPerguntas(selectedTemporadaId);
  };

  const handleExcluirPergunta = async (id: number) => {
    if (!confirm('Excluir esta pergunta? Respostas de usuários vinculadas a ela também serão apagadas.')) return;
    const { error } = await supabase.from('perguntas').delete().eq('id', id);
    if (error) { showMsg('Erro ao excluir pergunta.', 'error'); return; }
    showMsg('Pergunta excluída.');
    if (selectedTemporadaId) fetchPerguntas(selectedTemporadaId);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Painel</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-blue-950">Administração de Conteúdo</h1>
        </div>

        {/* Temporadas */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-6">
          <h2 className="text-lg font-black uppercase text-blue-950">Temporadas</h2>
          <div className="space-y-2">
            {temporadas.map(t => (
              <div
                key={t.id}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 ${
                  selectedTemporadaId === t.id ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-slate-50'
                }`}
                onClick={() => setSelectedTemporadaId(t.id)}
              >
                <div>
                  <div className="font-bold text-slate-800">{t.titulo}</div>
                  <div className="text-xs text-slate-400">{t.descricao}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleAtiva(t); }}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    t.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {t.ativa ? 'Ativa' : 'Inativa'}
                </button>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <input placeholder="Título da nova temporada" value={novaTemporada.titulo}
              onChange={e => setNovaTemporada(s => ({ ...s, titulo: e.target.value }))}
              className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
            <input placeholder="Descrição" value={novaTemporada.descricao}
              onChange={e => setNovaTemporada(s => ({ ...s, descricao: e.target.value }))}
              className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
          </div>
          <button onClick={handleCriarTemporada} disabled={loading}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
            Criar Temporada
          </button>
        </div>

        {/* Perguntas */}
        {selectedTemporadaId && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-6">
            <h2 className="text-lg font-black uppercase text-blue-950">Perguntas desta Temporada</h2>
            <div className="space-y-2">
              {perguntas.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 flex justify-between items-start gap-4">
                  <div className="text-sm">
                    <div className="font-bold text-slate-800">{p.texto_pergunta}</div>
                    <div className="text-xs text-slate-400 mt-1">Resposta correta: {p.resposta_correta}</div>
                  </div>
                  <button onClick={() => handleExcluirPergunta(p.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline whitespace-nowrap">
                    Excluir
                  </button>
                </div>
              ))}
              {perguntas.length === 0 && <p className="text-sm text-slate-400 italic">Nenhuma pergunta cadastrada ainda.</p>}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <textarea placeholder="Texto da pergunta" value={novaPergunta.texto_pergunta}
                onChange={e => setNovaPergunta(s => ({ ...s, texto_pergunta: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" rows={2} />
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Opção A" value={novaPergunta.opcao_a} onChange={e => setNovaPergunta(s => ({ ...s, opcao_a: e.target.value }))} className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
                <input placeholder="Opção B" value={novaPergunta.opcao_b} onChange={e => setNovaPergunta(s => ({ ...s, opcao_b: e.target.value }))} className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
                <input placeholder="Opção C" value={novaPergunta.opcao_c} onChange={e => setNovaPergunta(s => ({ ...s, opcao_c: e.target.value }))} className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
                <input placeholder="Opção D" value={novaPergunta.opcao_d} onChange={e => setNovaPergunta(s => ({ ...s, opcao_d: e.target.value }))} className="px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resposta correta</label>
                <select value={novaPergunta.resposta_correta}
                  onChange={e => setNovaPergunta(s => ({ ...s, resposta_correta: e.target.value }))}
                  className="px-4 py-2 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none">
                  {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={handleCriarPergunta} disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                Adicionar Pergunta
              </button>
            </div>
          </div>
        )}

        {msg && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm shadow-xl ${
            msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'
          }`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

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
<<<<<<< HEAD
  ativa: boolean;
}

const MAX_TEXTO_PERGUNTA = 300;
const MAX_OPCAO = 150;
const MAX_TITULO_TEMPORADA = 100;

=======
}

>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
const emptyPergunta = {
  texto_pergunta: '',
  opcao_a: '',
  opcao_b: '',
  opcao_c: '',
  opcao_d: '',
  resposta_correta: 'A'
};

<<<<<<< HEAD
// Traduz erros do Postgres/PostgREST para mensagens que fazem sentido para
// quem está usando o painel, sem vazar detalhes internos (nome de
// constraint, schema, etc.) — só loga o detalhe técnico no console.
function mensagemAmigavel(error: { message: string; code?: string } | null, fallback: string): string {
  if (!error) return fallback;
  console.error('Erro Supabase:', error);
  if (error.message?.includes('perguntas_textos_nao_vazios')) return 'Preencha todos os campos de texto.';
  if (error.message?.includes('perguntas_resposta_valida')) return 'A resposta correta precisa ser A, B, C ou D.';
  if (error.message?.includes('temporadas_titulo_nao_vazio')) return 'O título da temporada não pode ficar vazio.';
  if (error.code === '42501' || error.message?.includes('policy')) return 'Você não tem permissão para fazer isso.';
  return fallback;
}

// Painel de administração de conteúdo (temporadas e perguntas do quiz).
// Acesso restrito a usuários com profiles.role = 'admin' (garantido pelo RLS
// no banco — esta tela só evita que um não-admin veja os controles, a
// segurança de verdade está nas policies do Supabase). Toda alteração aqui
// é registrada automaticamente na tabela auditoria_admin via trigger.
=======
// Painel de administração de conteúdo (temporadas e perguntas do quiz).
// Acesso restrito a usuários com profiles.role = 'admin' (garantido pelo RLS
// no banco — esta tela só evita que um não-admin veja os controles, a
// segurança de verdade está nas policies do Supabase).
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
<<<<<<< HEAD

  const [novaTemporada, setNovaTemporada] = useState({ titulo: '', descricao: '' });
  const [editingTemporadaId, setEditingTemporadaId] = useState<number | null>(null);
  const [editTemporadaForm, setEditTemporadaForm] = useState({ titulo: '', descricao: '' });

  const [novaPergunta, setNovaPergunta] = useState(emptyPergunta);
  const [editingPerguntaId, setEditingPerguntaId] = useState<number | null>(null);

  // Loading por operação específica (ex: "temporada-3", "pergunta-salvar"),
  // em vez de um único spinner global que trava a tela inteira.
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const isLoading = (key: string) => loadingKeys.has(key);
  const setLoadingKey = (key: string, value: boolean) => {
    setLoadingKeys(prev => {
      const next = new Set(prev);
      if (value) next.add(key); else next.delete(key);
      return next;
    });
  };

  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    window.setTimeout(() => setMsg(null), 3500);
=======
  const [loading, setLoading] = useState(false);
  const [novaTemporada, setNovaTemporada] = useState({ titulo: '', descricao: '' });
  const [novaPergunta, setNovaPergunta] = useState(emptyPergunta);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
  };

  const fetchTemporadas = useCallback(async () => {
    const { data, error } = await supabase
      .from('temporadas')
      .select('id, titulo, descricao, ordem, ativa')
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    if (error) {
<<<<<<< HEAD
      showMsg(mensagemAmigavel(error, 'Não foi possível carregar as temporadas.'), 'error');
      return;
    }
    const lista = (data ?? []) as Temporada[];
    setTemporadas(lista);
    setSelectedTemporadaId(prev => prev ?? (lista.length > 0 ? lista[0].id : null));
=======
      console.error(error);
      return;
    }
    setTemporadas((data ?? []) as Temporada[]);
    if (!selectedTemporadaId && data && data.length > 0) {
      setSelectedTemporadaId(data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
  }, []);

  const fetchPerguntas = useCallback(async (temporadaId: number) => {
    const { data, error } = await supabase
      .from('perguntas')
<<<<<<< HEAD
      .select('id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem, ativa')
=======
      .select('id, temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, ordem')
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
      .eq('temporada_id', temporadaId)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    if (error) {
<<<<<<< HEAD
      showMsg(mensagemAmigavel(error, 'Não foi possível carregar as perguntas.'), 'error');
=======
      console.error(error);
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
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

<<<<<<< HEAD
  // ---------- Temporadas ----------

  const handleCriarTemporada = async () => {
    const titulo = novaTemporada.titulo.trim();
    if (!titulo) { showMsg('Dê um título para a temporada.', 'error'); return; }
    if (titulo.length > MAX_TITULO_TEMPORADA) { showMsg(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 'error'); return; }

    setLoadingKey('temporada-criar', true);
    const { error } = await supabase.from('temporadas').insert({
      titulo,
      descricao: novaTemporada.descricao.trim(),
      ordem: temporadas.length + 1
    });
    setLoadingKey('temporada-criar', false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao criar temporada.'), 'error'); return; }
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
    setNovaTemporada({ titulo: '', descricao: '' });
    showMsg('Temporada criada!');
    fetchTemporadas();
  };

<<<<<<< HEAD
  const toggleAtivaTemporada = async (t: Temporada) => {
    setLoadingKey(`temporada-${t.id}`, true);
    const { error } = await supabase.from('temporadas').update({ ativa: !t.ativa }).eq('id', t.id);
    setLoadingKey(`temporada-${t.id}`, false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao atualizar temporada.'), 'error'); return; }
    fetchTemporadas();
  };

  const startEditTemporada = (t: Temporada) => {
    setEditingTemporadaId(t.id);
    setEditTemporadaForm({ titulo: t.titulo, descricao: t.descricao ?? '' });
  };

  const cancelEditTemporada = () => {
    setEditingTemporadaId(null);
    setEditTemporadaForm({ titulo: '', descricao: '' });
  };

  const salvarEdicaoTemporada = async (id: number) => {
    const titulo = editTemporadaForm.titulo.trim();
    if (!titulo) { showMsg('O título não pode ficar vazio.', 'error'); return; }
    if (titulo.length > MAX_TITULO_TEMPORADA) { showMsg(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 'error'); return; }

    setLoadingKey(`temporada-salvar-${id}`, true);
    const { error } = await supabase
      .from('temporadas')
      .update({ titulo, descricao: editTemporadaForm.descricao.trim() })
      .eq('id', id);
    setLoadingKey(`temporada-salvar-${id}`, false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao salvar temporada.'), 'error'); return; }
    showMsg('Temporada atualizada!');
    cancelEditTemporada();
    fetchTemporadas();
  };

  // ---------- Perguntas ----------

  const validarPergunta = (p: typeof novaPergunta): string | null => {
    if (!p.texto_pergunta.trim() || !p.opcao_a.trim() || !p.opcao_b.trim() || !p.opcao_c.trim() || !p.opcao_d.trim()) {
      return 'Preencha todos os campos da pergunta.';
    }
    if (p.texto_pergunta.trim().length > MAX_TEXTO_PERGUNTA) {
      return `A pergunta está muito longa (máx. ${MAX_TEXTO_PERGUNTA} caracteres).`;
    }
    if ([p.opcao_a, p.opcao_b, p.opcao_c, p.opcao_d].some(o => o.trim().length > MAX_OPCAO)) {
      return `Cada opção pode ter no máximo ${MAX_OPCAO} caracteres.`;
    }
    return null;
  };

  const handleCriarPergunta = async () => {
    if (!selectedTemporadaId) return;
    const erro = validarPergunta(novaPergunta);
    if (erro) { showMsg(erro, 'error'); return; }

    setLoadingKey('pergunta-criar', true);
    const p = novaPergunta;
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
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
<<<<<<< HEAD
    setLoadingKey('pergunta-criar', false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao criar pergunta.'), 'error'); return; }
=======
    setLoading(false);
    if (error) { showMsg('Erro ao criar pergunta.', 'error'); return; }
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
    setNovaPergunta(emptyPergunta);
    showMsg('Pergunta adicionada!');
    fetchPerguntas(selectedTemporadaId);
  };

<<<<<<< HEAD
  const startEditPergunta = (p: Pergunta) => {
    setEditingPerguntaId(p.id);
    setNovaPergunta({
      texto_pergunta: p.texto_pergunta,
      opcao_a: p.opcao_a,
      opcao_b: p.opcao_b,
      opcao_c: p.opcao_c,
      opcao_d: p.opcao_d,
      resposta_correta: p.resposta_correta
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelEditPergunta = () => {
    setEditingPerguntaId(null);
    setNovaPergunta(emptyPergunta);
  };

  const salvarEdicaoPergunta = async () => {
    if (!editingPerguntaId || !selectedTemporadaId) return;
    const erro = validarPergunta(novaPergunta);
    if (erro) { showMsg(erro, 'error'); return; }

    setLoadingKey('pergunta-salvar', true);
    const p = novaPergunta;
    const { error } = await supabase.from('perguntas').update({
      texto_pergunta: p.texto_pergunta.trim(),
      opcao_a: p.opcao_a.trim(),
      opcao_b: p.opcao_b.trim(),
      opcao_c: p.opcao_c.trim(),
      opcao_d: p.opcao_d.trim(),
      resposta_correta: p.resposta_correta
    }).eq('id', editingPerguntaId);
    setLoadingKey('pergunta-salvar', false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao salvar pergunta.'), 'error'); return; }
    showMsg('Pergunta atualizada!');
    cancelEditPergunta();
    fetchPerguntas(selectedTemporadaId);
  };

  // Em vez de excluir fisicamente (o que apagaria em cascata o histórico de
  // respostas dos usuários via ON DELETE CASCADE), desativamos a pergunta.
  // Ela some do quiz para novos jogadores, mas o histórico de quem já
  // respondeu continua íntegro.
  const toggleAtivaPergunta = async (p: Pergunta) => {
    if (p.ativa) {
      const confirmado = window.confirm(
        `Arquivar esta pergunta? Ela deixará de aparecer no quiz, mas o histórico de quem já respondeu é mantido.\n\n"${p.texto_pergunta}"`
      );
      if (!confirmado) return;
    }
    setLoadingKey(`pergunta-${p.id}`, true);
    const { error } = await supabase.from('perguntas').update({ ativa: !p.ativa }).eq('id', p.id);
    setLoadingKey(`pergunta-${p.id}`, false);
    if (error) { showMsg(mensagemAmigavel(error, 'Erro ao atualizar pergunta.'), 'error'); return; }
    showMsg(p.ativa ? 'Pergunta arquivada.' : 'Pergunta reativada.');
=======
  const handleExcluirPergunta = async (id: number) => {
    if (!confirm('Excluir esta pergunta? Respostas de usuários vinculadas a ela também serão apagadas.')) return;
    const { error } = await supabase.from('perguntas').delete().eq('id', id);
    if (error) { showMsg('Erro ao excluir pergunta.', 'error'); return; }
    showMsg('Pergunta excluída.');
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
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
<<<<<<< HEAD
              <div key={t.id} className={`rounded-xl border-2 ${selectedTemporadaId === t.id ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-slate-50'}`}>
                {editingTemporadaId === t.id ? (
                  <div className="p-4 space-y-3">
                    <label className="sr-only" htmlFor={`titulo-temporada-${t.id}`}>Título</label>
                    <input
                      id={`titulo-temporada-${t.id}`}
                      value={editTemporadaForm.titulo}
                      maxLength={MAX_TITULO_TEMPORADA}
                      onChange={e => setEditTemporadaForm(s => ({ ...s, titulo: e.target.value }))}
                      className="w-full px-4 py-2 bg-white rounded-lg text-sm border-2 border-blue-200 focus:border-blue-600 outline-none"
                    />
                    <label className="sr-only" htmlFor={`descricao-temporada-${t.id}`}>Descrição</label>
                    <input
                      id={`descricao-temporada-${t.id}`}
                      value={editTemporadaForm.descricao}
                      onChange={e => setEditTemporadaForm(s => ({ ...s, descricao: e.target.value }))}
                      className="w-full px-4 py-2 bg-white rounded-lg text-sm border-2 border-blue-200 focus:border-blue-600 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => salvarEdicaoTemporada(t.id)}
                        disabled={isLoading(`temporada-salvar-${t.id}`)}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        {isLoading(`temporada-salvar-${t.id}`) ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button onClick={cancelEditTemporada} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 gap-3">
                    <button onClick={() => setSelectedTemporadaId(t.id)} className="text-left flex-1">
                      <div className="font-bold text-slate-800">{t.titulo}</div>
                      <div className="text-xs text-slate-400">{t.descricao}</div>
                    </button>
                    <button onClick={() => startEditTemporada(t)} className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => toggleAtivaTemporada(t)}
                      disabled={isLoading(`temporada-${t.id}`)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${
                        t.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isLoading(`temporada-${t.id}`) ? '...' : t.ativa ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>
                )}
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
<<<<<<< HEAD
            <div>
              <label className="sr-only" htmlFor="nova-temporada-titulo">Título da nova temporada</label>
              <input id="nova-temporada-titulo" placeholder="Título da nova temporada" value={novaTemporada.titulo}
                maxLength={MAX_TITULO_TEMPORADA}
                onChange={e => setNovaTemporada(s => ({ ...s, titulo: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="sr-only" htmlFor="nova-temporada-descricao">Descrição</label>
              <input id="nova-temporada-descricao" placeholder="Descrição" value={novaTemporada.descricao}
                onChange={e => setNovaTemporada(s => ({ ...s, descricao: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
            </div>
          </div>
          <button onClick={handleCriarTemporada} disabled={isLoading('temporada-criar')}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
            {isLoading('temporada-criar') ? 'Criando...' : 'Criar Temporada'}
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
          </button>
        </div>

        {/* Perguntas */}
        {selectedTemporadaId && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-6">
            <h2 className="text-lg font-black uppercase text-blue-950">Perguntas desta Temporada</h2>
            <div className="space-y-2">
              {perguntas.map(p => (
<<<<<<< HEAD
                <div key={p.id} className={`p-4 rounded-xl flex justify-between items-start gap-4 ${p.ativa ? 'bg-slate-50' : 'bg-slate-100 opacity-60'}`}>
                  <div className="text-sm">
                    <div className="font-bold text-slate-800">{p.texto_pergunta}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Resposta correta: {p.resposta_correta} {!p.ativa && '· Arquivada'}
                    </div>
                  </div>
                  <div className="flex gap-3 whitespace-nowrap">
                    <button onClick={() => startEditPergunta(p)} className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => toggleAtivaPergunta(p)}
                      disabled={isLoading(`pergunta-${p.id}`)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline disabled:opacity-50"
                    >
                      {isLoading(`pergunta-${p.id}`) ? '...' : p.ativa ? 'Arquivar' : 'Reativar'}
                    </button>
                  </div>
=======
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 flex justify-between items-start gap-4">
                  <div className="text-sm">
                    <div className="font-bold text-slate-800">{p.texto_pergunta}</div>
                    <div className="text-xs text-slate-400 mt-1">Resposta correta: {p.resposta_correta}</div>
                  </div>
                  <button onClick={() => handleExcluirPergunta(p.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline whitespace-nowrap">
                    Excluir
                  </button>
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
                </div>
              ))}
              {perguntas.length === 0 && <p className="text-sm text-slate-400 italic">Nenhuma pergunta cadastrada ainda.</p>}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
<<<<<<< HEAD
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                {editingPerguntaId ? 'Editando pergunta' : 'Nova pergunta'}
              </h3>
              <label className="sr-only" htmlFor="pergunta-texto">Texto da pergunta</label>
              <textarea id="pergunta-texto" placeholder="Texto da pergunta" value={novaPergunta.texto_pergunta}
                maxLength={MAX_TEXTO_PERGUNTA}
                onChange={e => setNovaPergunta(s => ({ ...s, texto_pergunta: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" rows={2} />
              <div className="grid md:grid-cols-2 gap-3">
                {(['opcao_a', 'opcao_b', 'opcao_c', 'opcao_d'] as const).map((campo, i) => (
                  <div key={campo}>
                    <label className="sr-only" htmlFor={`pergunta-${campo}`}>{`Opção ${String.fromCharCode(65 + i)}`}</label>
                    <input
                      id={`pergunta-${campo}`}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                      value={novaPergunta[campo]}
                      maxLength={MAX_OPCAO}
                      onChange={e => setNovaPergunta(s => ({ ...s, [campo]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="pergunta-resposta-correta">Resposta correta</label>
                <select id="pergunta-resposta-correta" value={novaPergunta.resposta_correta}
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
                  onChange={e => setNovaPergunta(s => ({ ...s, resposta_correta: e.target.value }))}
                  className="px-4 py-2 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none">
                  {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
<<<<<<< HEAD
              <div className="flex gap-3">
                {editingPerguntaId ? (
                  <>
                    <button onClick={salvarEdicaoPergunta} disabled={isLoading('pergunta-salvar')}
                      className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                      {isLoading('pergunta-salvar') ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button onClick={cancelEditPergunta} className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={handleCriarPergunta} disabled={isLoading('pergunta-criar')}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {isLoading('pergunta-criar') ? 'Adicionando...' : 'Adicionar Pergunta'}
                  </button>
                )}
              </div>
=======
              <button onClick={handleCriarPergunta} disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                Adicionar Pergunta
              </button>
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
            </div>
          </div>
        )}

        {msg && (
<<<<<<< HEAD
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm shadow-xl ${
              msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'
            }`}
          >
=======
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm shadow-xl ${
            msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'
          }`}>
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

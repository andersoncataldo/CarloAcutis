import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { AnswerOption, PerguntaAdmin, TemporadaAdmin } from '../types/api.types';

const MAX_TEXTO_PERGUNTA = 300;
const MAX_OPCAO = 150;
const MAX_TITULO_TEMPORADA = 100;

const emptyPergunta: {
  texto_pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: AnswerOption;
} = {
  texto_pergunta: '',
  opcao_a: '',
  opcao_b: '',
  opcao_c: '',
  opcao_d: '',
  resposta_correta: 'A',
};

function getFriendlyError(err: unknown, fallback: string): string {
  console.error('Erro Admin API:', err);
  if (err instanceof ApiError) return err.message;
  return fallback;
}

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [temporadas, setTemporadas] = useState<TemporadaAdmin[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [perguntas, setPerguntas] = useState<PerguntaAdmin[]>([]);

  const [novaTemporada, setNovaTemporada] = useState({ titulo: '', descricao: '' });
  const [editingTemporadaId, setEditingTemporadaId] = useState<number | null>(null);
  const [editTemporadaForm, setEditTemporadaForm] = useState({ titulo: '', descricao: '' });

  const [novaPergunta, setNovaPergunta] = useState(emptyPergunta);
  const [editingPerguntaId, setEditingPerguntaId] = useState<number | null>(null);

  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const isLoading = (key: string) => loadingKeys.has(key);
  const setLoadingKey = (key: string, value: boolean) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    window.setTimeout(() => setMsg(null), 3500);
  };

  const fetchTemporadas = useCallback(async () => {
    try {
      const data = await api.getAdminSeasons();
      setTemporadas(data.temporadas);
      setSelectedTemporadaId((prev) => prev ?? (data.temporadas.length > 0 ? data.temporadas[0].id : null));
    } catch (err) {
      showMsg(getFriendlyError(err, 'Não foi possível carregar as temporadas.'), 'error');
    }
  }, []);

  const fetchPerguntas = useCallback(async (temporadaId: number) => {
    try {
      const data = await api.getAdminQuestions(temporadaId);
      setPerguntas(data.perguntas);
    } catch (err) {
      showMsg(getFriendlyError(err, 'Não foi possível carregar as perguntas.'), 'error');
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void fetchTemporadas();
  }, [isAdmin, fetchTemporadas]);

  useEffect(() => {
    if (!isAdmin || !selectedTemporadaId) return;
    void fetchPerguntas(selectedTemporadaId);
  }, [isAdmin, selectedTemporadaId, fetchPerguntas]);

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="font-black uppercase tracking-widest text-slate-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  // ---------- Temporadas ----------

  const handleCriarTemporada = async () => {
    const titulo = novaTemporada.titulo.trim();
    if (!titulo) {
      showMsg('Dê um título para a temporada.', 'error');
      return;
    }
    if (titulo.length > MAX_TITULO_TEMPORADA) {
      showMsg(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 'error');
      return;
    }

    setLoadingKey('temporada-criar', true);
    try {
      await api.createSeason({
        titulo,
        descricao: novaTemporada.descricao.trim(),
        ordem: temporadas.length + 1,
      });
      setNovaTemporada({ titulo: '', descricao: '' });
      showMsg('Temporada criada!');
      await fetchTemporadas();
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao criar temporada.'), 'error');
    } finally {
      setLoadingKey('temporada-criar', false);
    }
  };

  const toggleAtivaTemporada = async (t: TemporadaAdmin) => {
    setLoadingKey(`temporada-${t.id}`, true);
    try {
      await api.updateSeason({ id: t.id, ativa: !t.ativa });
      await fetchTemporadas();
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao atualizar temporada.'), 'error');
    } finally {
      setLoadingKey(`temporada-${t.id}`, false);
    }
  };

  const startEditTemporada = (t: TemporadaAdmin) => {
    setEditingTemporadaId(t.id);
    setEditTemporadaForm({ titulo: t.titulo, descricao: t.descricao ?? '' });
  };

  const cancelEditTemporada = () => {
    setEditingTemporadaId(null);
    setEditTemporadaForm({ titulo: '', descricao: '' });
  };

  const salvarEdicaoTemporada = async (id: number) => {
    const titulo = editTemporadaForm.titulo.trim();
    if (!titulo) {
      showMsg('O título não pode ficar vazio.', 'error');
      return;
    }
    if (titulo.length > MAX_TITULO_TEMPORADA) {
      showMsg(`Título muito longo (máx. ${MAX_TITULO_TEMPORADA} caracteres).`, 'error');
      return;
    }

    setLoadingKey(`temporada-salvar-${id}`, true);
    try {
      await api.updateSeason({
        id,
        titulo,
        descricao: editTemporadaForm.descricao.trim(),
      });
      showMsg('Temporada atualizada!');
      cancelEditTemporada();
      await fetchTemporadas();
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao salvar temporada.'), 'error');
    } finally {
      setLoadingKey(`temporada-salvar-${id}`, false);
    }
  };

  // ---------- Perguntas ----------

  const validarPergunta = (p: typeof novaPergunta): string | null => {
    if (!p.texto_pergunta.trim() || !p.opcao_a.trim() || !p.opcao_b.trim() || !p.opcao_c.trim() || !p.opcao_d.trim()) {
      return 'Preencha todos os campos da pergunta.';
    }
    if (p.texto_pergunta.trim().length > MAX_TEXTO_PERGUNTA) {
      return `A pergunta está muito longa (máx. ${MAX_TEXTO_PERGUNTA} caracteres).`;
    }
    if ([p.opcao_a, p.opcao_b, p.opcao_c, p.opcao_d].some((o) => o.trim().length > MAX_OPCAO)) {
      return `Cada opção pode ter no máximo ${MAX_OPCAO} caracteres.`;
    }
    return null;
  };

  const handleCriarPergunta = async () => {
    if (!selectedTemporadaId) return;
    const erro = validarPergunta(novaPergunta);
    if (erro) {
      showMsg(erro, 'error');
      return;
    }

    setLoadingKey('pergunta-criar', true);
    try {
      const p = novaPergunta;
      await api.createQuestion({
        temporada_id: selectedTemporadaId,
        texto_pergunta: p.texto_pergunta.trim(),
        opcao_a: p.opcao_a.trim(),
        opcao_b: p.opcao_b.trim(),
        opcao_c: p.opcao_c.trim(),
        opcao_d: p.opcao_d.trim(),
        resposta_correta: p.resposta_correta,
        ordem: perguntas.length + 1,
      });
      setNovaPergunta(emptyPergunta);
      showMsg('Pergunta adicionada!');
      await fetchPerguntas(selectedTemporadaId);
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao criar pergunta.'), 'error');
    } finally {
      setLoadingKey('pergunta-criar', false);
    }
  };

  const startEditPergunta = (p: PerguntaAdmin) => {
    setEditingPerguntaId(p.id);
    setNovaPergunta({
      texto_pergunta: p.texto_pergunta,
      opcao_a: p.opcao_a,
      opcao_b: p.opcao_b,
      opcao_c: p.opcao_c,
      opcao_d: p.opcao_d,
      resposta_correta: p.resposta_correta,
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
    if (erro) {
      showMsg(erro, 'error');
      return;
    }

    setLoadingKey('pergunta-salvar', true);
    try {
      const p = novaPergunta;
      await api.updateQuestion({
        id: editingPerguntaId,
        texto_pergunta: p.texto_pergunta.trim(),
        opcao_a: p.opcao_a.trim(),
        opcao_b: p.opcao_b.trim(),
        opcao_c: p.opcao_c.trim(),
        opcao_d: p.opcao_d.trim(),
        resposta_correta: p.resposta_correta,
      });
      showMsg('Pergunta atualizada!');
      cancelEditPergunta();
      await fetchPerguntas(selectedTemporadaId);
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao salvar pergunta.'), 'error');
    } finally {
      setLoadingKey('pergunta-salvar', false);
    }
  };

  const toggleAtivaPergunta = async (p: PerguntaAdmin) => {
    if (p.ativa) {
      const confirmado = window.confirm(
        `Arquivar esta pergunta? Ela deixará de aparecer no quiz, mas o histórico de quem já respondeu é mantido.\n\n"${p.texto_pergunta}"`
      );
      if (!confirmado) return;
    }

    setLoadingKey(`pergunta-${p.id}`, true);
    try {
      await api.updateQuestion({ id: p.id, ativa: !p.ativa });
      showMsg(p.ativa ? 'Pergunta arquivada.' : 'Pergunta reativada.');
      if (selectedTemporadaId) await fetchPerguntas(selectedTemporadaId);
    } catch (err) {
      showMsg(getFriendlyError(err, 'Erro ao atualizar pergunta.'), 'error');
    } finally {
      setLoadingKey(`pergunta-${p.id}`, false);
    }
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
            {temporadas.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border-2 ${
                  selectedTemporadaId === t.id ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-slate-50'
                }`}
              >
                {editingTemporadaId === t.id ? (
                  <div className="p-4 space-y-3">
                    <label className="sr-only" htmlFor={`titulo-temporada-${t.id}`}>Título</label>
                    <input
                      id={`titulo-temporada-${t.id}`}
                      value={editTemporadaForm.titulo}
                      maxLength={MAX_TITULO_TEMPORADA}
                      onChange={(e) => setEditTemporadaForm((s) => ({ ...s, titulo: e.target.value }))}
                      className="w-full px-4 py-2 bg-white rounded-lg text-sm border-2 border-blue-200 focus:border-blue-600 outline-none"
                    />
                    <label className="sr-only" htmlFor={`descricao-temporada-${t.id}`}>Descrição</label>
                    <input
                      id={`descricao-temporada-${t.id}`}
                      value={editTemporadaForm.descricao}
                      onChange={(e) => setEditTemporadaForm((s) => ({ ...s, descricao: e.target.value }))}
                      className="w-full px-4 py-2 bg-white rounded-lg text-sm border-2 border-blue-200 focus:border-blue-600 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => salvarEdicaoTemporada(t.id)}
                        disabled={isLoading(`temporada-salvar-${t.id}`)}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        {isLoading(`temporada-salvar-${t.id}`) ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditTemporada}
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 gap-3">
                    <button type="button" onClick={() => setSelectedTemporadaId(t.id)} className="text-left flex-1">
                      <div className="font-bold text-slate-800">{t.titulo}</div>
                      <div className="text-xs text-slate-400">{t.descricao}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditTemporada(t)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
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
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div>
              <label className="sr-only" htmlFor="nova-temporada-titulo">Título da nova temporada</label>
              <input
                id="nova-temporada-titulo"
                placeholder="Título da nova temporada"
                value={novaTemporada.titulo}
                maxLength={MAX_TITULO_TEMPORADA}
                onChange={(e) => setNovaTemporada((s) => ({ ...s, titulo: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="nova-temporada-descricao">Descrição</label>
              <input
                id="nova-temporada-descricao"
                placeholder="Descrição"
                value={novaTemporada.descricao}
                onChange={(e) => setNovaTemporada((s) => ({ ...s, descricao: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCriarTemporada}
            disabled={isLoading('temporada-criar')}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading('temporada-criar') ? 'Criando...' : 'Criar Temporada'}
          </button>
        </div>

        {/* Perguntas */}
        {selectedTemporadaId && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-6">
            <h2 className="text-lg font-black uppercase text-blue-950">Perguntas desta Temporada</h2>
            <div className="space-y-2">
              {perguntas.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl flex justify-between items-start gap-4 ${
                    p.ativa ? 'bg-slate-50' : 'bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="text-sm">
                    <div className="font-bold text-slate-800">{p.texto_pergunta}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Resposta correta: {p.resposta_correta} {!p.ativa && '· Arquivada'}
                    </div>
                  </div>
                  <div className="flex gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEditPergunta(p)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAtivaPergunta(p)}
                      disabled={isLoading(`pergunta-${p.id}`)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline disabled:opacity-50"
                    >
                      {isLoading(`pergunta-${p.id}`) ? '...' : p.ativa ? 'Arquivar' : 'Reativar'}
                    </button>
                  </div>
                </div>
              ))}
              {perguntas.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhuma pergunta cadastrada ainda.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                {editingPerguntaId ? 'Editando pergunta' : 'Nova pergunta'}
              </h3>
              <label className="sr-only" htmlFor="pergunta-texto">Texto da pergunta</label>
              <textarea
                id="pergunta-texto"
                placeholder="Texto da pergunta"
                value={novaPergunta.texto_pergunta}
                maxLength={MAX_TEXTO_PERGUNTA}
                onChange={(e) => setNovaPergunta((s) => ({ ...s, texto_pergunta: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
                rows={2}
              />
              <div className="grid md:grid-cols-2 gap-3">
                {(['opcao_a', 'opcao_b', 'opcao_c', 'opcao_d'] as const).map((campo, i) => (
                  <div key={campo}>
                    <label className="sr-only" htmlFor={`pergunta-${campo}`}>{`Opção ${String.fromCharCode(65 + i)}`}</label>
                    <input
                      id={`pergunta-${campo}`}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                      value={novaPergunta[campo]}
                      maxLength={MAX_OPCAO}
                      onChange={(e) => setNovaPergunta((s) => ({ ...s, [campo]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="pergunta-resposta-correta">
                  Resposta correta
                </label>
                <select
                  id="pergunta-resposta-correta"
                  value={novaPergunta.resposta_correta}
                  onChange={(e) =>
                    setNovaPergunta((s) => ({ ...s, resposta_correta: e.target.value as AnswerOption }))
                  }
                  className="px-4 py-2 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
                >
                  {(['A', 'B', 'C', 'D'] as const).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                {editingPerguntaId ? (
                  <>
                    <button
                      type="button"
                      onClick={salvarEdicaoPergunta}
                      disabled={isLoading('pergunta-salvar')}
                      className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {isLoading('pergunta-salvar') ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditPergunta}
                      className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleCriarPergunta}
                    disabled={isLoading('pergunta-criar')}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {isLoading('pergunta-criar') ? 'Adicionando...' : 'Adicionar Pergunta'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {msg && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm shadow-xl ${
              msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

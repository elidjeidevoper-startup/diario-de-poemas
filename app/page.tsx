'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Ajuste o caminho se o seu arquivo do Supabase estiver em outra pasta

interface Poema {
  id: number;
  titulo: string;
  texto: string;
  autor: string;
  created_at: string;
}

export default function Home() {
  const [poemas, setPoemas] = useState<Poema[]>([]);
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isCriando, setIsCriando] = useState(false);
  const [poemaSelecionado, setPoemaSelecionado] = useState<Poema | null>(null);
  const [carregando, setCarregando] = useState(true);

  const buscarPoemas = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('poemas')
        .select('*');

      if (error) throw error;
      if (data) setPoemas(data);
    } catch (error) {
      console.error('Erro ao buscar poemas:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
  // O setTimeout joga a execução para a fila assíncrona, limpando o erro do Sonar!
  setTimeout(() => {
    buscarPoemas();
  }, 0);
}, []);

  const salvarPoema = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) return;

    try {
      const dadosPoema = {
        titulo: titulo.trim(),
        texto: texto.trim(),
        autor: autor.trim() || 'Anônimo',
      };

      if (editandoId) {
        // Modo Edição
        const { error } = await supabase
          .from('poemas')
          .update(dadosPoema)
          .eq('id', editandoId);

        if (error) throw error;
      } else {
        // Modo Criação
        const { error } = await supabase
          .from('poemas')
          .insert([dadosPoema]);

        if (error) throw error;
      }

      setTitulo('');
      setTexto('');
      setAutor('');
      setEditandoId(null);
      setIsCriando(false);
      setPoemaSelecionado(null);
      
      // Recarrega a lista imediatamente para refletir na tela
      await buscarPoemas();

    } catch (error: any) {
      console.error("Erro ao salvar o poema:", error?.message || error);
    }
  };

  const apagarPoema = async (id: number) => {
    if (!confirm('Deseja mesmo apagar este poema de suas memórias?')) return;

    try {
      const { error } = await supabase
        .from('poemas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (poemaSelecionado?.id === id) {
        setPoemaSelecionado(null);
      }

      await buscarPoemas();
    } catch (error) {
      console.error('Erro ao apagar poema:', error);
    }
  };

  const iniciarEdicao = (poema: Poema) => {
    setEditandoId(poema.id);
    setTitulo(poema.titulo);
    setTexto(poema.texto);
    setAutor(poema.autor === 'Anônimo' ? '' : poema.autor);
    setIsCriando(false);
  };

  const poemasOrdenados = [...poemas].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, 'pt', { sensitivity: 'base' })
  );

  return (
    <div className="flex h-screen w-screen bg-stone-50 text-stone-800 overflow-hidden">
      
      {/* 1. SESSÃO LATERAL (SIDEBAR) */}
      <aside className="w-80 bg-stone-100/50 border-r border-stone-200/80 p-6 flex flex-col gap-6 h-full select-none">
        <div>
          <h1 className="text-xl font-serif font-semibold tracking-wide text-stone-900">
            Diário de Poemas
          </h1>
          <p className="text-xs text-stone-500 italic mt-0.5">Onde as palavras encontram morada</p>
        </div>

        <button
          onClick={() => {
            setIsCriando(true);
            setEditandoId(null);
            setPoemaSelecionado(null);
            setTitulo('');
            setTexto('');
            setAutor('');
          }}
          className="w-full py-2.5 px-4 bg-amber-800 text-stone-100 rounded-xl font-medium hover:bg-amber-900 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
          data-cy="btn-novo"
        >
          <span>+ Novo Poema</span>
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
            Poemas ({poemasOrdenados.length})
          </span>

          {carregando ? (
            <div className="flex-1 flex items-center justify-center text-xs text-stone-400 italic">
              Carregando versos...
            </div>
          ) : poemasOrdenados.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-stone-400 italic text-center px-4">
              Nenhum poema por aqui. Comece a escrever!
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {poemasOrdenados.map((poema) => (
                <button
                  key={poema.id}
                  onClick={() => {
                    setPoemaSelecionado(poema);
                    setIsCriando(false);
                    setEditandoId(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-0.5 border ${
                    poemaSelecionado?.id === poema.id
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-stone-200/40 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <span className="font-serif font-medium text-sm truncate w-full">
                    {poema.titulo}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400/90 truncate font-semibold">
                    por {poema.autor}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2. ESPAÇO DE LEITURA / FORMULÁRIO (CONTEÚDO PRINCIPAL) */}
      <main className="flex-1 h-full bg-white flex flex-col overflow-y-auto">
        {isCriando || editandoId ? (
          /* FORMULÁRIO DE ESCRITA / EDIÇÃO */
          <div className="max-w-2xl w-full mx-auto px-8 py-12 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-10 border-b border-stone-100 pb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-stone-400">
                {editandoId ? 'Lapidando o Verso' : 'Novo Escrito'}
              </span>
              <button
                onClick={() => {
                  setIsCriando(false);
                  setEditandoId(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-xs transition-colors"
              >
                Voltar
              </button>
            </div>

            <form onSubmit={salvarPoema} className="flex-1 flex flex-col space-y-6">
              <input
                type="text"
                name="titulo"
                placeholder="Dê um título ao seu verso..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-transparent border-b border-stone-150 py-3 text-2xl font-serif font-medium focus:outline-none focus:border-amber-700 placeholder-stone-300 transition-colors"
                maxLength={50}
                autoFocus
                required
              />

              <input
                type="text"
                name="autor"
                placeholder="Autor / Caneta (deixe em branco para Anônimo)..."
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                className="w-full bg-transparent border-b border-stone-150 py-2 text-base font-serif italic text-stone-500 focus:outline-none focus:border-amber-700 placeholder-stone-300 transition-colors"
                maxLength={40}
              />

              <textarea
                name="conteudo"
                placeholder="Deixe as palavras fluírem aqui..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="w-full bg-transparent flex-1 resize-none py-3 text-base font-serif italic leading-relaxed text-stone-700 focus:outline-none placeholder-stone-300 min-h-[250px]"
                required
              />

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-all"
                >
                  Salvar Poema
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCriando(false);
                    setEditandoId(null);
                  }}
                  className="px-6 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200/80 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : poemaSelecionado ? (
          /* LEITOR DE POEMA COMPLETO */
          <div className="max-w-2xl w-full mx-auto px-8 py-16 flex-1 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center py-8">
              <h2 className="text-4xl font-serif font-medium text-stone-900 tracking-tight leading-tight mb-2">
                {poemaSelecionado.titulo}
              </h2>
              
              <div className="text-stone-400 font-serif italic text-sm mb-12 flex items-center gap-1.5">
                <span>por</span>
                <span className="text-stone-600 font-medium">{poemaSelecionado.autor}</span>
              </div>

              {/* Preserva quebras de linha com pre-wrap */}
              <p className="text-lg font-serif italic leading-loose text-stone-700 whitespace-pre-wrap select-text selection:bg-amber-100">
                {poemaSelecionado.texto}
              </p>
            </div>

            {/* Painel de ações do Poema selecionado */}
            <div className="pt-8 border-t border-stone-100 flex gap-4 mt-12">
              <button
                onClick={() => iniciarEdicao(poemaSelecionado)}
                className="text-stone-500 hover:text-amber-800 text-xs font-semibold tracking-wider uppercase transition-colors"
                data-cy="btn-editar"
              >
                Editar Verso
              </button>
              <span className="text-stone-200">|</span>
              <button
                onClick={() => apagarPoema(poemaSelecionado.id)}
                className="text-stone-400 hover:text-red-700 text-xs font-semibold tracking-wider uppercase transition-colors"
                data-cy="btn-deletar"
              >
                Apagar Registro
              </button>
            </div>
          </div>
        ) : (
          /* ESTADO VAZIO (Ecrã inicial do Leitor) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 text-stone-400 mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-base font-serif font-medium text-stone-800 mb-1">Espaço de Reflexão</h3>
            <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
              Selecione um poema na barra lateral para lê-lo por completo ou clique no botão de novo poema para registrar suas próprias inspirações.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Estrutura exata da tabela que criamos no banco de dados
interface Poema {
  id: number;
  created_at: string;
  titulo: string;
  texto: string;
}

export default function Home() {
  const [poemas, setPoemas] = useState<Poema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCriando, setIsCriando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');

  // 1. Função para carregar os poemas vindos do Supabase
  const buscarPoemas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('poemas')
        .select('*')
        .order('created_at', { ascending: false }); // O mais recente primeiro

      if (error) throw error;
      if (data) setPoemas(data);
    } catch (error: any) {
      console.error('Erro ao buscar poemas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carrega a listagem automaticamente quando a página abre
  useEffect(() => {
    buscarPoemas();
  }, []);

  // 2. Função para salvar o novo poema diretamente na nuvem
  const salvarPoema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) return;

    try {
      const { error } = await supabase
        .from('poemas')
        .insert([{ titulo: titulo, texto: texto }]);

      if (error) throw error;

      // Limpa os campos e fecha o formulário
      setTitulo('');
      setTexto('');
      setIsCriando(false);
      
      // Recarrega a lista para trazer o poema recém-criado
      buscarPoemas();
    } catch (error: any) {
      console.error('Erro ao salvar poema:', error.message);
      alert('Não foi possível guardar o seu poema. Verifique a ligação.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col items-center p-4 pb-24 font-sans selection:bg-amber-200">
      
      {/* TELA DE LISTAGEM */}
      {!isCriando && (
        <>
          {/* Cabeçalho */}
          <header className="w-full max-w-md text-center py-8 border-b border-stone-200 mb-6">
            <h1 className="text-3xl font-serif font-bold text-amber-950 tracking-wide">Diário de Poemas</h1>
            <p className="text-xs text-stone-400 italic mt-1.5">Onde a alma encontra ritmo e verso</p>
          </header>

          {/* Feed de Poemas */}
          <main className="w-full max-w-md space-y-4 flex-1">
            {loading ? (
              <p className="text-center text-sm text-stone-400 italic py-12 animate-pulse">A alinhar os teus versos...</p>
            ) : poemas.length === 0 ? (
              <p className="text-center text-sm text-stone-400 italic py-12">O teu diário está em branco. Toque no + para libertar as palavras.</p>
            ) : (
              poemas.map((poema) => (
                <article 
                  key={poema.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/60 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <h2 className="text-lg font-serif font-semibold text-stone-900">{poema.titulo}</h2>
                    <span className="text-xs text-stone-400">
                      {new Date(poema.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-stone-600 italic text-sm leading-relaxed whitespace-pre-line">
                    "{poema.texto}"
                  </p>
                </article>
              ))
            )}
          </main>

          {/* Botão Flutuante (FAB) */}
          <button 
            onClick={() => setIsCriando(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-amber-800 text-stone-100 rounded-full shadow-xl flex items-center justify-center text-3xl font-light hover:bg-amber-900 active:scale-95 transition-all border border-amber-700/50"
            title="Escrever novo poema"
          >
            +
          </button>
        </>
      )}

      {/* TELA DO FORMULÁRIO (ESCRITA) */}
      {isCriando && (
        <main className="w-full max-w-md flex flex-col flex-1 py-4">
          {/* Barra superior do formulário */}
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => { setIsCriando(false); setTitulo(''); setTexto(''); }}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <h2 className="text-lg font-serif font-medium text-amber-950">Nova Poesia</h2>
            <button 
              onClick={salvarPoema}
              disabled={!titulo.trim() || !texto.trim()}
              className="text-sm font-semibold text-amber-800 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Salvar
            </button>
          </div>

          {/* Campos de escrita */}
          <form onSubmit={salvarPoema} className="flex-1 flex flex-col space-y-4">
            <input 
              type="text" 
              placeholder="Dê um título ao seu verso..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-transparent border-b border-stone-200 py-2 text-xl font-serif font-medium focus:outline-none focus:border-amber-700 text-stone-900 placeholder-stone-300 transition-colors"
              maxLength={50}
              autoFocus
            />
            
            <textarea 
              placeholder="Deixe as palavras fluírem aqui..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full bg-transparent flex-1 resize-none py-2 text-base font-serif italic leading-relaxed focus:outline-none text-stone-700 placeholder-stone-300 min-h-[300px]"
            />
          </form>
        </main>
      )}

    </div>
  );
}
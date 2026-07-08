import React from 'react';

// Dados fictícios para simular os poemas salvos
const mockPoemas = [
  {
    id: 1,
    titulo: "Código e Acordes",
    data: "08/07/2026",
    trecho: "As teclas do piano imitam o teclado do computador, em ambos procuro harmonia, em ambos coloco amor..."
  },
  {
    id: 2,
    titulo: "Madrugada Estática",
    data: "05/07/2026",
    trecho: "No silêncio do estúdio a frequência se faz melodia. O que o peito esconde, a linha de código recria."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col items-center p-4 pb-24 font-sans selection:bg-amber-200">
      
      {/* Cabeçalho */}
      <header className="w-full max-w-md text-center py-8 border-b border-stone-200 mb-6">
        <h1 className="text-3xl font-serif font-bold text-amber-950 tracking-wide">Diário de Poemas</h1>
        <p className="text-xs text-stone-400 italic mt-1.5">Onde a alma encontra ritmo e verso</p>
      </header>

      {/* Feed de Poemas */}
      <main className="w-full max-w-md space-y-4 flex-1">
        {mockPoemas.map((poema) => (
          <article 
            key={poema.id} 
            className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200/60 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="text-lg font-serif font-semibold text-stone-900">{poema.titulo}</h2>
              <span className="text-xs text-stone-400">{poema.data}</span>
            </div>
            <p className="text-stone-600 italic text-sm line-clamp-2 leading-relaxed">
              "{poema.trecho}"
            </p>
          </article>
        ))}
      </main>

      {/* Botão Flutuante (FAB) para Novo Poema */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-800 text-stone-100 rounded-full shadow-xl flex items-center justify-center text-3xl font-light hover:bg-amber-900 active:scale-95 transition-all border border-amber-700/50"
        title="Escrever novo poema"
      >
        +
      </button>

    </div>
  );
}
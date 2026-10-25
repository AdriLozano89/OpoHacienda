import React, { useState } from 'react';
import { FlashcardItem } from '../types/oposicion';
import { RotateCw, CheckCircle2, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, Layers, Filter } from 'lucide-react';

interface FlashcardsTabProps {
  flashcards: FlashcardItem[];
  onCardStatusChange?: (cardId: number, status: 'hard' | 'doubt' | 'mastered') => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  onCardStatusChange,
}) => {
  const [cardsState, setCardsState] = useState<Record<number, 'unreviewed' | 'hard' | 'doubt' | 'mastered'>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'study' | 'grid'>('study');

  // Filter cards by category
  const filteredCards = flashcards.filter((card) => {
    if (selectedCategory === 'all') return true;
    return card.category === selectedCategory;
  });

  const currentCard = filteredCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSetStatus = (status: 'hard' | 'doubt' | 'mastered') => {
    if (!currentCard) return;
    setCardsState((prev) => ({
      ...prev,
      [currentCard.id]: status,
    }));
    if (onCardStatusChange) {
      onCardStatusChange(currentCard.id, status);
    }
    // Auto advance to next card
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(filteredCards.length - 1, prev + 1));
  };

  // Stats
  const masteredCount = Object.values(cardsState).filter((s) => s === 'mastered').length;
  const progressPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                Regla 3 • Fijación Nemotécnica Rápida
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {flashcards.length} tarjetas de memoria
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Flashcards de Memorización: Artículos, Plazos y Sanciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Toca o haz clic para girar la tarjeta. Memoriza el dato normativo exacto antes de ver el reverso.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#001730] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1 gap-4 font-medium">
                <span>Dominadas:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {masteredCount}/{flashcards.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
              <button
                onClick={() => setViewMode(viewMode === 'study' ? 'grid' : 'study')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{viewMode === 'study' ? 'Cuadrícula' : 'Modo Estudio'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Category Filters */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <span className="text-slate-500 mr-1 flex items-center gap-1 text-[11px] font-medium shrink-0">
            <Filter className="w-3 h-3" /> Filtro:
          </span>
          {['all', 'Plazo', 'Artículo', 'Sanción', 'Concepto', 'Órgano'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                selectedCategory === cat
                  ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-[#001B36] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Study View (Carousel) */}
      {viewMode === 'study' && currentCard && (
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Card Counter & Category Badge */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-mono font-semibold">
              Tarjeta {currentIndex + 1} de {filteredCards.length}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              currentCard.category === 'Plazo'
                ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                : currentCard.category === 'Sanción'
                ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                : currentCard.category === 'Artículo'
                ? 'bg-blue-100 dark:bg-sky-500/15 text-blue-800 dark:text-sky-300 border border-blue-300 dark:border-sky-500/30'
                : 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30'
            }`}>
              {currentCard.category}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[260px] cursor-pointer rounded-2xl bg-white dark:bg-[#001D3A] border-2 border-slate-200 dark:border-slate-700 hover:border-[#003366] dark:hover:border-[#D4AF37] transition-all p-6 sm:p-8 flex flex-col justify-between shadow-lg relative select-none"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {!isFlipped ? 'Anverso • Pregunta / Concepto' : 'Reverso • Respuesta / Plazo Legal'}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <RotateCw className="w-3.5 h-3.5 text-[#003366] dark:text-[#D4AF37]" />
                <span className="text-[11px] font-medium">Girar tarjeta</span>
              </div>
            </div>

            {/* Content Text */}
            <div className="py-8 my-auto text-center">
              {!isFlipped ? (
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentCard.front}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-base sm:text-lg font-bold text-[#003366] dark:text-[#D4AF37] leading-relaxed">
                    {currentCard.back}
                  </p>
                  {currentCard.regulation && (
                    <span className="inline-block mt-2 font-mono text-xs font-bold text-slate-700 dark:text-sky-300 bg-slate-100 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-slate-300 dark:border-sky-800">
                      {currentCard.regulation}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Status Tip */}
            <div className="text-center text-[11px] text-slate-400 font-mono">
              {!isFlipped ? 'Haz clic para revelar el artículo o plazo' : 'Indica abajo si te lo sabías'}
            </div>
          </div>

          {/* Self-Assessment Buttons (When flipped) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleSetStatus('hard')}
              className="py-3 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-red-200 dark:border-rose-500/30 text-[#AA151B] dark:text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-[#AA151B] dark:text-rose-400" />
              <span>Difícil (Repasar)</span>
            </button>
            <button
              onClick={() => handleSetStatus('doubt')}
              className="py-3 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Con Dudas</span>
            </button>
            <button
              onClick={() => handleSetStatus('mastered')}
              className="py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>¡Dominada!</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredCards.length - 1}
              className="px-4 py-2.5 bg-[#003366] dark:bg-[#D4AF37] hover:bg-[#002244] dark:hover:bg-[#BF9B30] disabled:opacity-30 text-white dark:text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Grid View Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            return (
              <div
                key={card.id}
                className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-[#003366] dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {card.category}
                    </span>
                    <span className="font-mono text-[10px] text-blue-600 dark:text-sky-400 font-semibold">
                      {card.regulation || ''}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2 leading-relaxed">
                    {card.front}
                  </h5>
                  <div className="p-3 bg-slate-50 dark:bg-[#001730] rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-[#003366] dark:text-[#D4AF37] font-semibold leading-relaxed font-sans">
                    {card.back}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">#{card.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onCardStatusChange && onCardStatusChange(card.id, 'hard')}
                      className="px-2.5 py-1 rounded-md bg-red-50 text-[#AA151B] dark:bg-rose-500/10 dark:text-rose-300 hover:bg-red-100 font-medium text-[10px]"
                    >
                      Repasar
                    </button>
                    <button
                      onClick={() => onCardStatusChange && onCardStatusChange(card.id, 'mastered')}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 hover:bg-emerald-100 font-medium text-[10px]"
                    >
                      Dominada
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

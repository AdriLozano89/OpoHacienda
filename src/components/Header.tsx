import React from 'react';
import { ShieldCheck, Calendar, BookOpen, MessageSquareText, Award, AlertOctagon, BrainCircuit } from 'lucide-react';
import { OposicionLevel } from '../types/oposicion';

interface HeaderProps {
  currentLevel: OposicionLevel;
  onLevelChange: (level: OposicionLevel) => void;
  onOpenChat: () => void;
  onOpenForgettingCurve: () => void;
  onOpenCuadernoFallos: () => void;
  totalAnswered: number;
  totalCorrect: number;
  masteredCardsCount: number;
  failedCount: number;
  urgentReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  onLevelChange,
  onOpenChat,
  onOpenForgettingCurve,
  onOpenCuadernoFallos,
  totalAnswered,
  totalCorrect,
  masteredCardsCount,
  failedCount,
  urgentReviewCount,
}) => {
  const scorePercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Approximate target date: November 15, 2026 for C2
  const targetDateC2 = new Date('2026-11-15T09:00:00');
  const now = new Date();
  const diffDaysC2 = Math.max(0, Math.ceil((targetDateC2.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  OpoHacienda <span className="text-amber-400 font-extrabold">Preparador Pro</span>
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  AEAT C2 & C1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Preparador Jurídico Especializado • LGT, RGR, RGGI & Sancionador
              </p>
            </div>
          </div>

          {/* Goal Targets & Header Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Level Toggle */}
            <div className="bg-slate-800/90 p-1 rounded-lg border border-slate-700 flex items-center shadow-inner">
              <button
                onClick={() => onLevelChange('C2')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  currentLevel === 'C2'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>C2 Agentes ({diffDaysC2}d)</span>
              </button>
              <button
                onClick={() => onLevelChange('C1')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  currentLevel === 'C1'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>C1 Técnicos (2028)</span>
              </button>
            </div>

            {/* Curva del Olvido Button */}
            <button
              onClick={onOpenForgettingCurve}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                urgentReviewCount > 0
                  ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900/80'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Planificador de repasos y curva del olvido Ebbinghaus"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Curva del Olvido</span>
              {urgentReviewCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {urgentReviewCount}
                </span>
              )}
            </button>

            {/* Cuaderno de Fallos Button */}
            <button
              onClick={onOpenCuadernoFallos}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                failedCount > 0
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 hover:bg-rose-900/80'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Cuaderno oficial de fallos para repasar preguntas erróneas"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Fallos ({failedCount})</span>
            </button>

            {/* Duda al Preparador Button */}
            <button
              onClick={onOpenChat}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm ml-auto md:ml-0"
              title="Consultar duda jurídica con el preparador"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
              <span>Duda al Preparador</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

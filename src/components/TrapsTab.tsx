import React, { useState } from 'react';
import { TrapsData } from '../types/oposicion';
import { ShieldAlert, AlertOctagon, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, BookOpen, AlertTriangle } from 'lucide-react';

interface TrapsTabProps {
  traps: TrapsData;
}

export const TrapsTab: React.FC<TrapsTabProps> = ({ traps }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  const items = traps.items || [];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleRevealSolution = (index: number) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-[#AA151B] dark:text-rose-400 bg-red-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-rose-900/40 font-mono">
            Regla 4 • Inteligencia de Tribunal
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {items.length} trampas críticas catalogadas
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Radar de Trampas de Examen y Errores Habituales de los Opositores
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Los tribunales de la AEAT e INAP diseñan las opciones falsas (distractores) utilizando palabras señuelo (&quot;deberá&quot; en lugar de &quot;podrá&quot;, días naturales en vez de hábiles, o aplicando reglas de gestión a la recaudación ejecutiva). Aquí tienes el despiece técnico para neutralizarlas en el examen oficial.
        </p>
      </div>

      {/* Traps List */}
      <div className="space-y-4">
        {items.map((trap, idx) => {
          const isExpanded = expandedIndex === idx;
          const isSolutionRevealed = revealedSolutions[idx];

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-[#002244] border rounded-2xl overflow-hidden transition-all shadow-sm ${
                isExpanded
                  ? 'border-[#003366] dark:border-[#D4AF37] ring-1 ring-[#003366]/20 dark:ring-[#D4AF37]/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header Toggle */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-[#001D38]/60 hover:bg-slate-100/80 dark:hover:bg-[#001D38] transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/40 flex items-center justify-center text-[#AA151B] dark:text-rose-400 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#AA151B] dark:text-rose-400 uppercase tracking-wider">
                      Trampa Oficial #{idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {trap.title}
                    </h4>
                  </div>
                </div>

                <div className="text-slate-400 dark:text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Trap Content */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 space-y-5 text-xs sm:text-sm">
                  
                  {/* Grid 2 Columns: Examiner Trap vs Common Candidate Error */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* The Examiner Trap */}
                    <div className="bg-red-50/80 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-[#AA151B] dark:text-rose-400 mb-2 text-xs uppercase tracking-wider">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Cómo te engaña el Tribunal de la AEAT</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                        {trap.examinerTrap}
                      </p>
                    </div>

                    {/* Common Candidate Pitfall */}
                    <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400 mb-2 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>El error habitual del Opositor</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                        {trap.commonError}
                      </p>
                    </div>

                  </div>

                  {/* The Legal Reality & Deconstruction */}
                  <div className="bg-sky-50/80 dark:bg-[#001933] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-sky-900/40">
                    <div className="flex items-center gap-2 font-bold text-[#003366] dark:text-sky-300 mb-2 text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>La Realidad Jurídica y Despiece del Artículo</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm font-sans">
                      {trap.legalReality}
                    </p>
                  </div>

                  {/* Golden Rule (Regla de Oro Nemotécnica) */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-mono">
                        Regla de Oro para el Examen
                      </span>
                      <p className="text-emerald-950 dark:text-white font-semibold text-xs sm:text-sm mt-0.5 leading-snug">
                        {trap.goldenRule}
                      </p>
                    </div>
                  </div>

                  {/* Sample Trap Question (if available) */}
                  {trap.sampleQuestion && (
                    <div className="bg-slate-50 dark:bg-[#00162B] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                          Ejemplo de Pregunta Trampa Real
                        </span>
                        <button
                          onClick={() => toggleRevealSolution(idx)}
                          className="text-xs text-[#003366] dark:text-[#D4AF37] hover:underline font-bold"
                        >
                          {isSolutionRevealed ? 'Ocultar solución' : 'Ver solución comentada'}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono italic bg-white dark:bg-[#001F3E] p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                        &quot;{trap.sampleQuestion}&quot;
                      </p>

                      {isSolutionRevealed && trap.correctOption && (
                        <div className="pt-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Respuesta correcta según el preparador: </span>
                            <span>{trap.correctOption}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

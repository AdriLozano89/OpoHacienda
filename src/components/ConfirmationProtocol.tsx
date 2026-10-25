import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, FileText, CheckSquare, Layers, ShieldAlert } from 'lucide-react';
import { ViewDensity } from '../hooks/useDensity';

interface ConfirmationProtocolProps {
  density?: ViewDensity;
}

export const ConfirmationProtocol: React.FC<ConfirmationProtocolProps> = ({ density = 'clean' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isClean = density === 'clean';

  // In clean mode when closed, render an ultra-clean, minimal inline badge
  if (isClean && !isOpen) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#001D38] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
          <span>
            <strong>Protocolo Oficial AEAT:</strong> Extracción de artículos y plazos · Tests con baremo oficial (+1 / -0.25) · Flashcards · Trampas
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-[#003366] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1 text-[11px] ml-2 shrink-0"
        >
          <span>Ver 4 Reglas</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#003366] dark:bg-blue-950/60 dark:text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#003366] dark:text-[#D4AF37] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 font-mono">
                Protocolo Oficial AEAT
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                C2 Agentes (Noviembre) & C1 Técnicos (2028)
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
              Metodología Oficial de Preparación y las 4 Reglas Técnicas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
              Cada tema o PDF es procesado con rigor técnico-jurídico estricto según la LGT (Ley 58/2003), RGR, RGGI, RGST y Ley 11/2021.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
        >
          <span>{isOpen ? 'Ocultar' : 'Ver Reglas'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#003366] dark:text-[#D4AF37] mb-1.5">
              <FileText className="w-4 h-4 text-[#003366] dark:text-[#D4AF37] shrink-0" />
              <span>1. Resúmenes de Filtro</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal text-[11px]">
              Solo artículos literales, plazos exactos en tablas (hábiles, naturales, meses) y sanciones con reducciones del art. 188 LGT.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-sky-400 mb-1.5">
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>2. Tests Oficiales</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal text-[11px]">
              Baterías de 10, 25, 50 y 80 preguntas con baremo oficial AEAT (+1.00, -0.25) y justificación motivada de cada opción.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>3. Flashcards 3D</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal text-[11px]">
              Tarjetas nemotécnicas (Concepto &rarr; Definición/Plazo) con sistema de repetición espaciada y fijación rápida.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#AA151B] dark:text-rose-400 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-[#AA151B] dark:text-rose-400 shrink-0" />
              <span>4. Radar de Trampas</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal text-[11px]">
              Despiece de palabras trampa del tribunal (&quot;podrá&quot; vs &quot;deberá&quot;) y errores típicos de los aspirantes.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

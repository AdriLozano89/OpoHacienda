import React, { useState } from 'react';
import { PracticalCase, PracticalCaseStep } from '../types/oposicion';
import { OFFICIAL_PRACTICAL_CASES } from '../data/officialPracticalCases';
import { FileSpreadsheet, CheckCircle2, XCircle, ChevronRight, ChevronLeft, BookOpen, Calculator, Award, RotateCcw, AlertTriangle, Scale } from 'lucide-react';

interface PracticalCasesTabProps {
  onCaseCompleted?: (caseId: string, score: number) => void;
}

export const PracticalCasesTab: React.FC<PracticalCasesTabProps> = ({ onCaseCompleted }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(OFFICIAL_PRACTICAL_CASES[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({});

  const activeCase = OFFICIAL_PRACTICAL_CASES.find((c) => c.id === selectedCaseId) || OFFICIAL_PRACTICAL_CASES[0];
  const steps = activeCase.steps || [];
  const currentStep = steps[currentStepIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (revealedSteps[currentStepIndex]) return; // already revealed
    setUserAnswers((prev) => ({
      ...prev,
      [currentStepIndex]: optionIndex,
    }));
  };

  const handleVerifyStep = () => {
    setRevealedSteps((prev) => ({
      ...prev,
      [currentStepIndex]: true,
    }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleResetCase = () => {
    setUserAnswers({});
    setRevealedSteps({});
    setCurrentStepIndex(0);
  };

  // Metrics
  const answeredStepsCount = Object.keys(revealedSteps).length;
  const correctStepsCount = steps.filter((step, idx) => revealedSteps[idx] && userAnswers[idx] === step.correctIndex).length;
  const isCaseFinished = answeredStepsCount === steps.length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-[#003366] dark:text-[#D4AF37] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/40 font-mono">
            Segundo Ejercicio Oficial • C2 & C1
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {OFFICIAL_PRACTICAL_CASES.length} supuestos prácticos de alta fidelidad
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Simulador de Supuestos Prácticos de la Agencia Tributaria
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Entrena la resolución del examen práctico: analiza el relato de hechos de los inspectores, liquida recargos, computa plazos procesales y fundamenta en los artículos exactos de la Ley General Tributaria y el Reglamento General de Recaudación.
        </p>

        {/* Case Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" /> Caso:
          </span>
          {OFFICIAL_PRACTICAL_CASES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                handleResetCase();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCaseId === c.id
                  ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#001D38] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              #{idx + 1} {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Case Details & Narrative */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#003366] dark:text-[#D4AF37] font-bold">
              {activeCase.difficulty} • {activeCase.category}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {activeCase.title}
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCase}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar caso</span>
            </button>
          </div>
        </div>

        {/* Facts Box */}
        <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
            <span>Relato de Hechos Fácticos (Enunciado del Tribunal):</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {activeCase.facts.map((fact, fIdx) => (
              <li key={fIdx} className="flex items-start gap-2">
                <span className="text-slate-400 font-mono font-bold shrink-0">{fIdx + 1}.</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Step Runner */}
      {currentStep && (
        <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Step Progress & Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-[#003366] dark:text-[#D4AF37]">
              Cuestión {currentStepIndex + 1} de {steps.length}
            </span>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => {
                const isAnswered = revealedSteps[idx];
                const isCurrent = idx === currentStepIndex;
                const isCorrect = isAnswered && userAnswers[idx] === steps[idx].correctIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrent
                        ? 'ring-2 ring-[#003366] dark:ring-[#D4AF37] scale-110'
                        : ''
                    } ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={`Ir a cuestión ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentStep.question}
          </h4>

          {/* Options */}
          <div className="space-y-2.5">
            {currentStep.options.map((option, optIdx) => {
              const isSelected = userAnswers[currentStepIndex] === optIdx;
              const isRevealed = revealedSteps[currentStepIndex];
              const isCorrect = optIdx === currentStep.correctIndex;

              let style = 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#001D38] hover:border-[#003366] dark:hover:border-[#D4AF37] text-slate-800 dark:text-slate-200';

              if (isRevealed) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  style = 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-100 ring-1 ring-red-500';
                } else {
                  style = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                }
              } else if (isSelected) {
                style = 'border-[#003366] dark:border-[#D4AF37] bg-blue-50/60 dark:bg-blue-950/40 text-[#003366] dark:text-[#D4AF37] ring-1 ring-[#003366] dark:ring-[#D4AF37] font-semibold';
              }

              return (
                <button
                  key={optIdx}
                  disabled={isRevealed}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${style}`}
                >
                  <span className="font-mono font-bold uppercase shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)})
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {isRevealed && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isRevealed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Button: Verify or Next */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {!revealedSteps[currentStepIndex] ? (
              <button
                onClick={handleVerifyStep}
                disabled={userAnswers[currentStepIndex] === undefined}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#003366] dark:bg-[#D4AF37] text-white dark:text-slate-950 disabled:opacity-40 hover:bg-[#002244] dark:hover:bg-[#BF9B30] transition-all shadow-sm"
              >
                Comprobar Liquidación y Solución
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#003366] dark:bg-[#D4AF37] text-white dark:text-slate-950 disabled:opacity-40 hover:bg-[#002244] dark:hover:bg-[#BF9B30] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Siguiente Cuestión</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step Explanation & Calculation Breakdown (When verified) */}
          {revealedSteps[currentStepIndex] && (
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
              
              {/* Explanation Text */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#003366] dark:text-[#D4AF37] uppercase tracking-wider text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>Justificación del Tribunal Examinador:</span>
                </div>
                <p>{currentStep.explanation}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentStep.legalArticles.map((art, aIdx) => (
                    <span
                      key={aIdx}
                      className="font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800"
                    >
                      {art}
                    </span>
                  ))}
                </div>
              </div>

              {/* Calculations Table if available */}
              {currentStep.calculations && currentStep.calculations.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Hoja de Cálculo Numérico Oficial:
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <table className="w-full text-left font-sans">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <tr>
                          <th className="p-2.5">Concepto Liquidado</th>
                          <th className="p-2.5 text-right font-mono">Importe / Fecha</th>
                          <th className="p-2.5">Norma / Justificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                        {currentStep.calculations.map((calc, cIdx) => (
                          <tr key={cIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">{calc.concept}</td>
                            <td className="p-2.5 text-right font-bold text-[#003366] dark:text-[#D4AF37] tabular-nums whitespace-nowrap">{calc.amount}</td>
                            <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">{calc.justification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Completion Score Card if all steps done */}
          {isCaseFinished && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#001F3E] dark:to-[#002B54] border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#003366] text-[#D4AF37] flex items-center justify-center font-bold text-xl shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    ¡Supuesto Práctico Completado!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Puntuación: <strong>{correctStepsCount} de {steps.length}</strong> cuestiones resueltas con rigor normativo.
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetCase}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors whitespace-nowrap"
              >
                Volver a Practicar
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { FailedQuestionRecord, QuestionItem, TestData } from '../types/oposicion';
import { X, AlertOctagon, Play, CheckCircle2, BookOpen, Trash2, RotateCcw, Filter, Search } from 'lucide-react';

interface CuadernoDeFallosModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedQuestions: FailedQuestionRecord[];
  onStartRescueTest: (test: TestData, label: string) => void;
  onClearResolvedError: (recordId: string) => void;
  onClearAllErrors: () => void;
}

export const CuadernoDeFallosModal: React.FC<CuadernoDeFallosModalProps> = ({
  isOpen,
  onClose,
  failedQuestions,
  onStartRescueTest,
  onClearResolvedError,
  onClearAllErrors,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedCount, setSelectedCount] = useState<number>(20);

  if (!isOpen) return null;

  // Filter list
  const uniqueTopicNames = Array.from(new Set(failedQuestions.map((f) => f.topicTitle)));

  const filteredList = failedQuestions.filter((f) => {
    const matchesSearch =
      f.question.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.question.legalArticle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.topicTitle.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesTopic = selectedTopicFilter === 'all' || f.topicTitle === selectedTopicFilter;

    return matchesSearch && matchesTopic;
  });

  const handleLaunchRescue = (count: number) => {
    if (filteredList.length === 0) return;

    const chosen = filteredList.slice(0, count).map((item, idx) => ({
      ...item.question,
      id: idx + 1,
    }));

    const test: TestData = {
      title: `Test de Rescate: Cuaderno de Fallos (${chosen.length} preguntas)`,
      level: 'C2',
      questions: chosen,
    };

    onStartRescueTest(test, `Cuaderno de Fallos (${chosen.length} P.)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Cuaderno Oficial de Fallos del Opositor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {failedQuestions.length} errores registrados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                La clave para aprobar una oposición no es hacer mil test, sino no volver a fallar nunca la misma pregunta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Search, Topic filter & Quick Launch */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar en tus fallos..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500/60"
              />
            </div>

            {uniqueTopicNames.length > 1 && (
              <select
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-hidden"
              >
                <option value="all">Todos los temas</option>
                {uniqueTopicNames.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Rescue Launch Buttons */}
          {failedQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Test de Rescate:</span>
              <button
                onClick={() => handleLaunchRescue(10)}
                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>10 P.</span>
              </button>
              <button
                onClick={() => handleLaunchRescue(25)}
                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>25 P.</span>
              </button>
              {failedQuestions.length >= 50 && (
                <button
                  onClick={() => handleLaunchRescue(50)}
                  className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>50 P.</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* List of Failed Questions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {failedQuestions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                ¡Tu Cuaderno de Fallos está impecable!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No tienes ninguna pregunta fallada registrada. Cada vez que falles una pregunta en cualquier test de 10, 25, 50 u 80 preguntas, se guardará aquí automáticamente para que la reentrenes.
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No se encontraron fallos con los filtros seleccionados.
            </div>
          ) : (
            filteredList.map((record) => (
              <div
                key={record.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition-colors"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px]">
                      Fallada {record.timesFailed} {record.timesFailed === 1 ? 'vez' : 'veces'}
                    </span>
                    <span className="font-semibold text-slate-300">
                      {record.topicTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                      {record.question.legalArticle}
                    </span>
                    <button
                      onClick={() => onClearResolvedError(record.id)}
                      className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                      title="Marcar como aprendida y eliminar del cuaderno"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <h5 className="font-semibold text-white leading-relaxed text-xs sm:text-sm">
                  {record.question.question}
                </h5>

                {/* Bad response vs Correct Response */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-rose-950/25 border border-rose-500/30 text-rose-300">
                    <span className="block font-bold text-[10px] uppercase text-rose-400 mb-0.5">
                      Tu error (Opción elegida):
                    </span>
                    <span>
                      {record.question.options[record.selectedOptionIndex]?.replace(/^[A-D]\)\s*/, '') || 'Respuesta errónea'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-300">
                    <span className="block font-bold text-[10px] uppercase text-emerald-400 mb-0.5">
                      Opción Correcta ({record.question.answerLetter}):
                    </span>
                    <span>
                      {record.question.options[record.question.correctIndex]?.replace(/^[A-D]\)\s*/, '')}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-sky-400 block mb-0.5">Fundamentación jurídica del preparador:</span>
                  <p>{record.question.explanation}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {failedQuestions.length > 0 && (
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onClearAllErrors}
              className="text-slate-500 hover:text-rose-400 underline transition-colors"
            >
              Vaciar todo el cuaderno de fallos
            </button>

            <button
              onClick={() => handleLaunchRescue(Math.min(25, failedQuestions.length))}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hacer Test con mis Fallos ({Math.min(25, failedQuestions.length)} P.)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

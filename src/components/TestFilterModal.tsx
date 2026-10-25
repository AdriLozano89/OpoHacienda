import React, { useState } from 'react';
import { CompleteTopicPackage, OposicionLevel, TestData, QuestionItem } from '../types/oposicion';
import { X, Filter, Sparkles, CheckSquare, Layers, AlertOctagon, Play, Shuffle, BookOpen, Check } from 'lucide-react';

interface TestFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: CompleteTopicPackage[];
  onStartFilteredTest: (test: TestData, topicLabel: string) => void;
  failedQuestionIds: Set<string>; // set of `${topicId}-${questionId}`
  failedQuestionsPool: Array<{ topicId: string; topicTitle: string; question: QuestionItem }>;
}

export const TestFilterModal: React.FC<TestFilterModalProps> = ({
  isOpen,
  onClose,
  topics,
  onStartFilteredTest,
  failedQuestionIds,
  failedQuestionsPool,
}) => {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(topics.map((t) => t.id));
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [filterMode, setFilterMode] = useState<'pool_mixed' | 'failed_only' | 'ai_new_combo'>('pool_mixed');
  const [selectedLevel, setSelectedLevel] = useState<OposicionLevel | 'ALL'>('ALL');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter topics by level if selected
  const displayedTopics = topics.filter((t) => {
    if (selectedLevel === 'ALL') return true;
    return t.level === selectedLevel;
  });

  // Toggle single topic
  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedTopicIds(displayedTopics.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTopicIds([]);
  };

  // Calculate available questions pool based on selection
  const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));
  
  const allAvailableQuestions: Array<{ topicTitle: string; question: QuestionItem }> = [];
  selectedTopics.forEach((t) => {
    t.test.questions.forEach((q) => {
      allAvailableQuestions.push({ topicTitle: t.title, question: q });
    });
  });

  const availableFailedInSelection = failedQuestionsPool.filter((item) =>
    selectedTopicIds.includes(item.topicId)
  );

  const handleStartTest = async () => {
    setAiError(null);

    if (selectedTopicIds.length === 0) {
      setAiError('Debes seleccionar al menos un tema para generar el test.');
      return;
    }

    if (filterMode === 'failed_only') {
      if (availableFailedInSelection.length === 0) {
        setAiError('No tienes fallos registrados en los temas seleccionados. ¡Excelente trabajo o realiza primero un test!');
        return;
      }

      // Pick up to questionCount failed questions
      const shuffled = [...availableFailedInSelection].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, questionCount).map((item, idx) => ({
        ...item.question,
        id: idx + 1,
      }));

      const customTest: TestData = {
        title: `Test de Errores y Repaso (${chosen.length} preguntas de ${selectedTopics.length} temas)`,
        level: selectedTopics[0]?.level || 'C2',
        questions: chosen,
      };

      onStartFilteredTest(customTest, `Repaso de Fallos (${selectedTopics.length} temas)`);
      onClose();
      return;
    }

    if (filterMode === 'pool_mixed') {
      if (allAvailableQuestions.length === 0) {
        setAiError('Los temas seleccionados no contienen preguntas disponibles.');
        return;
      }

      // Shuffle and pick balanced sample
      const shuffled = [...allAvailableQuestions].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, questionCount).map((item, idx) => ({
        ...item.question,
        id: idx + 1,
      }));

      const customTest: TestData = {
        title: `Simulacro Oficial Multitema (${chosen.length} preguntas filtradas)`,
        level: selectedTopics[0]?.level || 'C2',
        questions: chosen,
      };

      onStartFilteredTest(customTest, `Simulacro Combinado (${selectedTopics.length} temas)`);
      onClose();
      return;
    }

    // AI New Combo generation
    if (filterMode === 'ai_new_combo') {
      setIsGeneratingAi(true);
      try {
        const topicSummaries = selectedTopics.map((t) => ({
          title: t.title,
          articles: (t.summary.articles || []).map((a) => `${a.article}: ${a.title}`).join(', '),
        }));

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'test',
            targetLevel: selectedLevel === 'ALL' ? 'C2' : selectedLevel,
            topicTitle: `Examen Combinado: ${selectedTopics.map((t) => t.title).slice(0, 3).join(', ')}${selectedTopics.length > 3 ? '...' : ''}`,
            selectedTopicTitles: selectedTopics.map((t) => t.title),
            numQuestions: questionCount,
            text: `TEMARIO SELECCIONADO POR EL OPOSITOR:\n${topicSummaries.map((s) => `TEMA: ${s.title}\nARTÍCULOS: ${s.articles}`).join('\n\n')}`,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al generar el test combinado con el preparador.');
        }

        const data = await response.json();
        if (!data.test || !data.test.questions || data.test.questions.length === 0) {
          throw new Error('El preparador no devolvió una batería de preguntas válida.');
        }

        onStartFilteredTest(data.test, `Test Inédito IA (${selectedTopics.length} temas)`);
        onClose();
      } catch (err: any) {
        setAiError(err.message || 'Error al conectar con la IA. Prueba con el modo "Mezcla de Biblioteca".');
      } finally {
        setIsGeneratingAi(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Generador y Filtro de Tests por Temas
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {topics.length} temas en tu temario
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecciona los temas exactos que deseas evaluar y el número de preguntas oficiales
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Step 1: Mode & Question Count Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Filter Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Tipo de Test
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('pool_mixed')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    filterMode === 'pool_mixed'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <Shuffle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block text-white">Mezcla Oficial de Biblioteca</span>
                    <span className="text-[11px] text-slate-400">Preguntas equilibradas de los temas elegidos</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('failed_only')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    filterMode === 'failed_only'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block text-white">
                      Test de Errores y Repaso ({availableFailedInSelection.length} fallos)
                    </span>
                    <span className="text-[11px] text-slate-400">Preguntas que has fallado en estos temas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('ai_new_combo')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    filterMode === 'ai_new_combo'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block text-white">Generar 20 Preguntas Nuevas con IA</span>
                    <span className="text-[11px] text-slate-400">Batería inédita cruzando los PDFs seleccionados</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Questions count & Level filter */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  2. Número de Preguntas Oficiales
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { count: 10, label: '10 P.', sub: '12 min' },
                    { count: 25, label: '25 P.', sub: '30 min' },
                    { count: 50, label: '50 P.', sub: '60 min' },
                    { count: 80, label: '80 P.', sub: '100 min (C2)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setQuestionCount(item.count)}
                      className={`py-2 px-1 rounded-lg font-mono text-center border transition-all ${
                        questionCount === item.count
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">{item.label}</span>
                      <span className="block text-[10px] opacity-80">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  3. Filtrar por Nivel de Oposición
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 'C2', label: 'C2 Agentes' },
                    { id: 'C1', label: 'C1 Técnicos' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedLevel(lvl.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedLevel === lvl.id
                          ? 'bg-slate-800 text-amber-400 border-amber-500/60'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pool info badge */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Banco disponible: </span>
                <span className="text-amber-400 font-mono font-bold">{allAvailableQuestions.length}</span> preguntas en los {selectedTopicIds.length} temas seleccionados.
              </div>
            </div>

          </div>

          {/* Step 2: Topics Checklist Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Selecciona los Temas a Evaluar ({selectedTopicIds.length}/{displayedTopics.length})
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Seleccionar todos
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-400 hover:underline"
                >
                  Deseleccionar todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {displayedTopics.map((topic) => {
                const isChecked = selectedTopicIds.includes(topic.id);
                return (
                  <div
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/60'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-850'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-white text-xs truncate">
                          {topic.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          topic.level === 'C2' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {topic.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {topic.test.questions.length} preguntas • {topic.flashcards.length} tarjetas
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {aiError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {aiError}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {selectedTopicIds.length} temas seleccionados para el examen
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartTest}
              disabled={isGeneratingAi || selectedTopicIds.length === 0}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              {isGeneratingAi ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>El preparador está redactando el test...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Test Filtrado ({Math.min(questionCount, allAvailableQuestions.length || questionCount)} P.)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

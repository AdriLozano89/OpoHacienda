import React, { useState, useEffect } from 'react';
import { TestData, QuestionItem } from '../types/oposicion';
import { ViewDensity } from '../hooks/useDensity';
import { CheckCircle, XCircle, Clock, RotateCcw, BookOpen, CheckSquare, ChevronRight, ChevronLeft, Award, Printer, Sliders } from 'lucide-react';

interface TestTabProps {
  test: TestData;
  topicId?: string;
  topicTitle?: string;
  onRecordScore?: (answered: number, correct: number) => void;
  onRecordFailedQuestions?: (failed: Array<{ question: QuestionItem; selectedAnswer: number }>) => void;
  onTopicReviewed?: () => void;
  onSliceQuestionCount?: (count: number) => void;
  onLogTestResult?: (log: any) => void;
  density?: ViewDensity;
}

export const TestTab: React.FC<TestTabProps> = ({
  test,
  topicId,
  topicTitle,
  onRecordScore,
  onRecordFailedQuestions,
  onTopicReviewed,
  onSliceQuestionCount,
  onLogTestResult,
  density = 'clean',
}) => {
  const isClean = density === 'clean';
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'failed' | 'correct'>('all');
  const [activeQuestionLimit, setActiveQuestionLimit] = useState<number>(
    test.questions.length >= 80 ? 80 : test.questions.length >= 50 ? 50 : test.questions.length >= 25 ? 25 : test.questions.length || 10
  );

  const fullQuestions = test.questions || [];
  
  // Slice questions if active limit is smaller than total questions
  const questions = fullQuestions.slice(0, activeQuestionLimit);
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // Official Timer logic:
  // 10 P -> 12 min (720s)
  // 25 P -> 30 min (1800s)
  // 50 P -> 60 min (3600s)
  // 80 P -> 100 min (6000s) - Real official C2 AEAT 1st exercise standard!
  const getInitialSeconds = (count: number) => {
    if (count <= 10) return 12 * 60;
    if (count <= 25) return 30 * 60;
    if (count <= 50) return 60 * 60;
    return 100 * 60; // 80 questions = 100 mins
  };

  const [timeLeft, setTimeLeft] = useState<number>(getInitialSeconds(questions.length));
  const [timerActive, setTimerActive] = useState<boolean>(true);

  // Update timer whenever question count changes
  const handleSelectCount = (count: number) => {
    if (isSubmitted) return;
    setActiveQuestionLimit(count);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(getInitialSeconds(count));
    if (onSliceQuestionCount) {
      onSliceQuestionCount(count);
    }
  };

  const PENALTY = 0.25;

  useEffect(() => {
    let interval: any = null;
    if (timerActive && !isSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, timeLeft]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => {
      if (prev[questionId] === optionIndex) {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      }
      return {
        ...prev,
        [questionId]: optionIndex,
      };
    });
  };

  const handleClearAnswer = (questionId: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimerActive(false);

    let correct = 0;
    let wrong = 0;
    const failedList: Array<{ question: QuestionItem; selectedAnswer: number }> = [];

    questions.forEach((q) => {
      const ans = selectedAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correctIndex) {
          correct++;
        } else {
          wrong++;
          failedList.push({
            question: q,
            selectedAnswer: ans,
          });
        }
      }
    });

    if (onRecordScore) {
      onRecordScore(correct + wrong, correct);
    }

    if (onRecordFailedQuestions && failedList.length > 0) {
      onRecordFailedQuestions(failedList);
    }

    if (onTopicReviewed) {
      onTopicReviewed();
    }

    if (onLogTestResult) {
      const blank = questions.length - (correct + wrong);
      const netScore = correct * 1.0 - wrong * 0.25;
      const percentage = Math.max(0, (netScore / questions.length) * 100);
      onLogTestResult({
        id: `test-${Date.now()}`,
        date: new Date().toISOString(),
        topicId: topicId || 'general',
        topicTitle: topicTitle || test.title,
        level: test.level,
        totalQuestions: questions.length,
        correct,
        failed: wrong,
        blank,
        netScore,
        maxPossibleScore: questions.length,
        percentageScore: percentage,
        timeSpentSeconds: getInitialSeconds(questions.length) - timeLeft,
      });
    }
  };

  const handleResetTest = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeLeft(getInitialSeconds(questions.length));
    setTimerActive(true);
    setReviewFilter('all');
  };

  const handlePrintTest = () => {
    window.print();
  };

  // Score metrics
  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  questions.forEach((q) => {
    const ans = selectedAnswers[q.id];
    if (ans === undefined) {
      blankCount++;
    } else if (ans === q.correctIndex) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const netScore = Math.max(0, correctCount * 1.0 - wrongCount * PENALTY);
  const scoreOutOf10 = questions.length > 0 ? ((netScore / questions.length) * 10).toFixed(2) : '0.00';
  const isPassed = parseFloat(scoreOutOf10) >= 5.0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      
      {/* Top Test Controller Card: Pure White with AEAT Blue Accents */}
      <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors ${
        isClean ? 'p-5 sm:p-6' : 'p-4'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase font-bold text-[#003366] dark:text-[#D4AF37] font-mono tracking-wider">
                Examen Oficial • Baremo AEAT (+1 / -0.25)
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {questions.length} preguntas seleccionadas
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {test.title}
            </h3>
          </div>

          {/* Question Count Selector (10, 25, 50, 80) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Longitud:
            </span>
            {[10, 25, 50, 80].map((count) => {
              const isSelected = activeQuestionLimit === count;
              const isAvailable = fullQuestions.length >= count;
              return (
                <button
                  key={count}
                  disabled={isSubmitted}
                  onClick={() => handleSelectCount(count)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-xs'
                      : isAvailable
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-850 opacity-60'
                  }`}
                  title={count === 80 ? 'Simulacro completo C2 Agentes (100 min)' : `${count} preguntas`}
                >
                  {count} P. {count === 80 && '★'}
                </button>
              );
            })}
          </div>

        </div>

        {/* Timer Bar & Submission Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {/* Timer Badge */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              timeLeft <= 180 && !isSubmitted
                ? 'bg-red-50 border-red-300 text-[#AA151B] animate-pulse dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#003366] dark:text-[#D4AF37]" />
              <span>{isSubmitted ? 'Examen Entregado' : formatTimer(timeLeft)}</span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Respondidas: <strong>{Object.keys(selectedAnswers).length}</strong> de {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#003366] hover:bg-[#002244] dark:bg-[#D4AF37] dark:hover:bg-[#BF9B30] text-white dark:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Entregar y Corregir
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetTest}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir</span>
                </button>
                <button
                  onClick={handlePrintTest}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Post-submission Score Banner */}
        {isSubmitted && (
          <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isPassed ? 'bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 'bg-red-50/70 border border-red-200 dark:bg-rose-950/20 dark:border-rose-900/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-mono tabular-nums ${
                isPassed ? 'bg-emerald-600 text-white' : 'bg-[#AA151B] text-white'
              }`}>
                {scoreOutOf10}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isPassed ? 'text-emerald-800 dark:text-emerald-400' : 'text-[#AA151B] dark:text-rose-400'
                  }`}>
                    {isPassed ? '¡APTO EN EXAMEN OFICIAL!' : 'NO APTO (Mínimo 5.00)'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Nota Neta: {netScore.toFixed(2)} / {questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {correctCount} aciertos (+{correctCount})
                  </span>
                  <span className="text-[#AA151B] dark:text-rose-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {wrongCount} fallos (-{(wrongCount * PENALTY).toFixed(2)})
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {blankCount} en blanco
                  </span>
                </div>
              </div>
            </div>

            {/* Filter review buttons */}
            <div className="flex items-center gap-1 text-xs bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  reviewFilter === 'all' ? 'bg-[#003366] text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Todas ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter('failed')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  reviewFilter === 'failed' ? 'bg-[#AA151B] text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Falladas ({wrongCount})
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  reviewFilter === 'correct' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Acertadas ({correctCount})
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Test Layout: Question Area + Interactive Bubble Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Question Detail */}
        <div className="lg:col-span-8 space-y-4">
          
          {currentQuestion && (
            <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors ${
              isClean ? 'p-6 sm:p-8' : 'p-4 sm:p-5'
            }`}>
              
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#003366] dark:bg-blue-950/60 dark:text-[#D4AF37] font-mono font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-900">
                    #{currentQuestionIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </span>
                </div>

                {isSubmitted && (
                  <div>
                    {selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Acertada (+1.00)
                      </span>
                    ) : selectedAnswers[currentQuestion.id] !== undefined ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#AA151B] dark:bg-rose-950/40 dark:text-rose-400 font-bold text-xs flex items-center gap-1 border border-red-200 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Fallada (-0.25)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium text-xs">
                        No respondida (0.00)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h4 className={`font-semibold text-slate-900 dark:text-white leading-relaxed mb-6 font-sans ${
                isClean ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}>
                {currentQuestion.question}
              </h4>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  const isCorrect = optIdx === currentQuestion.correctIndex;

                  let optionStyles = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 dark:bg-[#001730] dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#002244]';

                  if (!isSubmitted) {
                    if (isSelected) {
                      optionStyles = 'bg-blue-50/70 border-[#003366] text-[#003366] ring-1 ring-[#003366] font-semibold dark:bg-blue-950/50 dark:border-[#D4AF37] dark:text-[#D4AF37]';
                    }
                  } else {
                    if (isCorrect) {
                      optionStyles = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-semibold dark:bg-emerald-950/40 dark:text-emerald-100';
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'bg-red-50 border-red-500 text-[#AA151B] line-through opacity-80 dark:bg-rose-950/40 dark:text-rose-300';
                    } else {
                      optionStyles = 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60 dark:bg-[#001224] dark:border-slate-900';
                    }
                  }

                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full text-left rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 shadow-2xs ${
                        isClean ? 'p-4 sm:p-4.5' : 'p-3.5'
                      } ${optionStyles}`}
                    >
                      <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected && !isSubmitted
                          ? 'bg-[#003366] text-white border-[#003366] dark:bg-[#D4AF37] dark:text-slate-950 dark:border-[#D4AF37]'
                          : isSubmitted && isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isSubmitted && isSelected && !isCorrect
                          ? 'bg-[#AA151B] text-white border-[#AA151B]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-1 leading-relaxed font-sans">
                        {opt.replace(/^[A-D]\)\s*/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanations & Legal Motivation (Shown after submission) */}
              {isSubmitted && (
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#003366] dark:text-sky-400" />
                    <span className="text-xs uppercase font-bold text-[#003366] dark:text-sky-300 tracking-wider">
                      Fundamentación Jurídica Oficial
                    </span>
                    <span className="text-xs font-mono font-bold text-[#003366] dark:text-[#D4AF37] ml-auto bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900">
                      {currentQuestion.legalArticle}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-[#001730] rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      Respuesta Correcta: {currentQuestion.answerLetter}
                    </p>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                {!isSubmitted && selectedAnswers[currentQuestion.id] !== undefined && (
                  <button
                    onClick={() => handleClearAnswer(currentQuestion.id)}
                    className="text-xs text-slate-400 hover:text-[#AA151B] font-medium underline transition-colors"
                  >
                    Dejar en blanco
                  </button>
                )}

                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] dark:bg-[#D4AF37] dark:hover:bg-[#BF9B30] disabled:opacity-30 text-white dark:text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Official Answer Sheet / Plantilla de Burbujas */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Hoja de Respuestas Oficial
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {Object.keys(selectedAnswers).length}/{questions.length}
              </span>
            </div>

            {/* Bubble Sheet Grid */}
            <div className="grid grid-cols-1 gap-1.5 max-h-[460px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCurrent = currentQuestionIndex === idx;
                const isCorrect = isSubmitted && userAns === q.correctIndex;
                const isWrong = isSubmitted && userAns !== undefined && userAns !== q.correctIndex;

                return (
                  <div
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-blue-50/80 border-[#003366] dark:bg-blue-950/40 dark:border-[#D4AF37]'
                        : 'bg-slate-50/60 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className="font-mono font-bold text-[11px] text-slate-500 w-6 text-center">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Bubbles A, B, C, D */}
                    <div className="flex items-center gap-1.5">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const isChosen = userAns === optIdx;
                        const isRightAnswer = isSubmitted && optIdx === q.correctIndex;

                        let bubbleStyle = 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

                        if (!isSubmitted) {
                          if (isChosen) {
                            bubbleStyle = 'bg-[#003366] text-white font-bold border-[#003366] dark:bg-[#D4AF37] dark:text-slate-950';
                          }
                        } else {
                          if (isRightAnswer) {
                            bubbleStyle = 'bg-emerald-600 text-white font-bold border-emerald-600';
                          } else if (isChosen && !isRightAnswer) {
                            bubbleStyle = 'bg-[#AA151B] text-white font-bold border-[#AA151B] line-through';
                          }
                        }

                        return (
                          <span
                            key={letter}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono border transition-all ${bubbleStyle}`}
                          >
                            {letter}
                          </span>
                        );
                      })}
                    </div>

                    {/* Status Badge in list */}
                    <div className="w-12 text-right font-mono text-[11px]">
                      {isSubmitted ? (
                        isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1.00</span>
                        ) : isWrong ? (
                          <span className="text-[#AA151B] dark:text-rose-400 font-bold">-0.25</span>
                        ) : (
                          <span className="text-slate-400">0.00</span>
                        )
                      ) : (
                        userAns !== undefined ? (
                          <span className="text-[#003366] dark:text-[#D4AF37] font-bold">{String.fromCharCode(65 + userAns)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

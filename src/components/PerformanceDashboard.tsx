import React from 'react';
import { TestResultLog, TopicReviewRecord, CompleteTopicPackage, OposicionLevel, FailedQuestionRecord } from '../types/oposicion';
import { ViewDensity } from '../hooks/useDensity';
import { computeMilestones } from '../data/milestones';
import { TrendingUp, Award, Target, AlertTriangle, CheckCircle2, BarChart3, Clock, ArrowRight, ShieldCheck, Flame, Medal, Check } from 'lucide-react';

interface PerformanceDashboardProps {
  testHistory: TestResultLog[];
  topics: CompleteTopicPackage[];
  reviewRecords: Record<string, TopicReviewRecord>;
  onStartWeaknessTest: () => void;
  onOpenErrorNotebook: () => void;
  currentLevel: OposicionLevel;
  failedQuestions?: FailedQuestionRecord[];
  totalStudiedMinutes?: number;
  density?: ViewDensity;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  testHistory,
  topics,
  reviewRecords,
  onStartWeaknessTest,
  onOpenErrorNotebook,
  currentLevel,
  failedQuestions = [],
  totalStudiedMinutes = 0,
  density = 'clean',
}) => {
  const isClean = density === 'clean';

  // Aggregate Metrics
  const totalSimulations = testHistory.length;
  const totalAnswered = testHistory.reduce((acc, t) => acc + (t.correct + t.failed), 0);
  const totalCorrect = testHistory.reduce((acc, t) => acc + t.correct, 0);
  const totalFailed = testHistory.reduce((acc, t) => acc + t.failed, 0);
  const totalBlank = testHistory.reduce((acc, t) => acc + t.blank, 0);

  // Official Baremo AEAT: +1.00 por acierto, -0.25 por fallo
  const netScoreTotal = totalCorrect * 1.0 - totalFailed * 0.25;
  const averageNetPercentage = totalAnswered > 0 ? Math.max(0, Math.round((netScoreTotal / totalAnswered) * 100)) : 0;

  // Extrapolate to official 80-question C2 exam (Target >= 55 net points for plaza)
  const estimatedC2Score = totalAnswered > 0 ? ((netScoreTotal / totalAnswered) * 80).toFixed(1) : '0.0';

  // Topic Weakness Analysis
  const topicStats = topics.map((topic) => {
    const topicTests = testHistory.filter((t) => t.topicId === topic.id);
    const correctCount = topicTests.reduce((acc, t) => acc + t.correct, 0);
    const failedCount = topicTests.reduce((acc, t) => acc + t.failed, 0);
    const answeredCount = correctCount + failedCount;
    const netRate = answeredCount > 0 ? Math.round(((correctCount - failedCount * 0.25) / answeredCount) * 100) : null;
    
    const record = reviewRecords[topic.id];
    const isUrgent = record?.status === 'urgent';

    return {
      topic,
      answeredCount,
      netRate,
      isUrgent,
      lastReviewed: record?.lastReviewedAt,
    };
  });

  // Weak topics (rate < 60% or urgent)
  const weakTopics = topicStats.filter((ts) => ts.isUrgent || (ts.netRate !== null && ts.netRate < 60));

  // Compute milestones
  const milestones = computeMilestones({
    testHistory,
    totalAnswered,
    reviewRecords,
    failedQuestions,
    totalStudiedMinutes,
  });

  const unlockedMilestonesCount = milestones.filter((m) => m.isUnlocked).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner: Pure White with AEAT Blue Accents */}
      <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors ${
        isClean ? 'p-6 sm:p-7' : 'p-4 sm:p-5'
      }`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-[#003366] dark:text-[#D4AF37] font-mono tracking-wider">
            Baremo Oficial AEAT • +1.00 Acierto / -0.25 Fallo
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {totalSimulations} simulacros registrados · {totalStudiedMinutes} min estudio
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Dashboard de Rendimiento Oficial, Estudio y Medallas de Hito
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed font-sans">
          Monitoriza tu puntuación neta real calculada según la fórmula del Tribunal Calificador, desbloquea insignias de dominio y detecta qué temas debes repasar antes de noviembre.
        </p>
      </div>

      {/* Top 4 KPI Cards: Crisp White Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Estimated C2 80-Q Score */}
        <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Nota Neta C2 (sobre 80)</span>
            <Target className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#003366] dark:text-[#D4AF37] font-mono tabular-nums">
              {estimatedC2Score}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 80.0</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            Corte histórico orientativo: ~52.0 a 58.0 puntos.
          </p>
        </div>

        {/* KPI 2: Net Accuracy % */}
        <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Rendimiento Neto Medio</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
              {averageNetPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            Penalización por errores (-0.25) descontada.
          </p>
        </div>

        {/* KPI 3: Answered Questions */}
        <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Preguntas Respondidas</span>
            <BarChart3 className="w-4 h-4 text-[#003366] dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalAnswered}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({totalCorrect} <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" /> / {totalFailed} <AlertTriangle className="w-3 h-3 text-[#AA151B] inline" />)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            En {totalSimulations} sesiones de test oficiales.
          </p>
        </div>

        {/* KPI 4: Pomodoro Study Time & Medals */}
        <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Estudio Pomodoro</span>
            <Clock className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalStudiedMinutes}
            </span>
            <span className="text-xs text-slate-400 font-mono">minutos</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            {unlockedMilestonesCount} de {milestones.length} medallas desbloqueadas.
          </p>
        </div>

      </div>

      {/* SECTION: Medallas de Hito (Milestones) */}
      <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors ${
        isClean ? 'p-6 sm:p-7' : 'p-4 sm:p-5'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D4AF37] border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 flex items-center justify-center font-bold">
              <Medal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Medallas de Hito y Constancia de Estudio
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Insignias que acreditan tu progreso hacia la plaza en la AEAT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#003366] dark:text-[#D4AF37] bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900">
              {unlockedMilestonesCount}/{milestones.length} Desbloqueadas
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {milestones.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                badge.isUnlocked
                  ? 'bg-white dark:bg-[#001730] border-[#003366]/40 dark:border-[#D4AF37]/50 shadow-2xs ring-1 ring-[#003366]/10'
                  : 'bg-slate-50/60 dark:bg-[#001224] border-slate-200/70 dark:border-slate-850 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl select-none" role="img" aria-label={badge.title}>
                    {badge.icon}
                  </span>
                  {badge.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" /> Desbloqueada
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {badge.currentProgress}/{badge.maxProgress}
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {badge.title}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-sans">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      badge.isUnlocked ? 'bg-[#003366] dark:bg-[#D4AF37]' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Weakness Radar & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar de Temas Débiles */}
        <div className={`lg:col-span-7 bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 ${
          isClean ? 'p-6 sm:p-7' : 'p-4 sm:p-5'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Estado de Dominio por Temas del Programa
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">{topics.length} temas</span>
          </div>

          <div className="space-y-2.5">
            {topicStats.map(({ topic, answeredCount, netRate, isUrgent }) => (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#001730] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#003366] dark:text-[#D4AF37]">
                      {topic.block || 'Tributario'}
                    </span>
                    {isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#AA151B] border border-red-200 dark:bg-rose-950 dark:text-rose-300">
                        Repaso Urgente
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {topic.title}
                  </h5>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Rendimiento</span>
                    <span className={`font-mono font-bold text-sm ${
                      netRate === null
                        ? 'text-slate-400'
                        : netRate >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : netRate >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-[#AA151B] dark:text-rose-400'
                    }`}>
                      {netRate !== null ? `${netRate}% neto` : 'Sin test aún'}
                    </span>
                  </div>

                  <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className={`h-full rounded-full ${
                        netRate === null
                          ? 'w-0'
                          : netRate >= 75
                          ? 'bg-emerald-500'
                          : netRate >= 50
                          ? 'bg-amber-500'
                          : 'bg-[#AA151B]'
                      }`}
                      style={{ width: `${Math.max(0, netRate || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch & Error Notebook Card */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Rescue Test Card: Pure White with AEAT Blue & Gold accents */}
          <div className="bg-white dark:bg-[#001D38] border-2 border-[#003366] dark:border-[#D4AF37] rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#003366] dark:text-[#D4AF37] font-bold block">
              Estrategia Recomendada de Estudio
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Test Focalizado en Preguntas Dudosas y Falladas
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              El algoritmo extrae automáticamente las preguntas donde has errado o que requieren repaso inmediato según la Curva del Olvido.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onStartWeaknessTest}
                className="w-full py-2.5 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Generar Test de Refuerzo Personalizado</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenErrorNotebook}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Abrir Cuaderno de Fallos Oficial</span>
              </button>
            </div>
          </div>

          {/* Baremo Advice */}
          <div className="bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs space-y-2">
            <span className="font-bold text-[#AA151B] dark:text-rose-400 uppercase tracking-wider block font-mono">
              Regla Matemática del Tribunal AEAT:
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Cada fallo resta <strong>0,25 puntos</strong> (1/4 de acierto). Si dudas entre <strong>2 opciones</strong> tras descartar las otras dos, el valor matemático esperado es positivo (<strong>+0,375 puntos</strong>). En el C2 conviene arriesgar cuando dudas entre dos, pero dejar en blanco si dudas entre tres o cuatro.
            </p>
          </div>

        </div>

      </div>

      {/* Historical Test Logs Table */}
      <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 ${
        isClean ? 'p-6 sm:p-7' : 'p-4 sm:p-5'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Clock className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
            <span>Histórico de Simulacros y Tests Realizados</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Registro oficial guardado</span>
        </div>

        {testHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-sans">
            Aún no has completado ningún simulacro. Los resultados de tus tests de 10, 25, 50 y 80 preguntas se registrarán aquí automáticamente con tu nota neta oficial.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <table className="w-full text-left font-sans">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tema / Simulacro</th>
                  <th className="p-3 text-center">Preguntas</th>
                  <th className="p-3 text-center">Aciertos / Fallos / Blanco</th>
                  <th className="p-3 text-right">Nota Neta Oficial</th>
                  <th className="p-3 text-right">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {testHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                      {log.topicTitle}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {log.totalQuestions} P.
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{log.correct}</span> / 
                      <span className="text-[#AA151B] dark:text-rose-400 font-bold"> {log.failed}</span> / 
                      <span className="text-slate-400 font-bold"> {log.blank}</span>
                    </td>
                    <td className="p-3 text-right font-extrabold text-[#003366] dark:text-[#D4AF37] tabular-nums text-sm">
                      {log.netScore.toFixed(2)} pts
                    </td>
                    <td className="p-3 text-right font-bold tabular-nums">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        log.percentageScore >= 70
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.percentageScore >= 50
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-50 text-[#AA151B] dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {Math.round(log.percentageScore)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

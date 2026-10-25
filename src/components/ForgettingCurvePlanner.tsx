import React, { useState } from 'react';
import { CompleteTopicPackage, TopicReviewRecord } from '../types/oposicion';
import { BrainCircuit, Clock, AlertTriangle, CheckCircle2, RotateCw, Calendar, Sparkles, ArrowRight, Play, BookOpen, Layers } from 'lucide-react';

interface ForgettingCurvePlannerProps {
  topics: CompleteTopicPackage[];
  reviewRecords: Record<string, TopicReviewRecord>;
  onStartQuickReviewTest: (topic: CompleteTopicPackage, count: number) => void;
  onOpenFlashcardsForTopic: (topic: CompleteTopicPackage) => void;
  onManualLogReview: (topicId: string) => void;
}

export const ForgettingCurvePlanner: React.FC<ForgettingCurvePlannerProps> = ({
  topics,
  reviewRecords,
  onStartQuickReviewTest,
  onOpenFlashcardsForTopic,
  onManualLogReview,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'urgent' | 'due_soon' | 'fresh'>('all');

  const STAGES = [
    { stage: 1, name: '1º Repaso', intervalDays: 1, label: 'A las 24 horas' },
    { stage: 2, name: '2º Repaso', intervalDays: 3, label: 'A los 3 días' },
    { stage: 3, name: '3º Repaso', intervalDays: 7, label: 'A los 7 días' },
    { stage: 4, name: '4º Repaso', intervalDays: 14, label: 'A los 14 días' },
    { stage: 5, name: '5º Repaso', intervalDays: 30, label: 'A los 30 días (Consolidado)' },
  ];

  const enrichedTopics = topics.map((topic) => {
    const record = reviewRecords[topic.id];
    let reviewStage = 0;
    let daysSince = 0;
    let retention = 100;
    let status: 'urgent' | 'due_soon' | 'fresh' | 'consolidated' = 'fresh';
    let lastReviewedText = 'Nunca repasado';

    if (record) {
      reviewStage = record.reviewStage || 1;
      const lastDate = new Date(record.lastReviewedAt);
      const now = new Date();
      const diffMs = now.getTime() - lastDate.getTime();
      daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      lastReviewedText = daysSince === 0 ? 'Hoy' : `Hace ${daysSince} días`;

      const halfLifeDays = reviewStage === 1 ? 1 : reviewStage === 2 ? 3 : reviewStage === 3 ? 7 : reviewStage === 4 ? 14 : 35;
      const decayRatio = daysSince / halfLifeDays;
      retention = Math.max(20, Math.min(100, Math.round(100 * Math.exp(-0.693 * decayRatio))));

      if (retention < 60 || daysSince > halfLifeDays * 1.3) {
        status = 'urgent';
      } else if (retention < 80) {
        status = 'due_soon';
      } else if (reviewStage >= 4) {
        status = 'consolidated';
      } else {
        status = 'fresh';
      }
    } else {
      status = 'urgent';
      retention = 40;
    }

    return {
      topic,
      record,
      reviewStage,
      daysSince,
      retention,
      status,
      lastReviewedText,
    };
  });

  const urgentCount = enrichedTopics.filter((t) => t.status === 'urgent').length;
  const dueSoonCount = enrichedTopics.filter((t) => t.status === 'due_soon').length;
  const freshCount = enrichedTopics.filter((t) => t.status === 'fresh' || t.status === 'consolidated').length;

  const displayedTopics = enrichedTopics.filter((item) => {
    if (filterState === 'all') return true;
    if (filterState === 'fresh') return item.status === 'fresh' || item.status === 'consolidated';
    return item.status === filterState;
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Banner: Spaced Repetition Logic with AEAT Blue Gradient */}
      <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#0A3871] border border-amber-400/30 rounded-2xl p-5 sm:p-6 shadow-md text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                  Método Ebbinghaus • Ley de Retención
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Protección Activa de Memoria
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold">
                Planificador Anticurva del Olvido (Spaced Repetition)
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
                Sin repaso programado, el cerebro olvida el 50% de los plazos a las 24 horas y el 80% en 7 días. El preparador calcula el momento exacto en que debes repasar cada tema para transferirlo a memoria permanente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#001D3D]/80 p-2.5 rounded-xl border border-white/10 text-xs shrink-0">
            <div className="text-center px-2.5">
              <span className="block font-mono font-bold text-rose-400 text-base">{urgentCount}</span>
              <span className="text-[10px] text-slate-300 uppercase">Urgentes Hoy</span>
            </div>
            <div className="w-px h-7 bg-white/15" />
            <div className="text-center px-2.5">
              <span className="block font-mono font-bold text-amber-300 text-base">{dueSoonCount}</span>
              <span className="text-[10px] text-slate-300 uppercase">Próximos 48h</span>
            </div>
            <div className="w-px h-7 bg-white/15" />
            <div className="text-center px-2.5">
              <span className="block font-mono font-bold text-emerald-400 text-base">{freshCount}</span>
              <span className="text-[10px] text-slate-300 uppercase">Consolidados</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {STAGES.map((s) => (
            <div key={s.stage} className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-[11px]">{s.name}</span>
                <span className="font-mono text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded font-bold">
                  {s.intervalDays}d
                </span>
              </div>
              <span className="text-[10px] text-blue-100">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#002244] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-xs transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterState === 'all'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Todos ({enrichedTopics.length})
          </button>
          <button
            onClick={() => setFilterState('urgent')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              filterState === 'urgent'
                ? 'bg-[#AA151B] text-white'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Repaso Urgente ({urgentCount})</span>
          </button>
          <button
            onClick={() => setFilterState('due_soon')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              filterState === 'due_soon'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En 48 Horas ({dueSoonCount})</span>
          </button>
          <button
            onClick={() => setFilterState('fresh')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              filterState === 'fresh'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Memoria Fresca ({freshCount})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Algoritmo Ebbinghaus v2.4
        </span>
      </div>

      {/* Topics Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedTopics.map((item) => {
          const { topic, reviewStage, daysSince, retention, status, lastReviewedText } = item;
          const isUrgent = status === 'urgent';
          const isDueSoon = status === 'due_soon';

          return (
            <div
              key={topic.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                isUrgent
                  ? 'bg-rose-50/50 border-rose-300 dark:bg-rose-950/20 dark:border-rose-500/50'
                  : isDueSoon
                  ? 'bg-amber-50/40 border-amber-300 dark:bg-amber-950/20 dark:border-amber-500/50'
                  : 'bg-white border-slate-200 dark:bg-[#002244] dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      topic.level === 'C2' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                    }`}>
                      Nivel {topic.level}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {topic.test.questions.length} preguntas
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isUrgent
                      ? 'bg-rose-100 text-[#AA151B] border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 animate-pulse'
                      : isDueSoon
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                  }`}>
                    {isUrgent && <AlertTriangle className="w-3 h-3" />}
                    {isDueSoon && <Clock className="w-3 h-3" />}
                    {isUrgent ? '¡REPASAR HOY!' : isDueSoon ? 'Repasar en 48h' : 'Memoria Afianzada'}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                  {topic.subtitle}
                </p>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Retención estimada:</span>
                    <span className={`font-mono font-bold ${
                      retention >= 75 ? 'text-emerald-600 dark:text-emerald-400' : retention >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {retention}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        retention >= 75 ? 'bg-emerald-500' : retention >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${retention}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                    <span>Último repaso: {lastReviewedText}</span>
                    <span>Etapa: {reviewStage}/5</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onStartQuickReviewTest(topic, 10)}
                    className="px-2.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test 10 P.</span>
                  </button>
                  <button
                    onClick={() => onStartQuickReviewTest(topic, 25)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px] border border-slate-200 dark:border-slate-700"
                  >
                    <span>Test 25 P.</span>
                  </button>
                  <button
                    onClick={() => onOpenFlashcardsForTopic(topic)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px] border border-slate-200 dark:border-slate-700"
                  >
                    <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Fichas</span>
                  </button>
                </div>

                <button
                  onClick={() => onManualLogReview(topic.id)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-[11px] underline transition-colors"
                >
                  Registrar Repaso
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

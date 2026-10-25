import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, ChevronDown, Check } from 'lucide-react';

interface PomodoroTimerProps {
  sessionSeconds: number;
  isRunning: boolean;
  sessionType: 'focus' | 'break';
  onToggle: () => void;
  onReset: (mins?: number) => void;
  onSetDuration: (mins: number) => void;
  activeTopicTitle?: string;
  totalStudiedMinutes: number;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  sessionSeconds,
  isRunning,
  sessionType,
  onToggle,
  onReset,
  onSetDuration,
  activeTopicTitle,
  totalStudiedMinutes,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const minutes = Math.floor(sessionSeconds / 60);
  const seconds = sessionSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isFocus = sessionType === 'focus';

  return (
    <div className="relative">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all ${
        isRunning
          ? isFocus
            ? 'bg-blue-50/90 border-[#003366]/40 text-[#003366] dark:bg-blue-950/60 dark:border-blue-700 dark:text-sky-300 shadow-2xs'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300'
          : 'bg-white dark:bg-[#001D38] border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      }`}>
        
        {/* Session Type Icon */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1 text-[11px] font-sans font-bold hover:opacity-80 transition-opacity"
          title="Configurar duración Pomodoro"
        >
          {isFocus ? (
            <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-[#003366] dark:text-[#D4AF37]' : 'text-slate-400'}`} />
          ) : (
            <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="hidden sm:inline">{isFocus ? 'Foco' : 'Descanso'}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Formatted Countdown */}
        <span className="font-extrabold tabular-nums tracking-tight text-xs sm:text-sm">
          {formattedTime}
        </span>

        {/* Play/Pause Button */}
        <button
          onClick={onToggle}
          className={`p-1 rounded-lg transition-colors ${
            isRunning
              ? 'bg-[#003366] text-white hover:bg-[#002244] dark:bg-[#D4AF37] dark:text-slate-950'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
          }`}
          title={isRunning ? 'Pausar sesión' : 'Iniciar estudio con registro'}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => onReset()}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Reiniciar temporizador"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

      </div>

      {/* Dropdown Menu for Duration & Stats */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-sans">
            <span className="font-bold text-slate-900 dark:text-white">Temporizador Pomodoro AEAT</span>
            <span className="text-[10px] text-slate-400 font-mono">{totalStudiedMinutes} min hoy</span>
          </div>

          <div className="space-y-1 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duración de Sesión</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => { onSetDuration(25); setShowMenu(false); }}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700"
              >
                25 min
              </button>
              <button
                onClick={() => { onSetDuration(50); setShowMenu(false); }}
                className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003366] dark:bg-blue-950/60 dark:text-sky-300 font-bold text-[11px] border border-blue-200 dark:border-blue-900"
              >
                50 min (C2)
              </button>
              <button
                onClick={() => { onSetDuration(5); setShowMenu(false); }}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700"
              >
                5 min relax
              </button>
            </div>
          </div>

          {activeTopicTitle && (
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 font-sans text-[11px] text-slate-500 dark:text-slate-400">
              <span>Registrando tiempo para: </span>
              <strong className="text-slate-800 dark:text-slate-200 block truncate">{activeTopicTitle}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

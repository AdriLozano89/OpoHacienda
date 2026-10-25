import React from 'react';
import { MessageSquareText, Scale, Sparkles, LayoutGrid } from 'lucide-react';
import { ActiveView } from '../types/oposicion';
import { OposicionLevel } from '../types/oposicion';
import { ViewDensity } from '../hooks/useDensity';
import { PWAInstallButton } from './PWAInstallButton';
import { PomodoroTimer } from './PomodoroTimer';

interface TopBarProps {
  currentView: ActiveView;
  currentLevel: OposicionLevel;
  activeTopicTitle?: string;
  onOpenChat: () => void;
  density: ViewDensity;
  onToggleDensity: () => void;
  pomodoro: {
    sessionSeconds: number;
    isRunning: boolean;
    sessionType: 'focus' | 'break';
    toggleTimer: () => void;
    resetTimer: (mins?: number) => void;
    setFocusDuration: (mins: number) => void;
    totalStudiedMinutes: number;
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  currentLevel,
  activeTopicTitle,
  onOpenChat,
  density,
  onToggleDensity,
  pomodoro,
}) => {
  const isClean = density === 'clean';

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    library: {
      title: 'Biblioteca de Temario y PDFs',
      subtitle: 'Sube varios PDFs a la vez o selecciona temas oficiales',
    },
    test: {
      title: 'Simulador de Tests Oficiales',
      subtitle: 'Baterías de 10, 25, 50 y 80 preguntas (Baremo Oficial AEAT)',
    },
    cases: {
      title: 'Supuestos Prácticos Oficiales (2º Ejercicio)',
      subtitle: 'Resolución analítica de liquidaciones, embargos y plazos',
    },
    calc: {
      title: 'Calculadora Oficial LGT & LPAC',
      subtitle: 'Cómputo en días hábiles, plazos del Art. 62 y recargos del Art. 27',
    },
    dashboard: {
      title: 'Mi Rendimiento Oficial & Radar',
      subtitle: 'Puntuación neta ponderada (+1.00 / -0.25) y temas en zona de riesgo',
    },
    curve: {
      title: 'Planificador Anticurva del Olvido',
      subtitle: 'Algoritmo de repetición espaciada Hermann Ebbinghaus',
    },
    errors: {
      title: 'Cuaderno Oficial de Fallos',
      subtitle: 'Banco de errores activo y tests de rescate',
    },
    summary: {
      title: 'Fichas, Plazos y Sanciones',
      subtitle: 'Artículos literales y tablas de cálculo procesal',
    },
    traps: {
      title: 'Radar de Trampas de Examen',
      subtitle: 'Despiece de preguntas trampa de la AEAT e INAP',
    },
  };

  const currentInfo = viewTitles[currentView] || { title: 'OpoHacienda', subtitle: 'Preparador Pro' };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Left: View title & Mobile Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-[#003366] truncate">
              {currentInfo.title}
            </h2>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Pomodoro Study Timer */}
          <PomodoroTimer
            sessionSeconds={pomodoro.sessionSeconds}
            isRunning={pomodoro.isRunning}
            sessionType={pomodoro.sessionType}
            onToggle={pomodoro.toggleTimer}
            onReset={pomodoro.resetTimer}
            onSetDuration={pomodoro.setFocusDuration}
            activeTopicTitle={activeTopicTitle}
            totalStudiedMinutes={pomodoro.totalStudiedMinutes}
          />

          {/* Density Switch: Modo Limpio vs Modo Compacto */}
          <button
            onClick={onToggleDensity}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isClean
                ? 'bg-blue-50/80 border-[#003366]/30 text-[#003366]'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title={isClean ? 'Modo Limpio activado (mayor espaciado y sin ruido). Pulsa para modo compacto.' : 'Modo Compacto activado. Pulsa para modo limpio.'}
          >
            {isClean ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#003366]" />
                <span className="hidden md:inline">Modo Limpio</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Modo Compacto</span>
              </>
            )}
          </button>

          {/* Compact PWA Install Button */}
          <PWAInstallButton compact={true} />

          {/* Chat with Preparer */}
          <button
            onClick={onOpenChat}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Consultar duda jurídica al preparador"
          >
            <MessageSquareText className="w-4 h-4 text-[#003366]" />
            <span className="hidden sm:inline">Duda</span>
          </button>

        </div>

      </div>
    </header>
  );
};

import React from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  BrainCircuit, 
  AlertOctagon, 
  FileText, 
  ShieldAlert, 
  Award, 
  MessageSquareText, 
  Scale, 
  ChevronRight,
  FileSpreadsheet,
  Calculator,
  BarChart3,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { OposicionLevel, ActiveView } from '../types/oposicion';
import { ViewDensity } from '../hooks/useDensity';
import { PWAInstallButton } from './PWAInstallButton';

export type { ActiveView };

interface SidebarProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  currentLevel: OposicionLevel;
  onLevelChange: (level: OposicionLevel) => void;
  urgentReviewsCount: number;
  failedCount: number;
  onOpenChat: () => void;
  density: ViewDensity;
  onToggleDensity: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentLevel,
  onLevelChange,
  urgentReviewsCount,
  failedCount,
  onOpenChat,
  density,
  onToggleDensity,
}) => {
  // Target date for C2: approx Nov 15, 2026
  const targetDateC2 = new Date('2026-11-15T09:00:00');
  const now = new Date();
  const diffDaysC2 = Math.max(0, Math.ceil((targetDateC2.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const isClean = density === 'clean';

  const menuItems = [
    {
      id: 'library' as ActiveView,
      label: 'Biblioteca y PDFs',
      icon: BookOpen,
      sub: 'Temas y leyes oficiales',
    },
    {
      id: 'test' as ActiveView,
      label: 'Simulador de Tests',
      icon: CheckSquare,
      sub: '10, 25, 50 y 80 preguntas',
    },
    {
      id: 'cases' as ActiveView,
      label: 'Supuestos Prácticos',
      icon: FileSpreadsheet,
      badge: '2º Examen',
      badgeType: 'special',
      sub: 'Liquidaciones y apremio',
    },
    {
      id: 'calc' as ActiveView,
      label: 'Calculadora LGT',
      icon: Calculator,
      sub: 'Plazos y recargos',
    },
    {
      id: 'dashboard' as ActiveView,
      label: 'Mi Rendimiento',
      icon: BarChart3,
      badge: 'Baremo AEAT',
      badgeType: 'normal',
      sub: 'Baremo oficial y radar',
    },
    {
      id: 'curve' as ActiveView,
      label: 'Curva del Olvido',
      icon: BrainCircuit,
      badge: urgentReviewsCount > 0 ? `${urgentReviewsCount} urgentes` : undefined,
      badgeType: 'urgent',
      sub: 'Método Ebbinghaus',
    },
    {
      id: 'errors' as ActiveView,
      label: 'Cuaderno de Fallos',
      icon: AlertOctagon,
      badge: failedCount > 0 ? `${failedCount}` : undefined,
      badgeType: 'error',
      sub: 'Test de rescate',
    },
    {
      id: 'summary' as ActiveView,
      label: 'Fichas y Resúmenes',
      icon: FileText,
      sub: 'Plazos, artículos y leyes',
    },
    {
      id: 'traps' as ActiveView,
      label: 'Radar de Trampas',
      icon: ShieldAlert,
      sub: 'Pillerías del tribunal',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 h-screen z-30 bg-white border-r border-slate-200 text-slate-800 select-none shadow-xs transition-colors duration-150">
      
      {/* Brand Header: Crisp White with AEAT Blue & Gold accents */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center shadow-xs shrink-0 border border-[#D4AF37]/50">
            <Scale className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight text-[#003366] truncate">
                OpoHacienda
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#003366] border border-blue-200 font-mono">
                AEAT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Agentes C2 & Técnicos C1
            </p>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="mt-3.5 p-1 bg-slate-100 rounded-xl flex items-center text-xs">
          <button
            onClick={() => onLevelChange('C2')}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
              currentLevel === 'C2'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>C2 ({diffDaysC2}d)</span>
          </button>
          <button
            onClick={() => onLevelChange('C1')}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
              currentLevel === 'C1'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>C1 (2028)</span>
          </button>
        </div>
      </div>

      {/* Navigation items list */}
      <nav className={`flex-1 overflow-y-auto px-3 ${isClean ? 'py-4 space-y-1.5' : 'py-3 space-y-1'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          let activeClass = isActive
            ? 'bg-blue-50/90 text-[#003366] font-bold border-l-4 border-[#003366] shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent';

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between text-left transition-all rounded-r-xl ${
                isClean ? 'px-3 py-2.5' : 'px-3 py-2'
              } ${activeClass}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isActive ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-xs">{item.label}</span>
                  {!isClean && (
                    <span className="block text-[10px] text-slate-400 font-normal truncate">
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  item.badgeType === 'urgent'
                    ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Utility Actions: Density Switch, Chat & PWA Install */}
      <div className="p-3 border-t border-slate-100 bg-white space-y-2">
        
        {/* Density Mode Switch */}
        <button
          onClick={onToggleDensity}
          className="w-full py-2 px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-2xs transition-colors"
          title="Alternar entre Modo Limpio y Modo Compacto"
        >
          <div className="flex items-center gap-2">
            {isClean ? <Sparkles className="w-3.5 h-3.5 text-[#003366]" /> : <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isClean ? 'Modo Limpio Activo' : 'Modo Compacto'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal">Cambiar</span>
        </button>

        {/* Ask Preparer Button */}
        <button
          onClick={onOpenChat}
          className="w-full py-2 px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-2xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-3.5 h-3.5 text-[#003366]" />
            <span>Duda al Preparador</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

      </div>

    </aside>
  );
};

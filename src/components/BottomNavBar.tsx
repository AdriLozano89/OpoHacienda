import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  BrainCircuit, 
  AlertOctagon, 
  MoreHorizontal, 
  FileText, 
  ShieldAlert, 
  MessageSquareText, 
  Award, 
  X, 
  FileSpreadsheet, 
  Calculator, 
  BarChart3,
  Sparkles, 
  LayoutGrid
} from 'lucide-react';
import { ActiveView } from '../types/oposicion';
import { OposicionLevel } from '../types/oposicion';
import { PWAInstallButton } from './PWAInstallButton';
import { ViewDensity } from '../hooks/useDensity';

interface BottomNavBarProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  urgentReviewsCount: number;
  failedCount: number;
  onOpenChat: () => void;
  currentLevel: OposicionLevel;
  onLevelChange: (level: OposicionLevel) => void;
  density: ViewDensity;
  onToggleDensity: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onViewChange,
  urgentReviewsCount,
  failedCount,
  onOpenChat,
  currentLevel,
  onLevelChange,
  density,
  onToggleDensity,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const mainTabs = [
    { id: 'library' as ActiveView, label: 'Temario', icon: BookOpen },
    { id: 'test' as ActiveView, label: 'Tests', icon: CheckSquare },
    { 
      id: 'cases' as ActiveView, 
      label: 'Supuestos', 
      icon: FileSpreadsheet,
      badge: '2º'
    },
    { 
      id: 'dashboard' as ActiveView, 
      label: 'Notas', 
      icon: BarChart3,
      badge: 'AEAT'
    },
  ];

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onViewChange(tab.id);
                setShowMoreDrawer(false);
              }}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center relative rounded-xl transition-all ${
                isActive
                  ? 'text-[#003366] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#003366]' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 text-[9px] font-black rounded-full bg-[#003366] text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More options button */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center relative rounded-xl transition-all ${
            showMoreDrawer
              ? 'text-[#003366] font-bold'
              : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {(urgentReviewsCount > 0 || failedCount > 0) && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-medium">
            Más
          </span>
        </button>
      </nav>

      {/* Slide-up "Más" Drawer for Mobile */}
      {showMoreDrawer && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 pb-20 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Centro de Alto Rendimiento AEAT
              </span>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Level switch in mobile */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs">
              <button
                onClick={() => onLevelChange('C2')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${
                  currentLevel === 'C2'
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>C2 Agentes (Noviembre)</span>
              </button>
              <button
                onClick={() => onLevelChange('C1')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${
                  currentLevel === 'C1'
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <span>C1 Técnicos (2028)</span>
              </button>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onViewChange('calc');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                  currentView === 'calc'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Calculator className="w-4 h-4 text-[#003366] shrink-0" />
                <div>
                  <span className="block font-bold">Calculadora LGT</span>
                  <span className="text-[10px] text-slate-400">Plazos y recargos</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onViewChange('curve');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                  currentView === 'curve'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-[#003366] shrink-0" />
                <div>
                  <span className="block font-bold">Curva del Olvido</span>
                  <span className="text-[10px] text-slate-400">
                    {urgentReviewsCount > 0 ? `${urgentReviewsCount} urgentes` : 'Al día'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onViewChange('errors');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                  currentView === 'errors'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="block font-bold">Cuaderno Fallos</span>
                  <span className="text-[10px] text-rose-500">
                    {failedCount > 0 ? `${failedCount} por repasar` : 'Limpio'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onViewChange('summary');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                  currentView === 'summary'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-[#003366] shrink-0" />
                <div>
                  <span className="block font-bold">Fichas & Plazos</span>
                  <span className="text-[10px] text-slate-400">Artículos y leyes</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onViewChange('traps');
                  setShowMoreDrawer(false);
                }}
                className={`col-span-2 p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                  currentView === 'traps'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="block font-bold">Radar de Trampas de Examen</span>
                  <span className="text-[10px] text-slate-400">Distractores frecuentes del tribunal y despiece técnico</span>
                </div>
              </button>
            </div>

            {/* Density Switch */}
            <button
              onClick={onToggleDensity}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                {density === 'clean' ? <Sparkles className="w-4 h-4 text-[#003366]" /> : <LayoutGrid className="w-4 h-4 text-slate-500" />}
                <span>{density === 'clean' ? 'Modo Limpio Activo' : 'Modo Compacto Activo'}</span>
              </div>
              <span className="text-[11px] text-slate-400">Cambiar</span>
            </button>

            {/* Duda al Preparador */}
            <button
              onClick={() => {
                setShowMoreDrawer(false);
                onOpenChat();
              }}
              className="w-full py-2.5 px-3 bg-[#003366] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Consultar Duda al Preparador</span>
            </button>

            {/* Install button */}
            <div className="pt-2">
              <PWAInstallButton />
            </div>

          </div>
        </div>
      )}
    </>
  );
};

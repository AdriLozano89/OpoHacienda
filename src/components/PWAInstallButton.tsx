import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running standalone, no need to show install
  if (isInstalled) return null;

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-lg font-semibold transition-all shadow-xs ${
          compact
            ? 'px-2.5 py-1 text-[11px] bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
            : 'w-full px-3 py-2 text-xs bg-[#003366] text-white hover:bg-[#002244] dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400'
        }`}
        title="Instalar en este dispositivo para acceso rápido y modo sin conexión"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all ${
            compact
              ? 'px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              : 'w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
          title="Instalar en iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#003366] dark:text-amber-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold flex items-center gap-2 text-[#003366] dark:text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar en iPhone o iPad</span>
                </h4>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#003366] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#003366] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Desplaza hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700 dark:text-slate-200" />).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 bg-[#003366] text-white dark:bg-slate-800 dark:text-white font-semibold text-xs rounded-xl"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 md:bottom-5 right-4 z-50 flex items-center gap-2 bg-[#003366] text-white px-3 py-1.5 rounded-xl shadow-lg border border-amber-500/50 text-xs font-semibold animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Modo sin conexión • Tus temas y tests guardados siguen disponibles</span>
    </div>
  );
};

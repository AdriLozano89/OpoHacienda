import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, Clock, DollarSign, CheckCircle2, AlertTriangle, BookOpen, RotateCcw } from 'lucide-react';

export const LGTCalculatorTab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'art62' | 'art27' | 'lpac30'>('art62');

  // --- TOOL 1: Art. 62 LGT (Plazos de Pago en Voluntaria y Ejecutiva) ---
  const [notificationDate, setNotificationDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [procedureType, setProcedureType] = useState<'voluntaria' | 'ejecutiva'>('voluntaria');

  const art62Result = useMemo(() => {
    if (!notificationDate) return null;
    const [yearStr, monthStr, dayStr] = notificationDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed
    const day = parseInt(dayStr, 10);

    const isFirstFortnight = day >= 1 && day <= 15;

    let targetYear = year;
    let targetMonth = month;
    let targetDay = 20;
    let ruleText = '';
    let legalRef = '';

    if (procedureType === 'voluntaria') {
      // Art. 62.2 LGT
      if (isFirstFortnight) {
        // Del 1 al 15: vence el 20 del mes siguiente
        targetMonth = month + 1;
        targetDay = 20;
        ruleText = 'Notificada entre los días 1 y 15: el plazo vence el día 20 del mes posterior (o inmediato hábil siguiente).';
        legalRef = 'Art. 62.2.a) LGT (Ley 58/2003)';
      } else {
        // Del 16 al último: vence el 5 del segundo mes posterior
        targetMonth = month + 2;
        targetDay = 5;
        ruleText = 'Notificada entre el día 16 y el último día del mes: el plazo vence el día 5 del segundo mes posterior (o inmediato hábil siguiente).';
        legalRef = 'Art. 62.2.b) LGT (Ley 58/2003)';
      }
    } else {
      // Art. 62.5 LGT (Apremio)
      if (isFirstFortnight) {
        // Del 1 al 15: vence el 20 de dicho mes
        targetMonth = month;
        targetDay = 20;
        ruleText = 'Notificada entre los días 1 y 15: el plazo en ejecutiva vence el día 20 de dicho mes (o inmediato hábil posterior).';
        legalRef = 'Art. 62.5.a) LGT (Ley 58/2003)';
      } else {
        // Del 16 al último: vence el 5 del mes siguiente
        targetMonth = month + 1;
        targetDay = 5;
        ruleText = 'Notificada entre el día 16 y el último día del mes: el plazo en ejecutiva vence el día 5 del mes posterior (o inmediato hábil siguiente).';
        legalRef = 'Art. 62.5.b) LGT (Ley 58/2003)';
      }
    }

    if (targetMonth > 11) {
      targetYear += Math.floor(targetMonth / 12);
      targetMonth = targetMonth % 12;
    }

    const calculatedDate = new Date(targetYear, targetMonth, targetDay);
    // Format in Spanish
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const formattedDate = `${targetDay} de ${monthNames[targetMonth]} de ${targetYear}`;
    const dayOfWeek = calculatedDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
      day,
      month: monthNames[month],
      year,
      formattedDate,
      ruleText,
      legalRef,
      isWeekend,
      dayOfWeekName: isWeekend ? (dayOfWeek === 0 ? 'Domingo' : 'Sábado') : null,
      isoDate: calculatedDate.toISOString().split('T')[0],
    };
  }, [notificationDate, procedureType]);

  // --- TOOL 2: Art. 27 LGT (Recargo por declaración extemporánea) ---
  const [dueDate, setDueDate] = useState<string>('2025-07-20');
  const [filingDate, setFilingDate] = useState<string>('2025-11-25');
  const [debtAmount, setDebtAmount] = useState<number>(10000);
  const [simultaneousPayment, setSimultaneousPayment] = useState<boolean>(true);

  const art27Result = useMemo(() => {
    if (!dueDate || !filingDate || debtAmount <= 0) return null;
    const start = new Date(dueDate);
    const end = new Date(filingDate);

    if (end <= start) {
      return { isError: true, message: 'La fecha de presentación debe ser posterior a la fecha límite voluntaria.' };
    }

    // Calculate full months between dates
    let fullMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) {
      fullMonths -= 1;
    }
    fullMonths = Math.max(0, fullMonths);

    const isOver12Months = fullMonths >= 12;
    let surchargeRate = 0;
    let interestRateApplicable = false;

    if (!isOver12Months) {
      // 1% + 1% por cada mes completo
      surchargeRate = 1 + fullMonths;
    } else {
      // 15% + intereses de demora
      surchargeRate = 15;
      interestRateApplicable = true;
    }

    const grossSurcharge = (debtAmount * surchargeRate) / 100;
    const reductionAmount = simultaneousPayment ? grossSurcharge * 0.25 : 0;
    const netSurcharge = grossSurcharge - reductionAmount;
    const totalToPay = debtAmount + netSurcharge;

    return {
      isError: false,
      fullMonths,
      surchargeRate,
      isOver12Months,
      interestRateApplicable,
      grossSurcharge,
      reductionAmount,
      netSurcharge,
      totalToPay,
    };
  }, [dueDate, filingDate, debtAmount, simultaneousPayment]);

  // --- TOOL 3: Art. 30 LPAC (Cómputo en días hábiles) ---
  const [lpacStartDate, setLpacStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [lpacDays, setLpacDays] = useState<number>(10);

  const lpacResult = useMemo(() => {
    if (!lpacStartDate || lpacDays <= 0) return null;
    const start = new Date(lpacStartDate);
    
    // According to art. 30.3 LPAC, computing begins the day AFTER notification
    let current = new Date(start);
    let addedWorkingDays = 0;

    while (addedWorkingDays < lpacDays) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      // Saturday = 6, Sunday = 0 are non-working days
      if (day !== 0 && day !== 6) {
        addedWorkingDays++;
      }
    }

    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const formatted = `${current.getDate()} de ${monthNames[current.getMonth()]} de ${current.getFullYear()}`;

    return {
      finalDate: formatted,
      isoDate: current.toISOString().split('T')[0],
      totalCalendarDays: Math.round((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    };
  }, [lpacStartDate, lpacDays]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-[#003366] dark:text-[#D4AF37] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/40 font-mono">
            Herramienta Operativa AEAT
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Motor de Cómputo Normativo sin conexión
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Calculadora Oficial de Plazos, Vencimientos y Recargos LGT
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Resuelve en segundos cualquier vencimiento de los artículos 62 y 27 de la Ley General Tributaria y el cómputo de días hábiles del art. 30 de la Ley 39/2015 para el primer y segundo ejercicio de Agentes y Técnicos de Hacienda.
        </p>

        {/* Tab Selector Buttons */}
        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTool('art62')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTool === 'art62'
                ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-[#001D38] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Plazos Art. 62 LGT (Voluntaria & Apremio)</span>
          </button>

          <button
            onClick={() => setActiveTool('art27')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTool === 'art27'
                ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-[#001D38] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Recargos Art. 27 LGT & Reducción 25%</span>
          </button>

          <button
            onClick={() => setActiveTool('lpac30')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTool === 'lpac30'
                ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-[#001D38] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Días Hábiles Art. 30 LPAC</span>
          </button>
        </div>
      </div>

      {/* --- TOOL 1: ARTÍCULO 62 LGT --- */}
      {activeTool === 'art62' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Form */}
          <div className="lg:col-span-5 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Calculator className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
              <span>Parámetros de Notificación</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Procedimiento / Período:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProcedureType('voluntaria')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    procedureType === 'voluntaria'
                      ? 'bg-blue-50 border-[#003366] text-[#003366] dark:bg-blue-950/60 dark:border-[#D4AF37] dark:text-[#D4AF37]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Voluntaria (Art. 62.2)
                </button>
                <button
                  type="button"
                  onClick={() => setProcedureType('ejecutiva')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    procedureType === 'ejecutiva'
                      ? 'bg-amber-50 border-amber-600 text-amber-800 dark:bg-amber-950/60 dark:border-amber-400 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Apremio (Art. 62.5)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Fecha en que se notifica la liquidación / providencia:
              </label>
              <input
                type="date"
                value={notificationDate}
                onChange={(e) => setNotificationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#001833] text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-[#003366] outline-none"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Selecciona cualquier fecha para comprobar la quincena (1-15 vs 16-fin de mes).
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Casos Típicos de Examen Oficial:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationDate('2025-03-08')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  8 de marzo (1ª quincena)
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationDate('2025-03-24')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  24 de marzo (2ª quincena)
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationDate('2025-12-10')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  10 de diciembre
                </button>
              </div>
            </div>

          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            
            {art62Result && (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Resultado del Cómputo Oficial
                  </span>
                  <div className="flex items-baseline gap-3">
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-[#003366] dark:text-[#D4AF37]">
                      {art62Result.formattedDate}
                    </h4>
                  </div>
                  {art62Result.isWeekend && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        ¡Atención! Cae en <strong>{art62Result.dayOfWeekName}</strong> (inhábil). Conforme al art. 30.5 LPAC se traslada automáticamente al <strong>inmediato día hábil posterior</strong>.
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation Card */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-[#003366] dark:text-sky-400" />
                    <span>Fundamentación Jurídica Aplicable:</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                    <div className="font-bold text-[#003366] dark:text-[#D4AF37]">
                      {art62Result.legalRef}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {art62Result.ruleText}
                    </p>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Tabla Comparativa Oficial: Voluntaria (62.2) vs Apremio (62.5)
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">Quincena Notificada</th>
                          <th className="p-2.5">Periodo Voluntario (62.2)</th>
                          <th className="p-2.5">Periodo Ejecutivo / Apremio (62.5)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                        <tr className={art62Result.day <= 15 ? 'bg-blue-50/60 dark:bg-blue-950/30 font-bold' : ''}>
                          <td className="p-2.5 font-medium">Días 1 al 15</td>
                          <td className="p-2.5 text-[#003366] dark:text-[#D4AF37]">Día 20 del mes siguiente</td>
                          <td className="p-2.5 text-amber-700 dark:text-amber-400">Día 20 de dicho mes</td>
                        </tr>
                        <tr className={art62Result.day > 15 ? 'bg-blue-50/60 dark:bg-blue-950/30 font-bold' : ''}>
                          <td className="p-2.5 font-medium">Día 16 al último</td>
                          <td className="p-2.5 text-[#003366] dark:text-[#D4AF37]">Día 5 del 2º mes posterior</td>
                          <td className="p-2.5 text-amber-700 dark:text-amber-400">Día 5 del mes siguiente</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      )}

      {/* --- TOOL 2: ARTÍCULO 27 LGT --- */}
      {activeTool === 'art27' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs */}
          <div className="lg:col-span-5 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Parámetros de la Autoliquidación Extemporánea</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deuda Tributaria Autoliquidada (€):
              </label>
              <input
                type="number"
                value={debtAmount}
                onChange={(e) => setDebtAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#001833] text-slate-900 dark:text-white text-sm font-mono tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vencimiento voluntario:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#001833] text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Presentación extemporánea:
                </label>
                <input
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#001833] text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simultaneousPayment}
                  onChange={(e) => setSimultaneousPayment(e.target.checked)}
                  className="mt-0.5 rounded text-[#003366] focus:ring-[#003366]"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  <strong>Aplica reducción del 25% (art. 27.5 LGT)</strong> por ingreso simultáneo al presentar o solicitud de aplazamiento garantizado.
                </span>
              </label>
            </div>

            {/* Note on Ley 11/2021 */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-400 block">
                Fórmula Legal Reformada (Ley 11/2021):
              </span>
              <p>
                1% fijo + 1% por cada mes completo de retraso (máx 15%). Si supera los 12 meses, se devenga el 15% fijo más intereses de demora desde el día siguiente al cumplimiento de los 12 meses.
              </p>
            </div>
          </div>

          {/* Liquidación Result */}
          <div className="lg:col-span-7 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {art27Result && !art27Result.isError && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">Retraso computado</span>
                    <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                      {art27Result.fullMonths} meses completos
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Porcentaje de Recargo</span>
                    <h5 className="text-xl font-mono font-bold text-[#AA151B] dark:text-rose-400">
                      {art27Result.surchargeRate},00 %
                    </h5>
                  </div>
                </div>

                {/* Hoja de Liquidación */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Hoja Oficial de Liquidación Tributaria:
                  </span>
                  
                  <div className="bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Base de la deuda autoliquidada:</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {debtAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Recargo Bruto Art. 27.2 ({art27Result.surchargeRate}%):</span>
                      <span className="font-bold text-[#AA151B] dark:text-rose-400 tabular-nums">
                        + {art27Result.grossSurcharge?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>

                    {simultaneousPayment && (
                      <div className="p-3 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                        <span>Reducción 25% (Art. 27.5 LGT):</span>
                        <span className="font-bold tabular-nums">
                          - {art27Result.reductionAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 flex justify-between items-center bg-blue-50/70 dark:bg-[#001D3A] text-sm">
                      <span className="font-bold text-[#003366] dark:text-[#D4AF37]">
                        Recargo Neto Final Liquidado:
                      </span>
                      <span className="font-extrabold text-[#003366] dark:text-[#D4AF37] tabular-nums text-base">
                        {art27Result.netSurcharge?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  </div>
                </div>

                {art27Result.interestRateApplicable && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Al superar los 12 meses de retraso, se devengan adicionalmente <strong>intereses de demora tributarios</strong> desde el día siguiente a cumplir los 12 meses hasta la fecha de ingreso.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      )}

      {/* --- TOOL 3: ARTÍCULO 30 LPAC (Días Hábiles) --- */}
      {activeTool === 'lpac30' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Calendar className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
              <span>Cómputo Administrativo (Art. 30 LPAC)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de la Notificación:
              </label>
              <input
                type="date"
                value={lpacStartDate}
                onChange={(e) => setLpacStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#001833] text-slate-900 dark:text-white text-sm font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                El cómputo se inicia a partir del <strong>día siguiente</strong> a aquel en que tenga lugar la notificación.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plazo concedido (en Días Hábiles):
              </label>
              <div className="flex gap-2">
                {[10, 15, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLpacDays(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      lpacDays === d
                        ? 'bg-[#003366] text-white dark:bg-[#D4AF37] dark:text-slate-950 border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>• Se excluyen del cómputo los <strong>sábados, domingos y días declarados festivos</strong>.</p>
              <p>• Cuando un día fuese hábil en el municipio o CA y festivo en la sede del órgano directivo, o a la inversa, se considerará <strong>inhábil</strong> en todo caso.</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            {lpacResult && (
              <>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Fecha de Vencimiento del Plazo Legal
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#003366] dark:text-[#D4AF37]">
                  {lpacResult.finalDate}
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#001730] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Desglose del cómputo (Art. 30.2 Ley 39/2015 LPAC):
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Para conceder {lpacDays} días hábiles comenzando a contar el día siguiente a la notificación, transcurren un total de <strong>{lpacResult.totalCalendarDays} días naturales</strong> debido a la exclusión preceptiva de fines de semana.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

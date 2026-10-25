import React, { useState } from 'react';
import { SummaryData } from '../types/oposicion';
import { Table, Clock, AlertTriangle, BookMarked, Search, Copy, Check, Layers } from 'lucide-react';

interface SummaryTabProps {
  summary: SummaryData;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ summary }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'deadlines' | 'sanctions' | 'articles' | 'markdown'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filterText = searchQuery.toLowerCase().trim();

  const filteredDeadlines = (summary.deadlinesTable || []).filter(
    (d) =>
      d.process.toLowerCase().includes(filterText) ||
      d.deadline.toLowerCase().includes(filterText) ||
      d.regulation.toLowerCase().includes(filterText) ||
      d.notes.toLowerCase().includes(filterText)
  );

  const filteredSanctions = (summary.sanctionsTable || []).filter(
    (s) =>
      s.infraction.toLowerCase().includes(filterText) ||
      s.classification.toLowerCase().includes(filterText) ||
      s.base.toLowerCase().includes(filterText) ||
      s.reductions.toLowerCase().includes(filterText)
  );

  const filteredArticles = (summary.articles || []).filter(
    (a) =>
      a.article.toLowerCase().includes(filterText) ||
      a.title.toLowerCase().includes(filterText) ||
      a.content.toLowerCase().includes(filterText)
  );

  const filteredConcepts = (summary.keyConcepts || []).filter(
    (c) =>
      c.concept.toLowerCase().includes(filterText) ||
      c.definition.toLowerCase().includes(filterText)
  );

  const handleCopyMarkdown = () => {
    const textToCopy = summary.markdownContent || JSON.stringify(summary, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation & Search bar */}
      <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs transition-colors">
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'all'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vista Completa</span>
          </button>
          <button
            onClick={() => setActiveSubTab('deadlines')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'deadlines'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Plazos ({summary.deadlinesTable?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sanctions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'sanctions'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sanciones ({summary.sanctionsTable?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('articles')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'articles'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Artículos ({summary.articles?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('markdown')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'markdown'
                ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
        </div>

        {/* Search & Copy */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar artículo o plazo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#003366] dark:focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-750 transition-colors shrink-0"
            title="Copiar resumen en Markdown para imprimir o estudiar"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* 1. Deadlines Table (Plazos Procesales) */}
      {(activeSubTab === 'all' || activeSubTab === 'deadlines') && (
        <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#001D3D] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#003366] dark:text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Tabla Oficial de Plazos Procesales y Cómputo
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredDeadlines.length} plazos identificados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Trámite / Actuación</th>
                  <th className="py-3 px-4">Plazo Exacto</th>
                  <th className="py-3 px-4">Tipo de Cómputo</th>
                  <th className="py-3 px-4">Regulación</th>
                  <th className="py-3 px-4">Particularidad / Cómputo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredDeadlines.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.process}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 dark:bg-amber-500/15 border border-blue-200 dark:border-amber-500/30 font-bold text-[#003366] dark:text-amber-300">
                        {item.deadline}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 font-mono text-[11px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-sky-400">
                      {item.regulation}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed max-w-xs">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Sanctions Table */}
      {(activeSubTab === 'all' || activeSubTab === 'sanctions') && (
        <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#001D3D] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#AA151B] dark:text-rose-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Régimen Sancionador y Recargos: Calificación y Reducciones (Art. 188 LGT)
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredSanctions.length} conceptos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Infracción o Recargo</th>
                  <th className="py-3 px-4">Calificación</th>
                  <th className="py-3 px-4">Base / Cuantía</th>
                  <th className="py-3 px-4">Reducciones (Art. 188 LGT) / Efectos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSanctions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.infraction}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.classification === 'Leve'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                          : item.classification === 'Grave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                      }`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-200">
                      {item.base}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {item.reductions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Key Articles Cards */}
      {(activeSubTab === 'all' || activeSubTab === 'articles') && (
        <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#003366] dark:text-sky-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Artículos Fundamentales Citables en Examen
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredArticles.length} artículos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-[#003366] dark:text-amber-400 text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-amber-500/10 border border-blue-200 dark:border-amber-500/25">
                    {art.article}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{art.title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {art.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Markdown View */}
      {activeSubTab === 'markdown' && (
        <div className="bg-white dark:bg-[#002244] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Esquema Markdown Oficial
            </h3>
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto Completo'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-200 dark:border-slate-800">
            {summary.markdownContent || 'Resumen no disponible en formato markdown.'}
          </pre>
        </div>
      )}

    </div>
  );
};

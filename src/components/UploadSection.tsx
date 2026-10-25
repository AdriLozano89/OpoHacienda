import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, BookOpen, Check, AlertCircle, Loader2, Trash2, Layers, Filter, Plus, FileCheck, CheckCircle2 } from 'lucide-react';
import { OposicionLevel, CompleteTopicPackage, UploadedFileItem } from '../types/oposicion';

import { ViewDensity } from '../hooks/useDensity';

interface UploadSectionProps {
  currentLevel: OposicionLevel;
  onLevelChange: (level: OposicionLevel) => void;
  onPackageGenerated: (newPackage: CompleteTopicPackage) => void;
  onSelectOfficialTopic: (topic: CompleteTopicPackage) => void;
  selectedTopicId: string;
  allTopics: CompleteTopicPackage[];
  onOpenTestFilter: () => void;
  onDeleteTopic?: (topicId: string) => void;
  density?: ViewDensity;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  currentLevel,
  onLevelChange,
  onPackageGenerated,
  onSelectOfficialTopic,
  selectedTopicId,
  allTopics,
  onOpenTestFilter,
  onDeleteTopic,
  density = 'clean',
}) => {
  const isClean = density === 'clean';
  const [inputMode, setInputMode] = useState<'library' | 'upload_multi' | 'paste'>('library');
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  
  // Multi-PDF upload state
  const [fileQueue, setFileQueue] = useState<UploadedFileItem[]>([]);
  const [processStrategy, setProcessStrategy] = useState<'individual' | 'combined'>('individual');
  const [combinedTopicTitle, setCombinedTopicTitle] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingName, setCurrentProcessingName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: UploadedFileItem[] = [];

    Array.from(files).forEach((file) => {
      const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      newItems.push({
        id,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/pdf',
        status: 'reading',
        targetLevel: currentLevel,
      });

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFileQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, base64, status: 'idle' } : item
          )
        );
      };
      reader.onerror = () => {
        setFileQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: 'error', errorMessage: 'Error leyendo archivo' }
              : item
          )
        );
      };
      reader.readAsDataURL(file);
    });

    setFileQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProcessQueue = async () => {
    if (fileQueue.length === 0) {
      setErrorMessage('Agrega al menos un archivo PDF o documento de apuntes.');
      return;
    }

    const readyFiles = fileQueue.filter((f) => f.base64);
    if (readyFiles.length === 0) {
      setErrorMessage('Los archivos aún se están cargando en el navegador. Espera un momento.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (processStrategy === 'combined') {
        setCurrentProcessingName(`Consolidando ${readyFiles.length} documentos...`);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: readyFiles.map((f) => ({
              fileBase64: f.base64,
              fileMimeType: f.mimeType,
              fileName: f.name,
            })),
            mode: 'all',
            targetLevel: currentLevel,
            topicTitle: combinedTopicTitle || `Bloque Temático (${readyFiles.length} PDFs)`,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Error del servidor (${response.status})`);
        }

        const data = await response.json();
        const newPkg: CompleteTopicPackage = {
          id: `custom-multi-${Date.now()}`,
          title: combinedTopicTitle || `Bloque Temático (${readyFiles.length} PDFs)`,
          subtitle: `Generado a partir de ${readyFiles.map((f) => f.name).join(', ')}`,
          level: currentLevel,
          summary: data.summary,
          test: data.test,
          flashcards: data.flashcards || [],
          traps: data.traps || { topicTitle: combinedTopicTitle, level: currentLevel, items: [] },
          isCustom: true,
          createdAt: new Date().toLocaleDateString(),
        };

        onPackageGenerated(newPkg);
        setFileQueue([]);
      } else {
        for (let i = 0; i < readyFiles.length; i++) {
          const f = readyFiles[i];
          setCurrentProcessingName(`Procesando (${i + 1}/${readyFiles.length}): ${f.name}...`);

          setFileQueue((prev) =>
            prev.map((item) => (item.id === f.id ? { ...item, status: 'processing' } : item))
          );

          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: f.base64,
              fileMimeType: f.mimeType,
              mode: 'all',
              targetLevel: f.targetLevel || currentLevel,
              topicTitle: f.name.replace(/\.[^/.]+$/, ''),
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Error procesando ${f.name}`);
          }

          const data = await response.json();
          const cleanTitle = f.name.replace(/\.[^/.]+$/, '');

          const newPkg: CompleteTopicPackage = {
            id: `custom-${Date.now()}-${i}`,
            title: cleanTitle,
            subtitle: `Generado desde ${f.name} (${f.targetLevel})`,
            level: f.targetLevel,
            summary: data.summary,
            test: data.test,
            flashcards: data.flashcards || [],
            traps: data.traps || { topicTitle: cleanTitle, level: f.targetLevel, items: [] },
            isCustom: true,
            sourceFileName: f.name,
            createdAt: new Date().toLocaleDateString(),
          };

          onPackageGenerated(newPkg);

          setFileQueue((prev) =>
            prev.map((item) => (item.id === f.id ? { ...item, status: 'completed' } : item))
          );
        }

        setTimeout(() => {
          setFileQueue((prev) => prev.filter((item) => item.status !== 'completed'));
        }, 1200);
      }

      setInputMode('library');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error procesando los documentos.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingName('');
    }
  };

  const handleProcessPasted = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Por favor pega el texto de los artículos o apuntes.');
      return;
    }

    setIsProcessing(true);
    setCurrentProcessingName('Analizando apuntes pegados con el preparador...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          mode: 'all',
          targetLevel: currentLevel,
          topicTitle: pastedTitle || 'Apuntes Adicionales',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error procesando el texto');
      }

      const data = await response.json();
      const newPkg: CompleteTopicPackage = {
        id: `custom-paste-${Date.now()}`,
        title: pastedTitle || 'Apuntes Adicionales',
        subtitle: `Generado desde texto pegado (${currentLevel})`,
        level: currentLevel,
        summary: data.summary,
        test: data.test,
        flashcards: data.flashcards || [],
        traps: data.traps || { topicTitle: pastedTitle, level: currentLevel, items: [] },
        isCustom: true,
        createdAt: new Date().toLocaleDateString(),
      };

      onPackageGenerated(newPkg);
      setPastedText('');
      setPastedTitle('');
      setInputMode('library');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error procesando los apuntes.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingName('');
    }
  };

  return (
    <div className={`bg-white dark:bg-[#001D38] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors ${
      isClean ? 'p-5 sm:p-7' : 'p-4 sm:p-5'
    }`}>
      
      {/* Top Bar: Title & Action Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#003366] dark:text-[#D4AF37]" />
            <span>Biblioteca y Gestor de Temario Multi-PDF</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sube múltiples PDFs a la vez, organízalos en tu temario completo y filtra para realizar test
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Filter Test Button */}
          <button
            onClick={onOpenTestFilter}
            className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white dark:bg-[#D4AF37] dark:hover:bg-[#BF9B30] dark:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar y Hacer Test ({allTopics.length} Temas)</span>
          </button>

          {/* Submode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setInputMode('library')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                inputMode === 'library'
                  ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-[#D4AF37] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mi Temario ({allTopics.length})
            </button>
            <button
              onClick={() => setInputMode('upload_multi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                inputMode === 'upload_multi'
                  ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-[#D4AF37] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Subir Varios PDFs</span>
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                inputMode === 'paste'
                  ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-[#D4AF37] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pegar Texto
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Library of all topics */}
      {inputMode === 'library' && (
        <div className="pt-5">
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Temas disponibles en tu preparación:
            </span>
            <button
              onClick={() => setInputMode('upload_multi')}
              className="text-[#003366] dark:text-[#D4AF37] hover:underline font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir más PDFs</span>
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
            isClean ? 'gap-4 sm:gap-5' : 'gap-3'
          }`}>
            {allTopics.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => onSelectOfficialTopic(topic)}
                  className={`text-left rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isClean ? 'p-5 sm:p-6' : 'p-4'
                  } ${
                    isSelected
                      ? 'bg-blue-50/40 border-2 border-[#003366] dark:bg-slate-800/90 dark:border-[#D4AF37] shadow-xs'
                      : 'bg-white dark:bg-[#001730] border-slate-200/90 dark:border-slate-850 hover:border-[#003366]/50 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          topic.level === 'C2' ? 'bg-blue-50 text-[#003366] border border-blue-200 dark:bg-blue-950/60 dark:text-sky-300 dark:border-blue-900' : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          Nivel {topic.level}
                        </span>
                        {topic.isCustom && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                            PDF Propio
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#003366] dark:text-[#D4AF37]">
                          <Check className="w-3.5 h-3.5" />
                          Seleccionado
                        </span>
                      ) : (
                        topic.isCustom && onDeleteTopic && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTopic(topic.id);
                            }}
                            className="p-1 text-slate-400 hover:text-[#AA151B] transition-colors"
                            title="Eliminar tema"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {topic.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="font-bold text-[#003366] dark:text-[#D4AF37]">{topic.test.questions.length} preguntas</span>
                    <span>{topic.flashcards.length} tarjetas</span>
                    <span>{topic.traps.items.length} trampas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Multi-PDF Upload Queue */}
      {inputMode === 'upload_multi' && (
        <div className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">¿Cómo deseas procesar los PDFs?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProcessStrategy('individual')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  processStrategy === 'individual'
                    ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                1 Tema por cada PDF (Recomendado)
              </button>
              <button
                type="button"
                onClick={() => setProcessStrategy('combined')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  processStrategy === 'combined'
                    ? 'bg-[#003366] text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Consolidar en 1 Gran Bloque
              </button>
            </div>
          </div>

          {processStrategy === 'combined' && (
            <input
              type="text"
              placeholder="Nombre del bloque consolidado (ej. Bloque III: Procedimientos Tributarios)"
              value={combinedTopicTitle}
              onChange={(e) => setCombinedTopicTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#003366] dark:focus:border-amber-500"
            />
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#003366] bg-blue-50/50 dark:border-amber-500 dark:bg-amber-500/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#003366] dark:hover:border-slate-500 bg-slate-50/40 dark:bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.md"
              multiple
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-amber-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Haz clic o arrastra y suelta varios PDFs a la vez aquí
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Selecciona 2, 5, 10 o más PDFs de tus temas de academia (CTH, CEF, Adams, apuntes oficiales).
              </p>
            </div>
          </div>

          {fileQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="font-bold text-slate-800 dark:text-white">
                  Archivos en cola para procesar ({fileQueue.length}):
                </span>
                <button
                  onClick={() => setFileQueue([])}
                  className="text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Vaciar cola
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {fileQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#003366] dark:text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {(item.size / 1024 / 1024).toFixed(2)} MB • {item.targetLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'reading' && (
                        <span className="text-[10px] text-slate-400 italic">Cargando...</span>
                      )}
                      {item.status === 'idle' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Listo
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Procesando
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Añadido
                        </span>
                      )}
                      {!isProcessing && (
                        <button
                          onClick={() => handleRemoveFile(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleProcessQueue}
                disabled={isProcessing}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md bg-[#003366] hover:bg-[#002244] text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{currentProcessingName || 'El preparador está procesando el temario...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {processStrategy === 'combined'
                        ? `Procesar y Consolidar los ${fileQueue.length} PDFs`
                        : `Procesar los ${fileQueue.length} PDFs como Temas Individuales`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Paste Text */}
      {inputMode === 'paste' && (
        <div className="pt-4 space-y-3">
          <input
            type="text"
            placeholder="Título del tema (ej. Artículos 62 a 68 LGT: Extinción y Prescripción)"
            value={pastedTitle}
            onChange={(e) => setPastedTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#003366] dark:focus:border-amber-500"
          />

          <textarea
            rows={5}
            placeholder="Pega aquí el texto de leyes, apuntes o esquemas de la academia..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-[#003366] dark:focus:border-amber-500 font-mono leading-relaxed"
          />

          <button
            onClick={handleProcessPasted}
            disabled={isProcessing || !pastedText.trim()}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs bg-[#003366] hover:bg-[#002244] text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentProcessingName || 'Generando tema...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Añadir como Nuevo Tema al Temario</span>
              </>
            )}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

    </div>
  );
};

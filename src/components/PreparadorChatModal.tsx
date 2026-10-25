import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Scale, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { OposicionLevel } from '../types/oposicion';

interface PreparadorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: OposicionLevel;
  currentTopicTitle: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'preparador';
  text: string;
  timestamp: string;
}

export const PreparadorChatModal: React.FC<PreparadorChatModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  currentTopicTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'preparador',
      text: `¡Hola opositor! Soy tu preparador experto de Hacienda Pública. Estamos trabajando con el horizonte fijado en aprobar C2 (Agentes) en Noviembre y construir base sólida para C1 (Técnicos) en 2028. Pregúntame cualquier duda sobre artículos de la LGT, reglamentos (RGR, RGGI, RGST), cómputo de plazos o casuística de examen sobre ${currentTopicTitle}.`,
      timestamp: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickQuestions = [
    '¿Qué ocurre si el día 20 o 5 del art. 62.5 LGT cae en sábado?',
    '¿Se suspende la sanción si recurro en reposición sin aval?',
    '¿Cuál es la diferencia exacta entre prescripción y caducidad?',
    '¿Cuándo se pierde la reducción del 30% por conformidad?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputText;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          targetLevel: currentLevel,
          topicTitle: currentTopicTitle,
          userQuestion: q,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el preparador.');
      }

      const data = await response.json();
      const prepMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'preparador',
        text: data.reply || 'Respuesta generada.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, prepMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'preparador',
        text: 'Disculpa, ha habido un problema de conexión con el preparador. Revisa que la clave de IA esté activa o formula de nuevo la pregunta.',
        timestamp: 'Error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[620px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Despacho del Preparador de Hacienda
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Nivel {currentLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resolución jurídica directa • Respuestas referenciadas por artículo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-850 border border-slate-700/80 text-slate-200 rounded-tl-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right font-mono ${
                    isUser ? 'text-slate-800' : 'text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-850 border border-slate-700/80 rounded-2xl text-xs text-slate-400 italic">
                El preparador está redactando la fundamentación jurídica...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0">Dudas típicas:</span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe tu consulta tributaria (artículo, plazo, recurso...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/60"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

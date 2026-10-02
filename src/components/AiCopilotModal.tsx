import React, { useState } from 'react';
import { Candidate, Alert } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  alerts: Alert[];
  currentRole?: string;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  candidates,
  alerts,
  currentRole = 'RH',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Bonjour ! Je suis votre Copilote IA Onboarding Manufacturing. Je surveille en temps réel les 90 jours d intégration de vos opérateurs, la Learning Curve, le Carré Magique et les scores d attrition. Comment puis-je vous aider aujourd hui ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: 'user', text: textToSend },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          role: currentRole,
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: data.reply || 'Je n ai pas pu obtenir de réponse pour le moment.',
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: 'Une erreur réseau est survenue avec le service IA. Veuillez réessayer.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Quelles recrues nécessitent un entretien RH urgent ?',
    'Pourquoi Karim Mansouri est-il en risque critique d attrition ?',
    'Recommandations Lean pour la Ligne Cockpit CK-01',
    'Comment améliorer le taux de réussite à l école (J1-J5) ?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[600px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Copilote IA Manufacturing (Gemini 3.8 Flash)</h3>
              <p className="text-[11px] text-slate-300">
                Assistance experte RH & Opérations Usine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Gemini analyse les métriques de l usine...</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-slate-500 font-semibold shrink-0">Suggestions :</span>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question sur les recrues, la cadence, les alertes..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};

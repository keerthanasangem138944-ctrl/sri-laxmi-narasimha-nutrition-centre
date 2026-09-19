import React, { useState, useRef, useEffect } from 'react';
import { usePlatformState } from '../lib/platform-state';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  Bot, 
  User, 
  HelpCircle, 
  Clock, 
  Scale, 
  QrCode, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  topic?: string;
  timestamp: string;
}

export const AiWellnessAssistant: React.FC = () => {
  const { askWellnessAssistant, businessSettings } = usePlatformState();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `Hello! I am your Sri Nutrition & Wellness AI Assistant for our Warangal Centre founded by Sangem Srivijayalaxmi. How may I help you today with appointments, 8-point body composition scans, supplements, or community health camps?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // First try calling our Gemini endpoint / server-side AI
      let responseText = '';
      try {
        const res = await fetch('/api/ai/wellness-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.answer) {
            responseText = data.answer;
          }
        }
      } catch (e) {
        // Fall back to context logic
      }

      if (!responseText) {
        const localRes = await askWellnessAssistant(query);
        responseText = localRes.answer;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I apologize, but I am unable to answer right now. Please contact Sangem Srivijayalaxmi directly at +91 7993367929.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'What are the centre timings in Warangal?',
    'What is included in the 8-point body composition scan?',
    'How do I make a payment via UPI?',
    'Which protein formulation is right for me?',
    'How do I organize a community health camp?',
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-emerald-800 hover:bg-emerald-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 border border-emerald-700/80"
        title="Ask Sri Wellness AI"
      >
        <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
        <span className="text-xs font-serif font-bold tracking-wide pr-1 hidden sm:inline">
          Sri Wellness AI
        </span>
      </button>

      {/* Slide-out or Modal Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-2xs flex items-end sm:items-center justify-start sm:p-6 p-2">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col h-[560px] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>Sri Wellness Assistant</span>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                      Gemini
                    </span>
                  </h3>
                  <span className="text-[11px] text-emerald-200 block">
                    Sangem Srivijayalaxmi Nutrition Centre
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Safety Notice */}
            <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-amber-900">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Lifestyle and nutrition guide. Not medical diagnosis or prescription advice.</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl shadow-2xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        m.sender === 'user' ? 'text-emerald-200' : 'text-stone-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-stone-400 text-xs py-1">
                  <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="italic">Assistant is generating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Quick Questions */}
            <div className="p-2 border-t border-stone-100 bg-white overflow-x-auto flex gap-1.5 text-[11px]">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-600 rounded-lg whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask about scans, diet, camps, timings..."
                className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="p-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

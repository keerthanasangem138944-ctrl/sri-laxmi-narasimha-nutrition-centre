import React, { useState } from 'react';
import { usePlatformState } from '../../lib/platform-state';
import { Card, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Send,
  AlertCircle,
  Clock,
  QrCode,
  Scale,
  MapPin,
  HeartPulse,
} from 'lucide-react';

export const FaqAiView: React.FC = () => {
  const { askWellnessAssistant, businessSettings } = usePlatformState();

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { id: string; question: string; answer: string; relatedTopic?: string }[]
  >([
    {
      id: 'pre-1',
      question: 'What are the operating hours and location of Sri Nutrition & Wellness Centre?',
      answer: `Sri Nutrition & Wellness Centre is located at ${businessSettings.address}, ${businessSettings.city}, Telangana - ${businessSettings.postalCode}. Operating timings: Monday to Saturday from 7:00 AM – 1:00 PM and 4:00 PM – 8:00 PM. Sundays are dedicated to community health screening camps.`,
      relatedTopic: 'Operating Hours & Location',
    },
    {
      id: 'pre-2',
      question: 'How do I make a direct UPI payment to the centre?',
      answer: `Our verified official business UPI ID is ${businessSettings.upiId} (registered to founder ${businessSettings.ownerName}). You can make direct payments for nutrition scans or product orders with zero transaction fees and attach the 12-digit UTR reference.`,
      relatedTopic: 'Direct UPI Payments',
    },
    {
      id: 'pre-3',
      question: 'What is measured in an 8-point body composition analysis?',
      answer:
        'Our non-invasive bio-impedance body scan measures: Height, Weight, BMI, Body Fat %, Visceral Fat Rating, Muscle Mass %, Subcutaneous Fat %, and Basal Metabolic Rate (BMR) to create targeted personalized nutrition protocols.',
      relatedTopic: 'Biometric Scans',
    },
  ]);

  const quickQuestions = [
    'How do community wellness camps work?',
    'What are the centre timings in Warangal?',
    'What are the benefits of personalized protein powder?',
    'How is BMI calculated and what are healthy ranges?',
    'What is the official UPI ID for centre payments?',
  ];

  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || question).trim();
    if (!q) return;

    setLoading(true);
    if (!queryToAsk) setQuestion('');

    try {
      const res = await askWellnessAssistant(q);
      const newEntry = {
        id: `q-${Date.now()}`,
        question: q,
        answer: res.answer,
        relatedTopic: res.relatedTopic || 'Wellness Guidance',
      };
      setChatHistory((prev) => [newEntry, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini AI Wellness Assistant & Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Frequently Asked Questions & Wellness Guidance
        </h1>
        <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
          Ask questions about nutrition fundamentals, body composition analysis, centre services in Warangal, or community camps.
        </p>
      </div>

      {/* Interactive AI Question Box */}
      <Card className="p-6 border-emerald-200 bg-white shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does visceral fat impact metabolic stamina? What are your Warangal timings?"
              className="w-full text-xs p-3.5 pr-24 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              {loading ? (
                'Thinking...'
              ) : (
                <>
                  Ask AI
                  <Send className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Questions Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-stone-500 mr-1">Suggested:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                className="text-[11px] bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </form>

        {/* Ethical Safety Notice */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Safety & Ethical Boundary:</strong> Our AI Wellness Assistant provides evidence-informed dietary and lifestyle education. It strictly does not diagnose diseases or prescribe pharmaceutical drugs. Always consult a physician for acute clinical conditions.
          </span>
        </div>
      </Card>

      {/* Answers Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          Wellness Knowledge Base ({chatHistory.length})
        </h2>

        <div className="space-y-4">
          {chatHistory.map((item) => (
            <Card key={item.id} className="p-5 space-y-3 bg-white border-stone-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    Q
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm">{item.question}</h3>
                </div>
                {item.relatedTopic && (
                  <Badge variant="neutral" className="text-[10px] shrink-0">
                    {item.relatedTopic}
                  </Badge>
                )}
              </div>

              <div className="pl-8 text-xs text-stone-700 leading-relaxed space-y-2 border-l-2 border-emerald-200 ml-3">
                <p>{item.answer}</p>
                <span className="text-[10px] text-stone-400 block pt-1">
                  Verified by Sri Nutrition Knowledge Engine • Founder: Sangem Srivijayalaxmi (+91 7993367929)
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services.js';
import { Send, RotateCw, ShieldAlert, Heart, Calendar, ArrowRight, HelpCircle } from 'lucide-react';

const QUICK_COPING_PROMPTS = [
  { label: 'Anxiety Grounding', prompt: 'I feel extremely anxious and panicked. Can you help me cool down and focus using a square grounding exercise?' },
  { label: 'Academic Burnout', prompt: 'I am totally burned out by upcoming exams and stress. What physical relaxation techniques do you recommend?' },
  { label: 'Feelings of Solitude', prompt: 'I feel deeply lonely and disconnected from peers today. Could you give me comfort journaling prompts to express these heavy thoughts?' }
];

export default function AICompanion({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'aura',
      text: `### Hello, I am Nakama!\n\nI am your anonymous wellness companion, and I'm here to listen, support, and outline daily comfort exercises with you in absolute confidentiality.\n\nTell me, what are you carrying in your mind today? Or, if you prefer, you can click any of our quick coping prompts below to start structured calming relaxation lines!`
    }
  ]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null); // 'breathing' | null

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const textStr = textToSend || msgInput;
    if (!textStr.trim()) return;

    if (!textToSend) {
      setMsgInput('');
    }

    // Append user bubble
    setMessages(prev => [...prev, { sender: 'user', text: textStr }]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await api.askCompanion(textStr, chatHistory);
      
      setMessages(prev => [...prev, { sender: 'aura', text: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'aura', 
        text: `### Connection Timeout\n\nI could not connect to core companion lines right now, but please take a deep, slow breath with me. Be extremely kind to yourself.\n\n#### 🧘‍♀️ Instant Deep Breathing:\n- **Inhale** for 4 seconds...\n- **Hold** for 4 seconds...\n- **Exhale** for 4 seconds...\n\n*If you feel in severe crisis, please remember to click the emergency helpline numbers in the setting panels instantly.*` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8" id="ai-companion-root">
      
      {/* Left panel: Quick calming loops and breathing checks */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-850 p-6 border border-slate-800 rounded-3xl space-y-5">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold text-xs font-sans uppercase tracking-wider">
            Active Coping toolcards
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Click any prompt block below to instantly send a supportive coping scenario, triggers scan, or journaling instruction request to Nakama.
          </p>

          <div className="space-y-2.5 mt-2" id="coping-triggers">
            {QUICK_COPING_PROMPTS.map((cop, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(cop.prompt)}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl text-xs text-slate-300 font-medium transition-all block cursor-pointer"
              >
                <div className="text-teal-400 font-mono text-[10px] uppercase font-bold tracking-wider mb-1">
                  Topic: {cop.label}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed truncate">{cop.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Breathing loop helper */}
        <div className="bg-slate-850 p-6 border border-teal-500/10 rounded-3xl text-center space-y-4" id="breathing-circle-widget">
          <span className="text-2xl block">🧘‍♀️</span>
          <h4 className="font-sans font-semibold text-slate-200 text-xs uppercase tracking-wide">Dynamic Yoga Breathing Circle</h4>

          <div className="flex justify-center py-4">
            {/* Animated breathing dot wrapper */}
            {activeCycle ? (
              <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-400 flex items-center justify-center animate-pulse relative">
                <span className="font-mono text-[10px] text-teal-300 bold animate-bounce uppercase">
                  {activeCycle === 'inhale' && 'Inhale...'}
                  {activeCycle === 'hold' && 'Hold...'}
                  {activeCycle === 'exhale' && 'Exhale...'}
                </span>
                <span className="absolute inset-0 rounded-full border border-teal-400 animate-ping opacity-60" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                Offline
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveCycle('inhale');
                let count = 0;
                let intv = setInterval(() => {
                  count = (count + 1) % 3;
                  if (count === 0) setActiveCycle('inhale');
                  if (count === 1) setActiveCycle('hold');
                  if (count === 2) setActiveCycle('exhale');
                }, 4000);
                window._breathingIntv = intv;
              }}
              className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 text-[10px] font-bold rounded-xl cursor-pointer transition-colors"
            >
              Start Breathing Loop
            </button>
            <button
              onClick={() => {
                clearInterval(window._breathingIntv);
                setActiveCycle(null);
              }}
              className="py-2 px-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] rounded-xl cursor-pointer"
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: Core conversational bubble chat */}
      <div className="lg:col-span-2 bg-slate-850 border border-slate-800 rounded-3xl flex flex-col h-[600px] overflow-hidden" id="chat-bubble-panel">
        
        {/* Banner header info */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
              N
            </div>
            <div>
              <h4 className="font-sans font-semibold text-slate-200 text-sm">Nakama Companion</h4>
              <span className="text-[10px] text-slate-500 font-mono italic">Emotional security companion is ready</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-teal-400 bg-teal-500/15 border border-teal-500/20 px-2.5 py-1 rounded-full font-bold">Confidential</span>
        </div>

        {/* Chat message loops */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-900/45 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m, idx) => {
            const isAura = m.sender === 'aura';
            return (
              <div key={idx} className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`} id={`companion-msg-${idx}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isAura ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'bg-slate-850 text-slate-400'
                }`}>
                  {isAura ? 'N' : 'U'}
                </div>

                <div className={`space-y-1.5 max-w-[75%] ${m.sender === 'user' ? 'text-right' : ''}`}>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {isAura ? 'Nakama Guardian' : user?.username || 'Anonymous Seeker'}
                  </div>

                  <div className={`px-4 py-3 text-xs leading-relaxed rounded-2xl markdown-body text-left whitespace-pre-wrap ${
                    isAura 
                      ? 'bg-slate-850 border border-slate-800 text-slate-200 rounded-tl-none font-sans' 
                      : 'bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 font-semibold rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center text-teal-400 animate-spin text-xs font-bold">
                N
              </div>
              <div className="bg-slate-850 border border-slate-800 px-4 py-2 rounded-2xl rounded-tl-none max-w-sm text-xs italic text-slate-500 flex items-center gap-1">
                Nakama is listening attentively...
              </div>
            </div>
          )}
        </div>

        {/* Form line input */}
        <div className="bg-slate-900 p-4 border-t border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(null);
            }} 
            className="flex gap-3"
          >
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              className="flex-1 bg-slate-850 px-4 py-3.5 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-200 outline-none"
              placeholder="Ask questions, share concerns, or request coping strategies..."
              required
            />
            <button
              type="submit"
              className="px-5 py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 rounded-2xl text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4 fill-slate-900 shrink-0" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

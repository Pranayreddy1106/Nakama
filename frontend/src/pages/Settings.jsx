import React from 'react';
import { X } from 'lucide-react';

const HOTLINES = [
  { region: 'India (Kiran Helpline)', number: '1800-599-0019', notes: 'Govt Toll-free, 24/7' },
  { region: 'India (Vandrevala)', number: '+91 9999 666 555', notes: '24/7 distress support' },
  { region: 'India (AASRA)', number: '+91-9820466726', notes: 'Suicide prevention support' },
  { region: 'United States & Canada', number: '988 (Crisis Lifeline)', notes: 'Call or Text 24/7' },
  { region: 'Crisis Text Line', number: 'Text HOME to 741741', notes: 'Free support line' },
  { region: 'United Kingdom', number: '111 (NHS) / 116 123 (Samaritans)', notes: 'Free 24h checks' },
  { region: 'Australia', number: '13 11 14 (Lifeline)', notes: 'Support helpline' },
  { region: 'International Refuge', number: 'https://findahelpline.com', notes: 'Immediate regional advice directory' }
];

export default function Settings({ onClose }) {
  return (
    <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl max-w-lg w-full relative max-h-[90vh] flex flex-col mx-auto" id="crisis-helpline-page">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-rose-400 flex items-center gap-2 mb-3 pr-8">
        🚨 Crisis Hotlines (Anonymous support)
      </h3>
      
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        If you are going through severe distress or experiencing self-harm urges, please reach out to licensed professionals immediately. These helplines are completely anonymous, confidential, and active 24/7.
      </p>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-[50vh]" id="emergency-directory">
        {HOTLINES.map((hot, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">{hot.region}</span>
              <strong className="block text-xs text-rose-400 font-sans mt-0.5">{hot.number}</strong>
            </div>
            <span className="text-[10px] text-slate-400 font-mono italic shrink-0 text-right">{hot.notes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

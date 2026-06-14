import React from 'react';

export default function Footer({ onNavigate, onShowEmergency }) {
  return (
    <footer className="bg-slate-950 text-slate-500 py-6 text-center border-t border-slate-850 max-w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span>&copy; 2026 Nakama. Crafted anonymously for patient confidentiality.</span>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('landing')} className="hover:text-slate-300">Privacy Shield</button>
          <span>&bull;</span>
          <button onClick={onShowEmergency} className="hover:text-rose-400">Emergency Resources</button>
        </div>
      </div>
    </footer>
  );
}

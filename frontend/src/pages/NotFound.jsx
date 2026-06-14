import React from 'react';

export default function NotFound({ onNavigate }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
      <span className="text-4xl">🌫️</span>
      <h3 className="text-xl font-bold text-slate-200">Page Not Found</h3>
      <p className="text-xs text-slate-500 max-w-sm">
        The coordinates you requested do not point to any valid support haven within Nakama.
      </p>
      <button 
        onClick={() => onNavigate(localStorage.getItem('token') ? 'feed' : 'landing')}
        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs rounded-xl cursor-pointer transition-colors"
      >
        Return to Haven
      </button>
    </div>
  );
}

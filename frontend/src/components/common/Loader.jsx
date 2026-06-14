import React from 'react';

export default function Loader({ message = "Securing anonymity tunnels..." }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-mono text-xs text-teal-400">
      <div className="relative inline-block w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-slate-950 rounded-full" />
        <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="tracking-widest uppercase">{message}</span>
    </div>
  );
}

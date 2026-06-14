import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, id }) {
  if (!isOpen) return null;
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      id={id ? `${id}-backdrop` : undefined}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-850 border border-slate-800 p-6 rounded-3xl max-w-lg w-full relative max-h-[90vh] flex flex-col" 
        id={id}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-rose-400 flex items-center gap-2 mb-3 pr-8">
            {title}
          </h3>
        )}
        
        <div className="overflow-y-auto flex-1 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

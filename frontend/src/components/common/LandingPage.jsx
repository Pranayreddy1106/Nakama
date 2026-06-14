import React, { useState, useEffect } from 'react';
import { Heart, Shield, Users, ArrowRight, BookOpen, Flame, Smile } from 'lucide-react';
import { api } from '../../services.js';

export default function LandingPage({ onNavigate, user }) {
  const [stats, setStats] = useState({
    totalStories: null,
    totalWellnessJournals: null,
    totalSupportReplies: null,
    activeMembers: null,
    completedChallenges: null
  });

  useEffect(() => {
    api.getPublicStats()
      .then(res => {
        setStats(res);
      })
      .catch(() => {
        // quiet fallback
      });
  }, []);

  return (
    <div className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-16" id="landing-page-container">
      {/* Intro visual banner */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-medium tracking-wide">
          A private, credential-free emotional recovery circle
        </div>

        <h1 className="font-serif italic text-4xl sm:text-6xl text-slate-100 tracking-tight leading-[1.1]">
          Find honest support, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400 font-serif font-bold">
            without revealing who you are.
          </span>
        </h1>

        <p className="text-base text-slate-400 leading-relaxed">
          Welcome to Nakama, an anonymous shelter for peer support and daily emotional tracking. 
          Your real identity is never linked, stored, or visible. Connect with vetted support tags, 
          keep private gratitude logs, and work through comfort exercises with Nakama Assistant.
        </p>

        {/* CTA triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <button 
              onClick={() => onNavigate('feed')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 hover:opacity-95 text-slate-900 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer transition-all hover:translate-y-[-1px]"
            >
              Enter Support Feed <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-400 to-sky-400 hover:opacity-95 text-slate-900 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-400/15 cursor-pointer transition-all hover:translate-y-[-1px]"
              >
                Choose Anonymous Profile <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-750 font-semibold text-sm text-slate-200 rounded-2xl border border-slate-750 hover:border-slate-700 transition-all text-center cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Statistics Block */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 max-w-4xl mx-auto" id="dynamic-statistics">
        <h3 className="text-center text-[11px] uppercase tracking-widest text-slate-500 font-mono mb-8">
          Live Community Support Counter
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="block text-3xl font-bold text-slate-100 font-sans">
              {stats.activeMembers !== null ? stats.activeMembers : '0'}
            </span>
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider mt-1.5 font-mono">
              Anon Profiles
            </span>
          </div>
          <div className="border-r border-slate-800/80 hidden md:block h-10 self-center" />
          <div>
            <span className="block text-3xl font-bold text-teal-400 font-sans">
              {stats.totalStories !== null ? stats.totalStories : '0'}
            </span>
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider mt-1.5 font-mono">
              Stories Shared
            </span>
          </div>
          <div className="border-r border-slate-800/80 hidden md:block h-10 self-center" />
          <div>
            <span className="block text-3xl font-bold text-sky-400 font-sans">
              {stats.totalWellnessJournals !== null ? stats.totalWellnessJournals : '0'}
            </span>
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider mt-1.5 font-mono">
              Mood Check-ins
            </span>
          </div>
          <div className="border-r border-slate-800/80 hidden md:block h-10 self-center" />
          <div>
            <span className="block text-3xl font-bold text-emerald-400 font-sans">
              {stats.totalSupportReplies !== null ? stats.totalSupportReplies : '0'}
            </span>
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider mt-1.5 font-mono">
              Support Offered
            </span>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-850/60 border border-slate-800/85 p-6 rounded-3xl space-y-4">
          <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400 inline-block">
            <Shield className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-serif italic text-slate-200">Zero identity footprint</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your login details are encrypted, and we auto-generate arbitrary usernames for forum discussions. No real names, avatars, or social connection is allowed.
          </p>
        </div>

        <div className="bg-slate-850/60 border border-slate-800/85 p-6 rounded-3xl space-y-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 inline-block">
            <Heart className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-serif italic text-slate-200">Peer-to-Peer matches</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Join custom chat rooms based on shared concerns—whether relationship stress, anxiety support, or academic pressure. Talk with people who get it.
          </p>
        </div>

        <div className="bg-slate-850/60 border border-slate-800/85 p-6 rounded-3xl space-y-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 inline-block">
            <Smile className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-serif italic text-slate-200">Positive accountability</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Participate in structured habit challenges and check in daily to build healthy sleep, hydration, and mindfulness streaks. Earn support badges.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { Heart, AlertCircle, CheckCircle2, RotateCw, Quote, ArrowRight } from 'lucide-react';

export default function GratitudeWall({ user, onUpdatePoints }) {
  const [gratitudes, setGratitudes] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // Status Alerts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGratitudes();
  }, []);

  const fetchGratitudes = async () => {
    setLoading(true);
    try {
      const list = await api.getGratitudes();
      setGratitudes(list);
    } catch (err) {
      setError('Could not query gratitude wall posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setError('');
    setSuccess('');
    setPosting(true);

    try {
      const added = await api.createGratitude(newContent);
      setSuccess('Daily positivity shared on the wall! +20 points and "Gratitude Champion" badge unlocked!');
      setNewContent('');

      // Instantly award points if user state is listening
      if (user) {
        onUpdatePoints(user.points + 20);
      }

      await fetchGratitudes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Possibility of duplicate postings. Come back tomorrow!');
    } finally {
      setPosting(false);
    }
  };

  const handleSupportToggle = async (id) => {
    try {
      const updated = await api.supportGratitude(id);
      setGratitudes(prev => prev.map(item => item.id === id ? { ...item, supportCount: updated.supportCount, supportedBy: updated.supportedBy } : item));
    } catch (err) {
      setError('Support trigger fails.');
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8" id="gratitude-wall-container">
      {/* Header section with quote card */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-semibold mb-3 tracking-wide">
          <Quote className="w-3.5 h-3.5 fill-yellow-400/20" />
          The Gratitude Wall
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-100 font-sans">
          One positive highlight at a time
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-2 max-w-lg mx-auto">
          Writing down one thing you are grateful for each day is proven to reduce stress. Express positive vibes, appreciate peers, and lift overall spirits. 
        </p>
      </div>

      {/* Status prompts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md mx-auto">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Share highlight Form (limited to once daily per user) */}
      <div className="max-w-xl mx-auto bg-slate-850 p-6 border border-slate-800 rounded-3xl" id="write-gratitude">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl pt-1">🌸</span>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-200 outline-none h-20 resize-none"
              placeholder="What is one positive highlight, achievement of yours, or supportive appreciation message you hold today?"
              required
              maxLength="300"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Only one positivity card allowed daily &bull; {newContent.length}/300</span>
            <button
              type="submit"
              disabled={posting || !newContent.trim()}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-all"
              id="gratitude-submit"
            >
              Share highlight <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Wall cards bento loop */}
      {loading && gratitudes.length === 0 ? (
        <div className="text-center py-12">
          <RotateCw className="w-7 h-7 text-yellow-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">polishing the gratitude mosaic...</p>
        </div>
      ) : gratitudes.length === 0 ? (
        <div className="text-center py-16 bg-slate-850/30 border border-slate-800 rounded-3xl max-w-xl mx-auto">
          <span className="text-3xl block mb-2">🌿</span>
          <p className="text-xs text-slate-500">Nothing has been pinned to the wall yet today. Be the first to post a highlight!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" id="gratitude-cards-grid">
          {gratitudes.map(item => {
            const hasSupported = (item.supportedBy || []).includes(user?.id);
            return (
              <div 
                key={item.id} 
                className="bg-slate-850 border border-slate-800/80 p-5 rounded-3xl relative flex flex-col justify-between"
                id={`gratitudecard-${item.id}`}
              >
                {/* flower watermark icon background */}
                <div className="absolute top-4 right-4 text-xs font-mono text-slate-700/40 font-bold select-none">
                  🌻
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.avatarSeed || 'Default'}`} 
                      alt="anon" 
                      className="w-5.5 h-5.5 bg-slate-800 rounded-full border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-mono text-[10px] font-semibold text-slate-400">{item.username || 'Anonymous'}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                    "{item.content}"
                  </p>
                </div>

                <div className="border-t border-slate-850 mt-4 pt-3 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  
                  {/* Heart reaction button */}
                  <button
                    onClick={() => handleSupportToggle(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                      hasSupported ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                    id={`btn-like-gratitude-${item.id}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasSupported ? 'fill-rose-400' : ''}`} />
                    <span>Send Warmth ({item.supportCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

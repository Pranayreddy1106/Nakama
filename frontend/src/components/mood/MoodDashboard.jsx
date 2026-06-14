import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { 
  Smile, Heart, Activity, Calendar, AlertCircle, CheckCircle2, RotateCw, BookOpen, Trash2 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';

const MOOD_TYPES = [
  { id: 'Happy', emoji: '😊', scale: 5, color: '#10b981', desc: 'Feeling joyful and positive' },
  { id: 'Calm', emoji: '😌', scale: 4.5, color: '#14b8a6', desc: 'Peaceful, relaxed, and stable' },
  { id: 'Neutral', emoji: '😐', scale: 3, color: '#94a3b8', desc: 'Slightly okay, in-between' },
  { id: 'Stressed', emoji: '😫', scale: 2, color: '#f59e0b', desc: 'Overwhelmed by pressures' },
  { id: 'Anxious', emoji: '😰', scale: 2, color: '#c084fc', desc: 'Worried, fearful, or racing thoughts' },
  { id: 'Sad', emoji: '😢', scale: 1.5, color: '#38bdf8', desc: 'Feeling down, heavy, or sensitive' },
  { id: 'Angry', emoji: '😠', scale: 1, color: '#ef4444', desc: 'Irritable, frustrated, or tense' },
  { id: 'Lonely', emoji: '🥺', scale: 1.5, color: '#ec4899', desc: 'Disconnected from others' }
];

export default function MoodDashboard({ user, onUpdatePoints }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // Logging Form State
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [journalNote, setJournalNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const list = await api.getMoodEntries();
      setEntries(list);
    } catch (err) {
      setErrorMsg('Could not fetch mood history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.checkInMood(selectedMood, journalNote, selectedDate);
      setSuccessMsg(data.message);
      setJournalNote('');
      
      // Update local points if user is returned
      if (data.points) {
        onUpdatePoints(data.points);
      }

      await fetchEntries();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while logging mood');
    }
  };

  const handleFetchInsights = async () => {
    setInsightLoading(true);
    setAiInsight('');
    setErrorMsg('');

    try {
      const data = await api.getMoodInsights();
      setAiInsight(data.summary || data.insight || 'No advice could be compiled.');
    } catch (err) {
      setErrorMsg('Could not generate therapeutic AI insights. Check back after adding a few more check-ins.');
    } finally {
      setInsightLoading(false);
    }
  };

  // Prepare chart datasets
  // 1. Line Trend: Map last 7 logs chronologically
  const prepareTrendData = () => {
    const listCopy = [...entries];
    // Sort oldest first for chronological line
    listCopy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Slice to last 7 check-ins
    const last7 = listCopy.slice(-7);
    
    return last7.map(item => {
      const mDef = MOOD_TYPES.find(m => m.id === item.mood) || { scale: 3 };
      return {
        date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        energy: mDef.scale,
        mood: item.mood,
        note: item.note || ''
      };
    });
  };

  // 2. Emotion frequency breakdown
  const prepareFrequencyData = () => {
    const freq = {};
    entries.forEach(item => {
      freq[item.mood] = (freq[item.mood] || 0) + 1;
    });

    return Object.keys(freq).map(mood => {
      const mDef = MOOD_TYPES.find(m => m.id === mood) || { color: '#ffffff' };
      return {
        name: mood,
        value: freq[mood],
        color: mDef.color
      };
    });
  };

  const trendData = prepareTrendData();
  const freqData = prepareFrequencyData();

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8" id="mood-dashboard-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-400" />
            Mood Tracker & Wellness Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Check-in daily, record private emotional journal logs, and track recovery trend lines.
          </p>
        </div>

        {/* Streak Multiplier */}
        <div className="bg-gradient-to-r from-slate-900 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-4 text-center shrink-0">
          <div className="text-left">
            <span className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase">Mood streak multiplier</span>
            <span className="block text-sm font-semibold text-slate-200">🔥 {user.moodStreak || 0} Streak days</span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Left Logging Form | Right Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Emotion Logger Form */}
        <div className="lg:col-span-1 bg-slate-850/80 border border-slate-800 p-6 rounded-3xl space-y-6" id="mood-logger-card">
          <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">Log Your Current Feeling</h3>
          
          <form onSubmit={handleLogSubmit} className="space-y-6">
            {/* Grid display of emoji buttons */}
            <div>
              <span className="block text-xs font-medium text-slate-300 mb-3 font-sans">Choose matching emotion tag:</span>
              <div className="grid grid-cols-4 gap-2">
                {MOOD_TYPES.map(mood => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedMood === mood.id 
                        ? 'bg-slate-900 border-teal-500/80 shadow-md shadow-teal-500/5 shadow-inner' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                    title={mood.desc}
                    id={`moodbtn-${mood.id}`}
                  >
                    <span className="text-lg block">{mood.emoji}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-400 block truncate max-w-full leading-none">{mood.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date input (defaults to today) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">Date Selection</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-300 outline-none"
                  required
                />
              </div>
            </div>

            {/* Journal Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">Private Journal Highlight</label>
              <textarea
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-300 h-28 resize-none outline-none"
                placeholder="How are you dealing with your thoughts today? Key challenges, actions, or progress... (Stored privately in your vault)"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 font-semibold text-xs text-slate-900 rounded-2xl hover:opacity-90 transition-opacity text-center cursor-pointer block"
              id="mood-submit-btn"
            >
              Verify Check-In (+15 pts)
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Charts Panel */}
        <div className="lg:col-span-2 space-y-6" id="mood-analytics-panel">
          
          {/* Chart Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Week Trend line */}
            <div className="bg-slate-850/80 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">Weekly Mood Trend</h3>
              {trendData.length < 2 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs">
                  <Activity className="w-8 h-8 mb-2 stroke-1" />
                  Please complete at least 2 check-ins to generate local trend charts.
                </div>
              ) : (
                <div className="h-60" style={{ minWidth: 0 }} id="weekly-trend-chart">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                        labelStyle={{ fontStyle: 'bold', fontSize: '11px', color: '#f1f5f9' }}
                      />
                      <Line type="smooth" dataKey="energy" stroke="#14b8a6" strokeWidth={3} strokeLinecap="round" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Frequency Pie representation */}
            <div className="bg-slate-850/80 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">Feeling Breakdown</h3>
              {freqData.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs">
                  <Smile className="w-8 h-8 mb-2 stroke-1" />
                  Your feeling aggregation will render here as you log.
                </div>
              ) : (
                <div className="h-60" style={{ minWidth: 0 }} id="feeling-pie-chart">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={freqData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {freqData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* AI Therapeutics and Weekly Advice Insights block */}
          <div className="bg-slate-850/85 border border-teal-500/10 p-6 rounded-3xl relative overflow-hidden" id="insights-panel">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
              <div className="flex items-center gap-2">
                <div>
                  <h4 className="font-sans font-semibold text-slate-200 text-sm">Nakama AI Therapeutic Journal Checker</h4>
                  <p className="text-[10px] text-slate-400">Scans recent journals to reveal coping summaries and advice tags.</p>
                </div>
              </div>

              <button
                onClick={handleFetchInsights}
                disabled={insightLoading || entries.length === 0}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-teal-400 hover:text-teal-400 text-slate-300 font-mono font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {insightLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : 'Compile Advice'}
              </button>
            </div>

            {aiInsight ? (
              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-4 border border-slate-800 rounded-2xl whitespace-pre-wrap max-h-80 overflow-y-auto">
                {aiInsight}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Add your first custom check-in notes to trigger the AI weekly insights compiler.</p>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 italic">Click "Compile Advice" above to analyze your mood journals securely.</p>
            )}
          </div>

          {/* Historical text journals list */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Private Journal Logs Entries
            </h3>
            
            {entries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Your private journal entries will be listed chronologically here.</p>
            ) : (
              <div className="space-y-3.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {[...entries].reverse().map(item => {
                  const mDef = MOOD_TYPES.find(m => m.id === item.mood) || { emoji: '😐', color: '#94a3b8' };
                  return (
                    <div key={item.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg bg-slate-850 p-1.5 rounded-xl block shrink-0">{mDef.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-200">{item.mood}</span>
                            <span className="text-slate-500 text-[10px]">&bull; {new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap pl-0.5">{item.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

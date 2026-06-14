import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { Flame, AlertCircle, CheckCircle2, RotateCw, Trophy, Target, Play } from 'lucide-react';

export default function Challenges({ user, onUpdatePoints }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Prompts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getChallenges();
      setChallenges(data);
    } catch (err) {
      setError('Could not query active habits challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.joinChallenge(challengeId);
      setSuccess(res.message);
      await fetchChallenges();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error joining challenge');
    }
  };

  const handleCheckIn = async (userChallengeId) => {
    setError('');
    setSuccess('');
    setUpdatingId(userChallengeId);
    try {
      const res = await api.updateChallengeProgress(userChallengeId);
      setSuccess(res.message);
      if (res.pointsEarned) {
        onUpdatePoints(user.points + res.pointsEarned);
      }
      await fetchChallenges();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8" id="challenges-screen">
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-semibold mb-3 tracking-wide">
          <Trophy className="w-3.5 h-3.5 text-teal-400" />
          Wellness & Habits Challenges
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-100 font-sans">
          Build positive habits together
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-2 max-w-lg mx-auto">
          Choose a support path, complete your daily habit checking sequences, and win custom profile badges after full completion. Keep your streaks active!
        </p>
      </div>

      {/* Prompts info boxes */}
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

      {loading && challenges.length === 0 ? (
        <div className="text-center py-12">
          <RotateCw className="w-7 h-7 text-teal-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Syncing wellness databases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" id="challenges-bento">
          {challenges.map(challenge => {
            const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.days) * 100));
            const isCompleted = challenge.status === 'completed';

            return (
              <div 
                key={challenge.id}
                className={`bg-slate-850 border rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden transition-all ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-gradient-to-br from-slate-850 to-emerald-950/15'
                    : challenge.joined
                    ? 'border-teal-500/20 bg-slate-850'
                    : 'border-slate-800'
                }`}
                id={`challengecard-${challenge.id}`}
              >
                {/* completion stamp */}
                {isCompleted && (
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/25 rounded-full blur-xl" />
                )}

                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="text-2xl">{challenge.icon || '🎯'}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      🎁 +{challenge.points} pts
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-100 mb-2 leading-snug font-sans truncate">{challenge.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{challenge.description}</p>
                </div>

                {/* Progress bar info */}
                <div className="mt-4 pt-4 border-t border-slate-850">
                  {challenge.joined ? (
                    <div className="space-y-4">
                      {/* Stat summary */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-teal-400">Streak: {challenge.progress} / {challenge.days} days</span>
                        <span>{progressPercent}% Done</span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-teal-500 to-sky-500'
                          }`} 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Action trigger button */}
                      {isCompleted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-2xl flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-medium font-sans">
                          <CheckCircle2 className="w-4 h-4" /> Locked Badges Unlocked!
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(challenge.userChallengeId)}
                          disabled={updatingId === challenge.userChallengeId}
                          className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-teal-400 text-teal-400 hover:bg-slate-850 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                          id={`btn-checkin-${challenge.id}`}
                        >
                          {updatingId === challenge.userChallengeId ? (
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Flame className="w-4 h-4 text-orange-400 fill-orange-400/10" />
                              Submit Daily Check-In (+10 pts)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(challenge.id)}
                      className="w-full py-2.5 bg-teal-500 text-slate-900 hover:opacity-90 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      id={`btn-join-${challenge.id}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-900 shrink-0" /> Let's Start Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

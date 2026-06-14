import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { Award, Shield, FileText, MessageSquare, Flame, CheckCircle2, AlertCircle, RotateCw, Trash2, Heart, HeartOff } from 'lucide-react';

const BADGES_INFO = [
  { name: 'First Step', emoji: '🌱', desc: 'Began your anonymous mental wellness recovery with Nakama.', color: 'from-amber-400 to-orange-400' },
  { name: 'First Post', emoji: '✍️', desc: 'Shared your first supportive post on the forum.', color: 'from-blue-400 to-sky-400' },
  { name: 'First Comment', emoji: '💬', desc: 'Offered encouragement or advice to another member.', color: 'from-purple-400 to-indigo-400' },
  { name: 'Helpful Member', emoji: '🎗️', desc: 'Earned 20+ points from supportive activities.', color: 'from-emerald-400 to-teal-400' },
  { name: 'Supportive Listener', emoji: '👂', desc: 'Offered positive feedback on 5+ other members\' posts.', color: 'from-rose-400 to-pink-400' },
  { name: 'Gratitude Champion', emoji: '🌸', desc: 'Shared Positivity Highlights on the Community Gratitude Wall.', color: 'from-yellow-400 to-amber-400' },
  { name: '3-Day Streak', emoji: '🔥', desc: 'Completed a 3-day continuous mood tracking streak.', color: 'from-orange-500 to-red-500' },
  { name: '7-Day Streak', emoji: '⚡', desc: 'Completed a 7-day solid mood tracking or journaling streak.', color: 'from-amber-500 to-yellow-500' },
  { name: '14-Day Streak', emoji: '⭐', desc: 'Completed a 14-day continuous mood tracking streak.', color: 'from-teal-500 to-emerald-500' },
  { name: '30-Day Streak', emoji: '🏆', desc: 'Maintained mood tracking or journals for 30 consecutive days.', color: 'from-violet-500 to-fuchsia-500' },
  { name: 'Self-Reflection', emoji: '📖', desc: 'Logged 3+ wellness journals inside the trackers.', color: 'from-blue-500 to-indigo-500' },
  { name: 'Zen Master', emoji: '🧘', desc: 'Completed at least 5 Community Challenges.', color: 'from-teal-400 to-emerald-400' },
  { name: 'Peer Helper', emoji: '🤝', desc: 'Offered 5+ supportive peer comment replies.', color: 'from-sky-400 to-blue-400' },
  { name: 'positivity spreader', emoji: '☀️', desc: 'Shared 3+ gratitudes on the Positivity Wall.', color: 'from-yellow-400 to-orange-400' }
];

export default function UserProfile({ user, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [allComments, setAllComments] = useState([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProfile();
      const userObj = data.user ? data.user : data;
      setProfile({
        ...data,
        user: {
          ...userObj,
          avatarSeed: userObj.avatarSeed || userObj.username || 'defaultAnon'
        }
      });
      if (data.allPosts) setAllPosts(data.allPosts);
      if (data.allComments) setAllComments(data.allComments);
    } catch (err) {
      setError('Could not query secure profile metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setAllComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="text-center py-20">
        <RotateCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400 font-mono">Unlocking secure coordinates profile...</p>
      </div>
    );
  }

  const userBadgesList = profile.user.badges || [];

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto space-y-8" id="profile-sheet-view">
      
      {/* Top Identity banner */}
      <div className="bg-slate-850/80 border border-slate-800 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6" id="profile-hero-banner">
        <img 
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.user.avatarSeed}`} 
          alt="Avatar" 
          className="w-20 h-20 bg-slate-900 border-2 border-teal-500 rounded-full p-1 shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="text-center sm:text-left space-y-2 flex-1">
          <div>
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full">
              Anonymity Shield On
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100 font-sans">{profile.user.username}</h2>
          <p className="text-xs text-slate-400 font-mono">Email coordinated: <strong className="text-slate-300">{profile.user.email} (invisible to peers)</strong> &nbsp;&bull;&nbsp; Joined: {new Date(profile.user.joinDate).toLocaleDateString()}</p>
        </div>

        {/* Total Points bubble */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-center shrink-0 w-full sm:w-auto">
          <span className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase">Vault coordinates points</span>
          <span className="block text-2xl font-bold text-teal-400">{profile.user.points} pts</span>
        </div>
      </div>

      {/* Grid counters */}
      {!profile.user.isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="accounting-counters">
          <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-center">
            <span className="block text-xl font-bold text-slate-200">{profile.postsCount}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Anon Stories</span>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-center">
            <span className="block text-xl font-bold text-slate-200">{profile.commentsCount}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Written Replies</span>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-center">
            <span className="block text-xl font-bold text-orange-400">🔥 {profile.user.moodStreak}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Checkin Streak</span>
          </div>

          <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-center">
            <span className="block text-xl font-bold text-teal-400">{userBadgesList.length}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Badges Unlocked</span>
          </div>
        </div>
      )}

      {/* Badges sheets list */}
      {!profile.user.isAdmin && (
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl space-y-4" id="badges-chest">
          <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-400" />
            Secure unlocked badges ({userBadgesList.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BADGES_INFO.map(badge => {
              const isUnlocked = userBadgesList.some(b => b.toLowerCase() === badge.name.toLowerCase());

              return (
                <div 
                  key={badge.name}
                  className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
                    isUnlocked 
                      ? 'bg-slate-900 border-teal-500/25'
                      : 'bg-slate-900/40 border-slate-900 opacity-40'
                  }`}
                >
                  <span className="text-3xl block shrink-0 bg-slate-850 p-2 rounded-xl">{badge.emoji}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                      {badge.name} {isUnlocked ? '🔓' : '🔒'}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookmarked / Saved posts */}
      {!profile.user.isAdmin && (
        <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl space-y-4" id="bookmarks-chest">
          <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            🔖 Bookmarked Saved posts ({profile.savedPosts?.length || 0})
          </h3>

          {(!profile.savedPosts || profile.savedPosts.length === 0) ? (
            <p className="text-xs text-slate-500 italic text-center py-6">Bookmarks are empty. Browse support feeds to save favorite resources/stories!</p>
          ) : (
            <div className="space-y-3">
              {profile.savedPosts.map(sav => (
                <div 
                  key={sav.id}
                  onClick={() => onNavigate(`feed:${sav.id}`)}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-md font-sans mr-2 inline-block font-semibold">
                      {sav.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 font-sans">{sav.title}</span>
                  </div>
                  <span className="text-teal-400 text-xs font-mono">&rarr; Open</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Moderation Panel: Delete any post or comment */}
      {profile.user.isAdmin && (
        <div className="space-y-6 pt-4" id="admin-moderation-panel">
          <div className="bg-slate-850 border border-red-500/20 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-mono font-bold text-red-400 tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Developer Administration &mdash; Moderation Console: All Active Forum Posts ({allPosts.length})
            </h3>
            
            {allPosts.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No active posts present in system index.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {allPosts.map(p => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] uppercase font-mono bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-md font-semibold border border-red-500/20">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">By: {p.username || 'Anonymous'}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{p.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.content}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeletePost(p.id)}
                      className="p-2 sm:p-2.5 bg-red-950/45 hover:bg-red-900/30 border border-red-900/30 text-red-400 rounded-xl transition-all cursor-pointer hover:scale-105 shrink-0"
                      title="Instantly Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-850 border border-red-500/20 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-mono font-bold text-red-400 tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Developer Administration &mdash; Moderation Console: All Discussion Replies ({allComments.length})
            </h3>
            
            {allComments.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No replies compiled in standard comments collection.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {allComments.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-red-400">Discussion reply</span>
                        <span className="text-[10px] text-slate-500 font-mono">By: {c.username}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{c.content}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteComment(c.id)}
                      className="p-2 sm:p-2.5 bg-red-950/45 hover:bg-red-900/30 border border-red-900/30 text-red-400 rounded-xl transition-all cursor-pointer hover:scale-105 shrink-0"
                      title="Instantly Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

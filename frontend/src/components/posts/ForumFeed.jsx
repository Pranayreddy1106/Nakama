import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { 
  PlusCircle, Search, Heart, MessageSquare, Bookmark, AlertCircle, 
  HelpCircle, MoreHorizontal, MessageCircle, ChevronRight, CornerDownRight, X, ArrowLeft, Send, CheckCircle2, RotateCw, Trash2
} from 'lucide-react';

const CATEGORIES = [
  'Anxiety', 'Depression', 'Stress', 'Academic Pressure', 'Career Concerns', 
  'Relationships', 'Family Issues', 'Social Anxiety', 'Self Improvement', 'General Support'
];

const MOODS = ['Happy', 'Calm', 'Neutral', 'Stressed', 'Anxious', 'Sad', 'Angry', 'Lonely'];

export default function ForumFeed({ user, onNavigate, onShowPostId }) {
  // Navigation inside Feed
  const [activeTab, setActiveTab] = useState('feed_list'); // 'feed_list' | 'create_post' | 'post_details'
  const [selectedPostId, setSelectedPostId] = useState(onShowPostId || null);

  // Filters state
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // New Post Form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('General Support');
  const [postMood, setPostMood] = useState('Neutral');
  const [postAnonymous, setPostAnonymous] = useState(true);
  const [postingLoading, setPostingLoading] = useState(false);

  // AI Assistant Analysis State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiCrisisTriggered, setAiCrisisTriggered] = useState(false);

  // Post Details state
  const [postDetail, setPostDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Global Info alerts
  const [feedSuccess, setFeedSuccess] = useState('');
  const [feedError, setFeedError] = useState('');

  // Fetch Post items on change
  useEffect(() => {
    if (activeTab === 'feed_list') {
      fetchPosts(true);
    }
  }, [selectedCategory, selectedMood, selectedSort, activeTab]);

  useEffect(() => {
    if (onShowPostId) {
      setSelectedPostId(onShowPostId);
      setActiveTab('post_details');
    }
  }, [onShowPostId]);

  useEffect(() => {
    if (selectedPostId && activeTab === 'post_details') {
      fetchPostDetails(selectedPostId);
    }
  }, [selectedPostId, activeTab]);

  const fetchPosts = async (reset = false) => {
    setLoading(true);
    try {
      const currentSkip = reset ? 0 : skip;
      const data = await api.getAllPosts({
        category: selectedCategory,
        mood: selectedMood,
        search,
        sort: selectedSort,
        skip: currentSkip,
        limit: 10
      });

      if (reset) {
        setPosts(data.posts);
        setSkip(10);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
        setSkip(prev => prev + 10);
      }
      setTotalPosts(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      setFeedError(err.message || 'Could not fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts(true);
  };

  const fetchPostDetails = async (id) => {
    try {
      const post = await api.getPostById(id);
      setPostDetail(post);
      const coms = await api.getCommentsByPost(id);
      setComments(coms);
    } catch (err) {
      setFeedError('Could not load discussion detail sheet');
    }
  };

  // AI text evaluation
  const handleAnalyzeAI = async () => {
    if (!postContent) {
      setFeedError('Please insert content in the emotional support draft before evaluating.');
      return;
    }
    setAiAnalyzing(true);
    setAiFeedback(null);
    setAiCrisisTriggered(false);
    setFeedError('');

    try {
      const res = await api.analyzePostAI(postTitle, postContent);
      setAiFeedback(res);
      if (res.isCrisis) {
        setAiCrisisTriggered(true);
      }
    } catch (err) {
      setFeedError('Could not connect to Nakama AI Companion models. Please evaluate again later.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiFeedback) {
      if (aiFeedback.recommendedCategory) setPostCategory(aiFeedback.recommendedCategory);
      if (aiFeedback.suggestedTag) setPostMood(aiFeedback.suggestedTag);
      setFeedSuccess('Nakama AI recommendations successfully applied to parameters!');
      setTimeout(() => setFeedSuccess(''), 2500);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    setPostingLoading(true);
    try {
      await api.createPost({
        title: postTitle,
        content: postContent,
        category: postCategory,
        moodTag: postMood,
        anonymous: postAnonymous
      });

      // Clear stats
      setPostTitle('');
      setPostContent('');
      setAiFeedback(null);
      setAiCrisisTriggered(false);
      setFeedSuccess('Post published successfully. Points awarded!');
      setActiveTab('feed_list');
      setTimeout(() => setFeedSuccess(''), 3000);
    } catch (err) {
      setFeedError(err.message || 'Could not post core files');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleSupportToggle = async (id, isFromDetail = false) => {
    try {
      const updated = await api.toggleSupport(id);
      
      // Update in local state list
      setPosts(prev => prev.map(p => p.id === id ? { ...p, supportCount: updated.supportCount, supportedBy: updated.supportedBy } : p));
      
      if (isFromDetail && postDetail) {
        setPostDetail(prev => ({ ...prev, supportCount: updated.supportCount, supportedBy: updated.supportedBy }));
      }
    } catch (err) {
      setFeedError('Error toggling support count');
    }
  };

  const handleBookmarkToggle = async (id, isFromDetail = false) => {
    try {
      const updated = await api.toggleSave(id);
      setFeedSuccess(updated.message);
      // update user bookmark references in user session later if needed
      setTimeout(() => setFeedSuccess(''), 2500);
    } catch (err) {
      setFeedError('Bookmark updates failed');
    }
  };

  const handleReportAction = async (id) => {
    try {
      await api.reportPost(id, 'Inappropriate review requested');
      setFeedSuccess('Post reported for Admin moderator inspection. Thank you for keeping this forum safe.');
      setTimeout(() => setFeedSuccess(''), 3000);
    } catch (err) {
      setFeedError('Could not process report ticket');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.createComment(postDetail.id, commentText);
      setCommentText('');
      setFeedSuccess('Comment uploaded! +5 pts granted.');
      await fetchPostDetails(postDetail.id);
      setTimeout(() => setFeedSuccess(''), 2500);
    } catch (err) {
      setFeedError('Commenting fails');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await api.replyToComment(commentId, replyText);
      setReplyText('');
      setActiveReplyId(null);
      await fetchPostDetails(postDetail.id);
    } catch (err) {
      setFeedError('Reply upload failed');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post permanently?')) return;
    try {
      await api.deletePost(postId);
      setFeedSuccess('Post deleted successfully');
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (postDetail && postDetail.id === postId) {
        setPostDetail(null);
        setActiveTab('feed_list');
      }
      setTimeout(() => setFeedSuccess(''), 2500);
    } catch (err) {
      setFeedError(err.message || 'Could not delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      setFeedSuccess('Comment deleted successfully');
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (postDetail) {
        setPostDetail(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) }));
      }
      setTimeout(() => setFeedSuccess(''), 2500);
    } catch (err) {
      setFeedError(err.message || 'Could not delete comment');
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto" id="feed-root-screen">
      {/* Global Safety Alert Banner */}
      {aiCrisisTriggered && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs" id="emergency-banner">
          <AlertCircle className="w-8 h-8 text-rose-400 shrink-0 mt-1 md:mt-0" />
          <div className="flex-1">
            <h4 className="font-sans font-bold text-slate-100 text-sm mb-1 uppercase tracking-wider">Help is Standing By Anonymously</h4>
            <p className="text-slate-300 leading-relaxed">
              If you or someone you know is going through suicidal thoughts or extreme distress, support is ready 24/7. Real people are there to listen without judgment.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="bg-rose-500 text-slate-900 px-3 py-1 font-mono font-bold rounded-lg">Call or Text: 988 (National Lifeline)</span>
              <span className="bg-slate-800 text-slate-200 px-3 py-1 font-mono rounded-lg">Crisis Text Line: Text HOME to 741741</span>
            </div>
          </div>
        </div>
      )}

      {/* Global success / failures */}
      {feedError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{feedError}</span>
          <button onClick={() => setFeedError('')} className="ml-auto text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {feedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-6 text-xs flex gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedSuccess}</span>
          <button onClick={() => setFeedSuccess('')} className="ml-auto text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 1: DISCUSSIONS GRID LIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'feed_list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters column (Desktop Left rail) */}
          <div className="lg:col-span-1 space-y-6">
            <button 
              onClick={() => setActiveTab('create_post')}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 hover:opacity-90 transition-opacity font-semibold text-sm text-slate-900 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
              id="compose-post"
            >
              <PlusCircle className="w-4 h-4" /> Share Anonymous Story
            </button>

            {/* Category selection */}
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5">
              <h3 className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-4 font-bold">Channels</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                <button 
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                    selectedCategory === '' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  id="category-all"
                >
                  <span>All Supports</span>
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                      selectedCategory === cat ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                    id={`category-${cat}`}
                  >
                    <span># {cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood selection list */}
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5">
              <h3 className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-4 font-bold">Filter Mood</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedMood('')}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-mono ${
                    selectedMood === '' ? 'bg-sky-500/10 border border-sky-400 text-sky-400 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  id="mood-all"
                >
                  All
                </button>
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-mono ${
                      selectedMood === mood ? 'bg-teal-500/10 border-teal-400 text-teal-400 font-semibold border' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    id={`mood-${mood}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Feed list rail */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Search bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-850 border border-slate-800 p-4 rounded-3xl">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-200 outline-none"
                  placeholder="Query titles or keywords..."
                />
              </form>

              {/* Sorting filters */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Sort:</span>
                <select 
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="supported">Most supported</option>
                  <option value="discussed">Most discussed</option>
                </select>
              </div>
            </div>

            {/* List of Cards */}
            {loading && posts.length === 0 ? (
              <div className="text-center py-12 bg-slate-850/40 border border-slate-800 rounded-3xl">
                <RotateCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading secure forum database logs...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-slate-850/40 border border-slate-800 rounded-3xl">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-300 text-sm mb-1">Vault empty</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">None of our supportive anon topics seem to match your active filters. Relax or post a new story!</p>
              </div>
            ) : (
              <div className="space-y-4" id="cards-grid">
                {posts.map(post => {
                  const isSupported = (post.supportedBy || []).includes(user?.id);
                  return (
                    <div 
                      key={post.id}
                      className="bg-slate-850/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-800/80 p-6 rounded-3xl transition-all"
                      id={`postcard-${post.id}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.avatarSeed || 'Default'}`} 
                            alt="anon" 
                            className="w-6 h-6 rounded-full bg-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-semibold text-slate-300">{post.username || 'Anonymous'}</span>
                            <span className="text-[10px] text-slate-500 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wider">{post.moodTag}</span>
                          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/10 px-2.5 py-0.5 rounded-md font-sans text-[9px] font-medium">{post.category}</span>
                        </div>
                      </div>

                      {/* Content clickable to detail */}
                      <div onClick={() => { setSelectedPostId(post.id); setActiveTab('post_details'); }} className="cursor-pointer group mb-5">
                        <h4 className="text-base font-serif font-semibold text-slate-200 group-hover:text-teal-400 transition-colors tracking-tight mb-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-slate-800/65 pt-4 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-4">
                          {/* Support Action button */}
                          <button 
                            onClick={() => handleSupportToggle(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 rounded-xl transition-colors ${
                              isSupported ? 'text-teal-400 bg-teal-500/5' : 'hover:text-slate-200'
                            }`}
                            id={`btn-support-${post.id}`}
                          >
                            <Heart className={`w-4 h-4 ${isSupported ? 'fill-teal-400' : ''}`} />
                            <span>Offer Support ({post.supportCount || 0})</span>
                          </button>

                          {/* Talk details */}
                          <button 
                            onClick={() => { setSelectedPostId(post.id); setActiveTab('post_details'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 rounded-xl hover:text-slate-200"
                            id={`btn-comments-${post.id}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Discuss ({post.commentCount || 0})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {(post.user === user?.id || user?.isAdmin) && (
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-rose-450 text-slate-500"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleBookmarkToggle(post.id)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-slate-200"
                            title="Bookmark"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReportAction(post.id)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-rose-400"
                            title="Report InappropriateContent"
                          >
                            <AlertCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <button 
                    onClick={() => fetchPosts(false)}
                    className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-teal-400 border border-slate-800 rounded-2xl transition-colors cursor-pointer"
                  >
                    View older entries
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 2: CREATE POST WITH AI INTEGRATIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'create_post' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="compose-container">
          <div className="lg:col-span-2 bg-slate-850/80 border border-slate-800 p-8 rounded-3xl">
            <div className="flex items-center gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('feed_list')}
                className="p-2 hover:bg-slate-850 rounded-xl text-slate-400"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">Draft An Anonymous Support Story</h3>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-widest mb-2">Support Title</label>
                <input 
                  type="text" 
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs sm:text-sm text-slate-200 outline-none"
                  placeholder="Highlight key emotion, e.g. Trying to handle final year burnout..."
                  maxLength="100"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-widest mb-2">Support Draft Content</label>
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs sm:text-sm text-slate-200 outline-none h-60 resize-none"
                  placeholder="Share what is happening inside your mind safely. Be supportive. Other matching peers can answer your post in a few moments."
                  maxLength="2000"
                  required 
                />
                <span className="text-[10px] text-slate-500 block text-right mt-1.5">{postContent.length}/2000 characters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-widest mb-2">Category Channel</label>
                  <select 
                     value={postCategory}
                     onChange={(e) => setPostCategory(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs px-4 py-3 rounded-2xl outline-none focus:border-teal-400"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}># {c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-widest mb-2">Mood Indicator</label>
                  <select 
                    value={postMood}
                    onChange={(e) => setPostMood(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs px-4 py-3 rounded-2xl outline-none focus:border-teal-400"
                  >
                    {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-5 pr-1">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_anon_cb"
                    checked={postAnonymous}
                    onChange={(e) => setPostAnonymous(e.target.checked)}
                    className="rounded text-teal-400 focus:ring-0 bg-slate-900 border-slate-800"
                  />
                  <label htmlFor="is_anon_cb" className="text-xs text-slate-300 font-mono tracking-wide">Shield real identity (recommended)</label>
                </div>

                <button 
                  type="submit"
                  disabled={postingLoading}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-sky-500 font-semibold text-xs text-slate-900 rounded-2xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {postingLoading ? 'Publishing...' : 'Publish Anon Post (+15pts)'}
                </button>
              </div>
            </form>
          </div>

          {/* AI assistant Composer helper side-bar */}
          <div className="lg:col-span-1" id="ai-composer-panel">
            <div className="bg-slate-850/80 border border-teal-500/10 p-6 rounded-3xl relative overflow-hidden h-full">
              {/* background light glow effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -z-10" />

              <div className="flex items-center gap-2 text-teal-400 font-sans font-semibold text-sm mb-4">
                Nakama AI draft analysis companion
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Unsure about what category suits your support story best or feeling anxious? Use Nakama AI to scan your draft, detect emotional tone, suggest tags, and reveal coping prompts.
              </p>

              <button 
                onClick={handleAnalyzeAI}
                disabled={aiAnalyzing || !postContent}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-xs font-mono font-semibold text-teal-400 border border-teal-500/20 hover:border-teal-400 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {aiAnalyzing ? 'Evaluating Draft...' : 'Scan draft with AI'}
              </button>

              {aiFeedback && (
                <div className="mt-6 border-t border-slate-800/80 pt-6 space-y-5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Emotional Diagnosis</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px]">{aiFeedback.emotionalTone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Suggested Channel</span>
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/10 px-2 py-1.5 rounded-lg font-medium block text-center truncate">{aiFeedback.recommendedCategory}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Suggested Mood Tag</span>
                      <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-1.5 rounded-lg font-mono block text-[11px] text-center truncate">{aiFeedback.suggestedTag}</span>
                    </div>
                  </div>

                  {/* suggested coping technique */}
                  <div className="bg-teal-950/20 border border-teal-500/10 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-bold block mb-1 font-sans">🧘‍♀️ Nakama AI Coping Exercise:</span>
                    {aiFeedback.helpfulResources}
                  </div>

                  <button 
                    onClick={applyAISuggestions}
                    className="w-full py-2.5 bg-teal-500 text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 cursor-pointer text-center block transition-all"
                  >
                    Apply Category & Mood Tag settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 3: POST DETAILS & COMMENTS / REPLIES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'post_details' && postDetail && (
        <div className="max-w-3xl mx-auto space-y-6" id="detail-wrapper">
          <button 
            onClick={() => setActiveTab('feed_list')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Return to list view
          </button>

          {/* Core original thread card */}
          <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <img 
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${postDetail.avatarSeed || 'Default'}`} 
                  alt="anon" 
                  className="w-7 h-7 rounded-full bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-300 block">{postDetail.username || 'Anonymous'}</span>
                  <span className="text-[10px] text-slate-500 block">{new Date(postDetail.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wider">{postDetail.moodTag}</span>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/10 px-2.5 py-0.5 rounded-md font-sans text-[9px] font-medium">{postDetail.category}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-100 mb-3 tracking-tight">{postDetail.title}</h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {postDetail.content}
            </p>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleSupportToggle(postDetail.id, true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 rounded-xl transition-all ${
                    (postDetail.supportedBy || []).includes(user?.id) ? 'text-teal-400 bg-teal-500/5' : 'hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${(postDetail.supportedBy || []).includes(user?.id) ? 'fill-teal-400' : ''}`} />
                  <span>Offer Support ({postDetail.supportCount || 0})</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{postDetail.commentCount || 0} Discussions</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {(postDetail.user === user?.id || user?.isAdmin) && (
                  <button 
                    onClick={() => handleDeletePost(postDetail.id)} 
                    className="p-2 hover:bg-slate-800 rounded-lg text-rose-400"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleBookmarkToggle(postDetail.id, true)} 
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Comment input form */}
          <div className="bg-slate-850 border border-slate-800 p-5 rounded-3xl" id="write-comment">
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest mb-3">Add Encouragement or Advice</h4>
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-200 outline-none h-24 resize-none"
                placeholder="Offer uplifting thoughts or gentle strategies. Remember, we are here to support."
                required 
              />
              <div className="flex items-center justify-end">
                <button 
                  type="submit"
                  disabled={submittingComment}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 font-semibold text-xs rounded-xl hover:opacity-90 cursor-pointer disabled:opacity-55"
                >
                  {submittingComment ? 'Sending...' : 'Post Comment (+5pts)'}
                </button>
              </div>
            </form>
          </div>

          {/* Conversation comments thread line */}
          <div className="space-y-4" id="comments-trail">
            <h4 className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-2">Encouraging Conversations</h4>
            
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No words shared yet. Offer the first beacon of hope above!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-slate-850/60 border border-slate-800 p-5 rounded-3xl" id={`commentcard-${comment.id}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.avatarSeed || 'Default'}`} 
                      alt="anon" 
                      className="w-6 h-6 rounded-full bg-slate-850"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-300">{comment.username}</span>
                      <span className="text-[9px] text-slate-500 block">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3 font-sans">{comment.content}</p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <button 
                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                      className="hover:text-teal-400 font-semibold cursor-pointer"
                    >
                      Reply
                    </button>
                    <span>|</span>
                    <span className="text-slate-500">{comment.replies?.length || 0} nested replies</span>
                    {(comment.user === user?.id || user?.isAdmin) && (
                      <>
                        <span>|</span>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-rose-450 hover:text-rose-400 font-semibold cursor-pointer font-sans"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {/* Active reply form */}
                  {activeReplyId === comment.id && (
                    <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-xl text-xs text-slate-200 outline-none"
                        placeholder="Join thread..."
                        required 
                      />
                      <button 
                        type="submit" 
                        className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                        id={`btn-reply-${comment.id}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                  {/* Nested loops */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 border-l border-slate-800 pl-4 space-y-3.5">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="text-xs">
                          <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono font-medium text-slate-300">{reply.username}</span>
                            <span className="text-slate-500 font-normal">({new Date(reply.createdAt).toLocaleDateString()})</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed font-sans pl-5">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

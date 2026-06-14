import React, { useState, useEffect } from 'react';
import { api } from './services.js';

// Reorganized Common Components & Layouts
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Loader from './components/common/Loader.jsx';
import Modal from './components/common/Modal.jsx';
import Settings from './pages/Settings.jsx';
import Router from './app/router.jsx';

import { 
  Bell, X, PhoneCall, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [targetPostId, setTargetPostId] = useState(null);

  // Active theme support
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Settings / Emergency modal toggle
  const [showSettings, setShowSettings] = useState(false);

  // Verification capture simulation code
  const [simCode, setSimCode] = useState('');

  // Initial loading state
  const [initLoading, setInitLoading] = useState(true);

  // Synchronize hash routing with responsive viewport state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#landing';
      const cleanHash = hash.replace('#', '');
      
      if (cleanHash.startsWith('feed:')) {
        const postId = cleanHash.split(':')[1];
        setTargetPostId(postId);
        setCurrentPage('feed');
      } else {
        setCurrentPage(cleanHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Check if token already exists to auto-log
    checkExistingAuth();

    // Trigger initial route match
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const checkExistingAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await api.getProfile();
        setUser(data.user || data);
        
        // Fetch active notifications
        fetchNotificationsList();
      } catch (err) {
        // Stale or invalid token
        localStorage.removeItem('token');
      } finally {
        setInitLoading(false);
      }
    } else {
      setInitLoading(false);
    }
  };

  const fetchNotificationsList = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
      const count = list.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to update unread alerts count');
    }
  };

  const handleAuthSuccess = (userData, nextPage = 'feed') => {
    setUser(userData);
    fetchNotificationsList();
    navigate(nextPage);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate('landing');
  };

  const navigate = (pageName) => {
    window.location.hash = `#${pageName}`;
    setCurrentPage(pageName);
  };

  const handleUpdatePoints = (newPoints) => {
    if (user) {
      setUser(prev => ({ ...prev, points: newPoints }));
    }
  };

  const handleNotificationRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      await fetchNotificationsList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotificationsList();
    } catch (err) {
      console.error(err);
    }
  };

  if (initLoading) {
    return <Loader message="Securing anonymity tunnels..." />;
  }

  // Force redirection to verify email if registered but unverified
  const isUnverified = user && !user.verified && currentPage !== 'verify';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative">
      
      {/* Calm background twilight blur gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <Navbar 
        user={user} 
        onNavigate={navigate} 
        onLogout={handleLogout} 
        unreadCount={unreadCount} 
        onToggleNotifications={() => setShowNotifications(!showNotifications)} 
        activePage={currentPage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Unverified banner warning */}
      {isUnverified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3.5 px-4 text-xs font-medium text-amber-300 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <span>⚠️ Access Restricted: Your account anon shield is currently unverified. Check-ins are locked.</span>
          <button 
            onClick={() => navigate('verify')} 
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold font-sans rounded-xl text-[10px] uppercase cursor-pointer"
          >
            Verify code
          </button>
        </div>
      )}

      {/* Secondary Sub-navigation bar for active core forum boards */}
      {user && !isUnverified && currentPage !== 'landing' && (
        <div className="bg-slate-900/60 border-b border-slate-800 py-2 sticky top-[69px] z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex items-center gap-1 scrollbar-none scroll-smooth">
            <button
              onClick={() => navigate('feed')}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentPage === 'feed' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
              id="tab-feed"
            >
              📰 Forums
            </button>
            {!user.isAdmin && (
              <>
                <button
                  onClick={() => navigate('mood')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    currentPage === 'mood' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                  id="tab-mood"
                >
                  📈 Mood Tracker
                </button>
                <button
                  onClick={() => navigate('gratitude')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    currentPage === 'gratitude' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                  id="tab-gratitude"
                >
                  🌸 Positivity Wall
                </button>
                <button
                  onClick={() => navigate('challenges')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    currentPage === 'challenges' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                  id="tab-challenges"
                >
                  🛡️ habit Path
                </button>
                <button
                  onClick={() => navigate('chat')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    currentPage === 'chat' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                  id="tab-chat"
                >
                  💬 Peer Matching
                </button>
                <button
                  onClick={() => navigate('companion')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    currentPage === 'companion' ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                  id="tab-companion"
                >
                  Nakama Assistant
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main viewport */}
      <main className="flex-1 pb-16">
        <Router 
          currentPage={currentPage}
          user={user}
          onNavigate={navigate}
          onAuthSuccess={handleAuthSuccess}
          targetPostId={targetPostId}
          onUpdatePoints={handleUpdatePoints}
          simCode={simCode}
          setSimCode={setSimCode}
          setUser={setUser}
        />
      </main>

      {/* Slide-over Notifications drawer panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end" id="drawer-slideover">
          <div className="w-full max-w-sm bg-slate-850 h-full p-6 border-l border-slate-800 flex flex-col justify-between" id="notifications-tray">
            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-teal-400" />
                  <h4 className="font-sans font-semibold text-slate-200 text-sm">Notifications ({unreadCount})</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleClearNotifications}
                    className="text-[10px] text-teal-400 hover:underline font-mono"
                  >
                    Clear all
                  </button>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-10">No alerts or supports received yet today.</p>
              ) : (
                <div className="space-y-3.5">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        if (notif.postId) {
                          navigate(`feed:${notif.postId}`);
                        } else if (notif.type === 'match') {
                          navigate('chat');
                        }
                        handleNotificationRead(notif.id);
                        setShowNotifications(false);
                      }}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer text-xs ${
                        notif.read 
                          ? 'bg-slate-900/40 border-slate-900 opacity-60' 
                          : 'bg-slate-900 border-teal-500/15 text-slate-200'
                      }`}
                      id={`notifcard-${notif.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[9px] text-slate-500">
                        <span>{notif.type.toUpperCase()} ALERT</span>
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">
                        <strong className="font-semibold text-teal-400">{notif.senderUsername}</strong> &nbsp;
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-4 cursor-default">
              Close slider to resume wellness exploration.
            </div>
          </div>
        </div>
      )}

      {/* Floating Crisis directory FAB */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3.5 rounded-full bg-rose-500 hover:bg-rose-400 text-slate-900 font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer inline-flex items-center justify-center"
          title="Crisis Helplines Directory"
          id="helpline-trigger-fab"
        >
          <PhoneCall className="w-5 h-5 fill-slate-900" />
        </button>
      </div>

      {/* Reusable Crisis Hotline modal wrapper */}
      <Modal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        id="crisis-helpline-modal"
      >
        <Settings onClose={() => setShowSettings(false)} />
      </Modal>

      {/* Footer */}
      <Footer 
        onNavigate={navigate} 
        onShowEmergency={() => setShowSettings(true)} 
      />
    </div>
  );
}

import React from 'react';
import { 
  Shield, Settings, User, Award, CheckCircle2, Bell, LogOut, Sailboat, Sun, Moon
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onNavigate, 
  onLogout, 
  unreadCount, 
  onToggleNotifications, 
  activePage,
  theme,
  onToggleTheme
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div 
          onClick={() => onNavigate(user ? 'feed' : 'landing')} 
          className="flex items-center gap-3 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="p-2 bg-gradient-to-tr from-teal-500 to-sky-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
            <Sailboat className="w-5 h-5 text-slate-900 fill-slate-900" />
          </div>
          <div>
            <span className="font-serif italic text-xl text-slate-100 group-hover:text-white tracking-tight block transition-colors">
              Nakama
            </span>
            <span className="font-mono text-[10px] text-teal-400 block tracking-wider uppercase -mt-0.5">
              Anonymous Haven
            </span>
          </div>
        </div>

        {/* User Stats and Navigation Actions */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4" id="navbar-user-actions">
            {/* Points Ticker */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-full" title="Earned points tracker">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">{user.points} pts</span>
            </div>

            {/* Support Streak badge */}
            {user.moodStreak > 1 && (
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-300 font-mono text-[11px]" title="Consecutive journal logs">
                <span className="font-bold">🔥 {user.moodStreak}</span> Streak
              </div>
            )}

            {/* Admin Dashboard shortcut */}
            {user.isAdmin && (
              <button 
                onClick={() => onNavigate('admin')}
                className={`p-2 rounded-xl border transition-colors relative group ${
                  activePage === 'admin' 
                    ? 'bg-teal-500/10 border-teal-500 text-teal-400' 
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-100'
                }`}
                title="Moderation Console"
                id="btn-admin-nav"
              >
                <Shield className="w-4 h-4" />
                <span className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded whitespace-nowrap">
                  Admin Dashboard
                </span>
              </button>
            )}

            {/* In-app Notification bell */}
            <button 
              onClick={onToggleNotifications}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors relative"
              id="btn-notification-bell"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
              )}
            </button>

            {/* User Profile shortcut */}
            <div 
              onClick={() => onNavigate('profile')} 
              className={`flex items-center gap-2 cursor-pointer border rounded-full pl-2 pr-3 py-1 bg-slate-850 hover:bg-slate-800 transition-colors ${
                activePage === 'profile' ? 'border-teal-500' : 'border-slate-800'
              }`}
              title="View my anonymous sheet"
              id="navbar-profile-trigger"
            >
              <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.avatarSeed}`} 
                alt="anon" 
                className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" 
                referrerPolicy="no-referrer"
              />
              <span className="hidden md:inline font-mono text-[11px] font-medium text-slate-300">
                {user.username}
              </span>
            </div>

            {/* Theme Switch Toggle */}
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              id="btn-theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Logout trigger */}
            <button 
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
              title="Close secure session"
              id="btn-nav-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2" id="navbar-guest-actions">
            <button 
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
              id="btn-nav-login"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-teal-500/10"
              id="btn-nav-register"
            >
              Register Anon
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { Shield, Mail, Lock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const ADJECTIVES = [
  'Calm', 'Peaceful', 'Serene', 'Gentle', 'Happy', 'Warm', 'Kind', 'Bright', 
  'Quiet', 'Wise', 'Brave', 'Strong', 'Uplifting', 'Hopeful', 'Joyful', 'Caring'
];

const ANIMALS = [
  'Fox', 'Deer', 'Owl', 'Koala', 'Panda', 'Otter', 'Bear', 'Rabbit', 
  'Squirrel', 'Hedgehog', 'Seal', 'Robin', 'Dolphin', 'Butterfly', 'Turtle'
];

function generateRecommendedNames() {
  const list = [];
  for (let i = 0; i < 3; i++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const anim = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num = Math.floor(100 + Math.random() * 900);
    list.push(`${adj}${anim}${num}`);
  }
  return list;
}

export default function AuthPages({ 
  type, // 'login' | 'register' | 'forgot' | 'verify' | 'reset'
  onAuthSuccess, 
  onNavigate,
  simCodeData // simulated verify or reset tokens
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [username, setUsername] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [capturedVerifyCode, setCapturedVerifyCode] = useState(simCodeData || '');
  const [capturedResetToken, setCapturedResetToken] = useState('');

  useEffect(() => {
    if (type === 'register') {
      const recs = generateRecommendedNames();
      setRecommendations(recs);
      setUsername(recs[0]);
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (type === 'register') {
        const data = await api.register(email, password, username);
        localStorage.setItem('token', data.token);
        setInfo(data.message);
        onAuthSuccess(data.user, 'feed');
      } else if (type === 'login') {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        onAuthSuccess(data.user, 'feed');
      } else if (type === 'verify') {
        const data = await api.verifyEmail(code);
        onAuthSuccess(data.user, 'feed');
      } else if (type === 'forgot') {
        const data = await api.forgotPassword(email);
        setInfo(data.message);
        if (data.resetTokenSimulation) {
          setCapturedResetToken(data.resetTokenSimulation);
        }
      } else if (type === 'reset') {
        const data = await api.resetPassword(resetToken, newPassword);
        setInfo(data.message);
        setTimeout(() => onNavigate('login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4" id="auth-panel-wrapper">
      <div className="bg-slate-850/80 border border-slate-800 p-8 rounded-3xl" id="auth-card">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl text-teal-400 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            {type === 'login' && 'Sign In securely'}
            {type === 'register' && 'Generate Anon Identity'}
            {type === 'verify' && 'Verify Registration Code'}
            {type === 'forgot' && 'Reset My Password'}
            {type === 'reset' && 'Create New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {type === 'login' && 'Enter your coordinates to unlock account.'}
            {type === 'register' && 'A unique random name is generated on creation.'}
            {type === 'verify' && 'Enter verification digits sent to simulated inbox.'}
            {type === 'forgot' && 'We will generate a simulated reset link token.'}
            {type === 'reset' && 'Provide your secret token and new email credentials.'}
          </p>
        </div>

        {/* Global Warnings */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-6 text-xs flex gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{info}</span>
          </div>
        )}

        {/* Dynamic Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === 'login' || type === 'register' || type === 'forgot') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm text-slate-200 outline-none transition-colors"
                  placeholder="e.g. hello@domain.com"
                  required 
                />
              </div>
            </div>
          )}

          {type === 'register' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300 font-mono uppercase tracking-wider">Choose Anonymous Handle</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. JoyfulSnail101"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm text-slate-200 outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-mono">Suggestions:</span>
                {recommendations.map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setUsername(rec)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl font-mono border transition-all cursor-pointer ${
                      username === rec 
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-750'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRecommendations(generateRecommendedNames())}
                  className="p-1 hover:bg-slate-800 text-slate-500 hover:text-teal-400 rounded-lg transition-colors cursor-pointer"
                  title="Generate alternative suggestions"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {(type === 'login' || type === 'register') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm text-slate-200 outline-none transition-colors"
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>
          )}

          {type === 'verify' && (
            <div>
              <label className="block text-xs font-semibold text-teal-400 mb-2 font-mono uppercase tracking-widest text-center">6-Digit Code</label>
              <input 
                type="text" 
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full py-4 bg-slate-900 border-2 border-slate-800 focus:border-teal-500 rounded-2xl text-2xl font-mono text-center text-slate-100 tracking-widest outline-none transition-all"
                placeholder="000000"
                required 
              />
            </div>
          )}

          {type === 'reset' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">Reset Token</label>
                <input 
                  type="text" 
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm text-slate-200 outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">New Secure Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm text-slate-200 outline-none"
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>
          )}

          {/* Submit Action buttons */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 font-semibold text-sm text-slate-900 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {type === 'login' && 'Sign In Into Haven'}
                {type === 'register' && 'Generate Free Account'}
                {type === 'verify' && 'Confirm Code'}
                {type === 'forgot' && 'Send Simulated Reset Code'}
                {type === 'reset' && 'Overwrite Secret Password'}
              </>
            )}
          </button>
        </form>

        {/* Simulated Email Interceptor (Crucial Helper for AI-Studio testers) */}
        {type === 'verify' && capturedVerifyCode && (
          <div className="mt-6 bg-slate-900/60 border border-teal-500/10 p-4 rounded-2xl text-xs font-mono text-slate-400">
            <span className="text-teal-400 font-bold block mb-1">📬 Simulated Sandbox Inbox:</span>
            An email verification code was caught. Paste code <strong className="text-slate-100 underline decoration-teal-400 tracking-widest">{capturedVerifyCode}</strong> above to instantly verify.
          </div>
        )}

        {type === 'forgot' && capturedResetToken && (
          <div className="mt-6 bg-slate-900/60 border border-teal-500/10 p-4 rounded-2xl text-xs font-mono text-slate-400">
            <span className="text-teal-400 font-semibold block mb-1">📬 Intercepted Password Reset Link:</span>
            A reset token was caught: <strong className="text-slate-100">{capturedResetToken}</strong>. Click below to enter it.
            <button 
              onClick={() => {
                setResetToken(capturedResetToken);
                onNavigate('reset');
              }}
              className="mt-2 block w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-teal-400 font-semibold rounded-lg tracking-wider uppercase border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              Reset page with code
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400 space-y-3">
          {type === 'login' && (
            <>
              <div>
                Don't have an anonymous shield?{' '}
                <button onClick={() => onNavigate('register')} className="text-teal-400 hover:underline font-semibold cursor-pointer">Register Free</button>
              </div>
              <div>
                <button onClick={() => onNavigate('forgot')} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Forgot Password?</button>
              </div>
            </>
          )}

          {type === 'register' && (
            <div>
              Already have coordinates?{' '}
              <button onClick={() => onNavigate('login')} className="text-teal-400 hover:underline font-semibold cursor-pointer">Sign In</button>
            </div>
          )}

          {type === 'forgot' && (
            <div>
              Back to{' '}
              <button onClick={() => onNavigate('login')} className="text-teal-400 hover:underline font-semibold cursor-pointer">Login Screen</button>
            </div>
          )}

          {type === 'verify' && (
            <div className="text-[10px] text-slate-500 leading-relaxed">
              Real email servers are not active in this sandbox. Double check the debug box above. Click <button onClick={() => onNavigate('landing')} className="text-teal-400 underline cursor-pointer">logout</button> to restart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

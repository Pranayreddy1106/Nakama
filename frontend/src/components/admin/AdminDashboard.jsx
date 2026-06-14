import React, { useState, useEffect } from 'react';
import { api } from '../../services.js';
import { 
  Shield, Users, AlertCircle, CheckCircle2, RotateCw, Trash2, Ban, ShieldAlert, 
  BarChart2, ShieldCheck, HeartPulse
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Status Alerts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const summaryStats = await api.getAdminStats();
      setStats(summaryStats);
      
      const usrList = await api.getAdminUsers();
      setUsersList(usrList);

      const repList = await api.getFlaggedReports();
      setReportsList(repList);
    } catch (err) {
      setError('Error compiling administration statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleUserModAction = async (userId, action) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.updateUserStatus(userId, action);
      setSuccess(res.message);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Moderation action failed');
    }
  };

  const handleResolveReport = async (reportId, decision) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.resolveFlaggedReport(reportId, decision);
      setSuccess(res.message);
      await fetchAdminData();
    } catch (err) {
      setError('Report coordination failed');
    }
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-20">
        <RotateCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400 font-mono">Syncing moderator configurations...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8" id="admin-dashboard-container">
      {/* Header banner */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100 font-sans flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-500 fill-rose-500/10" />
          Guardians Control & Crisis Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review community reports, moderate coordinates, analyze forum stats, and monitor trigger warning flags.
        </p>
      </div>

      {/* Prompts warning */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Admin stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="stats-banner">
        <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl">
          <span className="block text-2xl font-bold text-slate-100">{stats.summaryStats.totalUsers}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Members</span>
        </div>
        <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl">
          <span className="block text-2xl font-bold text-slate-100">{stats.summaryStats.activeUsers}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Active Members</span>
        </div>
        <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl">
          <span className="block text-2xl font-bold text-slate-100">{stats.summaryStats.totalPosts}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Stories</span>
        </div>
        <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl">
          <span className="block text-2xl font-bold text-slate-100">{stats.summaryStats.totalComments}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Comments</span>
        </div>
        <div className="bg-slate-850 border border-rose-900/30 p-4 rounded-2xl bg-gradient-to-tr from-slate-850 to-rose-950/10">
          <span className="block text-2xl font-bold text-rose-400">{stats.summaryStats.pendingReports}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Flagged reports</span>
        </div>
      </div>

      {/* Grid: Left mood distribution chart | Right Crisis Alerts queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recharts graph */}
        <div className="lg:col-span-1 bg-slate-850 p-5 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
            <BarChart2 className="w-4 h-4 text-teal-400" />
            Forum Mood Distribution Chart
          </h3>

          <div className="h-60" id="admin-mood-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3341" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                <Bar dataKey="value" fill="#14b8a6">
                  {stats.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#14b8a6' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Crisis Alert review warnings */}
        <div className="lg:col-span-2 bg-slate-850 p-6 border border-rose-950/10 rounded-3xl space-y-4">
          <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 text-rose-400 font-bold">
            <HeartPulse className="w-4 h-4 text-rose-500 fill-rose-500/10 animate-pulse" />
            AI Crisis Risk Warning Queue ({stats.crisisAlerts?.length || 0})
          </h3>

          {(!stats.crisisAlerts || stats.crisisAlerts.length === 0) ? (
            <p className="text-xs text-slate-500 italic text-center py-12">Congratulations! No crisis triggers or high keyword alerts matched in any active discussions.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {stats.crisisAlerts.map(alert => (
                <div key={alert.id} className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-2xl flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-500 text-slate-950 px-2 py-0.5 rounded-md font-mono text-[9px] uppercase font-bold tracking-wider leading-none">
                        {alert.dangerScore}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold font-sans">{alert.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 block mt-1">Author anon: <strong className="text-slate-400">{alert.author}</strong> &bull; Flags reports count: {alert.reports || 0}</p>
                  </div>

                  <span className="bg-slate-900 text-slate-400 px-3 py-1 text-[10px] font-mono rounded-lg">Target ID: {alert.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content review reports ticket list */}
      <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl space-y-4" id="moderation-reports">
        <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">Pending Moderation tickets ({reportsList.length})</h3>

        {reportsList.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">All moderation checks completed. Keep up the high standard!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Author Nick</th>
                  <th className="py-3 px-2">Reason</th>
                  <th className="py-3 px-2">Ticket Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportsList.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-2 font-mono text-[10px] uppercase text-rose-400">{rep.targetType}</td>
                    <td className="py-3 px-2 font-semibold text-slate-200">{rep.authorName}</td>
                    <td className="py-3 px-2 italic text-slate-400">"{rep.reason}"</td>
                    <td className="py-3 px-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] bold ${
                        rep.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                      {rep.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolveReport(rep.id, 'dismiss')}
                            className="bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-300 font-bold px-2.5 py-1 rounded-xl transition-colors inline-block"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, 'delete')}
                            className="bg-rose-500 hover:bg-rose-400 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-colors inline-block"
                          >
                            Delete Content
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500">&#10003; Ticket Archival Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Suspension list */}
      <div className="bg-slate-850 border border-slate-800 p-6 rounded-3xl space-y-4" id="user-guardians">
        <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">User Directory & Safety actions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                <th className="py-3 px-2">Anonymous Username</th>
                <th className="py-3 px-2">Points</th>
                <th className="py-3 px-2">Role/Verified</th>
                <th className="py-3 px-2">Mod Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map(u => (
                <tr key={u.id}>
                  <td className="py-3 px-2 font-mono font-semibold">{u.username}</td>
                  <td className="py-3 px-2">{u.points} pts</td>
                  <td className="py-3 px-2 space-x-1.5">
                    {u.isAdmin && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded text-[10px]">Admin</span>}
                    {u.verified ? <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px]">Verified</span> : <span className="bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px]">Unverified</span>}
                  </td>
                  <td className="py-2.5 px-2 text-left space-x-2 whitespace-nowrap">
                    {u.isBanned ? (
                      <button 
                        onClick={() => handleUserModAction(u.id, 'unban')}
                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                      >
                        Lift Ban
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUserModAction(u.id, 'ban')}
                        disabled={u.isAdmin}
                        className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-slate-900 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all disabled:opacity-30"
                      >
                        Ban Identity
                      </button>
                    )}

                    {(!u.isAdmin) && (
                      <button 
                        onClick={() => handleUserModAction(u.id, 'promote')}
                        className="bg-slate-900 border border-slate-800 hover:border-teal-400 hover:text-teal-400 text-slate-400 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors"
                      >
                        Promote Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

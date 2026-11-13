import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Send, CheckCircle2, Shield, AlertTriangle, Sparkles, Filter } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const { notifications, addNotification } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'user' | 'vendor' | 'admin'>('all');
  const [type, setType] = useState<'system' | 'reward' | 'campaign' | 'security'>('system');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    addNotification({
      title,
      message,
      targetRole,
      type
    });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Notifications & Broadcasts</h1>
          <p className="text-xs text-slate-400">Push targeted in-app alerts and announcements across user and vendor groups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-400" />
              <span>Compose Broadcast Alert</span>
            </h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Audience Scope</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              >
                <option value="all">All Users & Vendors</option>
                <option value="user">Viewers Only (Users)</option>
                <option value="vendor">Advertisers Only (Vendors)</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Notice Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              >
                <option value="system">System Notice</option>
                <option value="reward">Points / Reward Drop</option>
                <option value="campaign">New Campaign Premiere</option>
                <option value="security">Security / Anti-Cheat Update</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Double Point Weekend Active!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Message Body *</label>
              <textarea
                rows={3}
                required
                placeholder="Details of the announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Notice</span>
            </button>
          </form>
        </div>

        {/* Existing Notifications Stream */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-400" />
              <span>Recent Dispatched Announcements</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">{notifications.length} logged</span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                      {n.targetRole}
                    </span>
                    <span className="text-[11px] text-slate-500">{n.createdAt}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

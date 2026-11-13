import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Sparkles, Award, ShieldCheck, CheckCheck } from 'lucide-react';

export const UserNotifications: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  const userNotifs = notifications.filter((n) => n.targetRole === 'user' || n.targetRole === 'all');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reward Notifications & Updates</h1>
          <p className="text-xs text-slate-400">Important messages regarding new high-yield premieres, bonuses, and payouts.</p>
        </div>
      </div>

      <div className="space-y-3">
        {userNotifs.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              n.read
                ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                : 'bg-slate-900/90 border-purple-500/40 shadow-sm text-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'reward' ? <Sparkles className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">{n.createdAt}</span>
                </div>
              </div>

              {n.read ? (
                <CheckCheck className="h-4 w-4 text-slate-600 shrink-0" />
              ) : (
                <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  New
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

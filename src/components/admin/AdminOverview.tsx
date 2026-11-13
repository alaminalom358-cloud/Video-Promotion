import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Eye, 
  DollarSign, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Play,
  Flame
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { campaigns, users, vendors, redemptions, approveCampaign, rejectCampaign, setAdminPage, t } = useApp();

  const totalViews = campaigns.reduce((acc, c) => acc + c.currentViews, 0);
  const totalBudgetSpent = campaigns.reduce((acc, c) => acc + c.budgetSpent, 0);
  const pendingCampaigns = campaigns.filter((c) => c.status === 'pending');
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('admin_overview', 'Admin Dashboard')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('admin_reports', 'Operational Overview & Moderation Center')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminPage('pending-campaigns')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{t('admin_pending_campaigns', 'Pending Campaigns')} ({pendingCampaigns.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('admin_active_campaigns', 'Total Verified Views')}
          value={totalViews.toLocaleString()}
          subValue="completions"
          trend={{ value: "+18.4%", isPositive: true, label: "vs last week" }}
          icon={Eye}
        />
        <StatCard
          label="Gross Campaign Points"
          value={`${Math.round(totalBudgetSpent).toLocaleString()} pts`}
          subValue="allocated"
          trend={{ value: "+24.2%", isPositive: true, label: "this month" }}
          icon={Flame}
        />
        <StatCard
          label={t('admin_user_management', 'User Management')}
          value={users.length.toString()}
          subValue="active viewers"
          trend={{ value: "+8.5%", isPositive: true }}
          icon={Users}
        />
        <StatCard
          label={t('admin_redemption_requests', 'Redemption Requests')}
          value={`${pendingRedemptions.reduce((acc, r) => acc + (r.pointsUsed || 0), 0).toLocaleString()} pts`}
          subValue={`≈ ৳${pendingRedemptions.reduce((acc, r) => acc + (r.cashValueBdt || 0), 0).toLocaleString()} (${pendingRedemptions.length} requests)`}
          icon={CreditCard}
          badge="Action Required"
        />
      </div>

      {/* 2-Column Grid: Pending Approvals & Performance Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Campaigns Fast-Action Desk */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Pending Campaign Moderation Queue</h2>
              <p className="text-[11px] text-slate-400">Review video metadata before releasing to user reward feeds</p>
            </div>
            <button
              onClick={() => setAdminPage('pending-campaigns')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              View All ({pendingCampaigns.length})
            </button>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No pending campaigns awaiting review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-18 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center">
                      {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                        <img src={camp.thumbnail} alt={camp.title} className="w-full h-full object-cover" />
                      ) : (
                        <Play className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-1">{camp.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-purple-300">{camp.vendorName}</span>
                        <span>·</span>
                        <span className="font-mono">{camp.durationSeconds}s duration</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono">+{camp.rewardPoints} pts/view</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => approveCampaign(camp.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectCampaign(camp.id, 'Failed editorial standards.')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Platform Signals & Integrity */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">System Health & Telemetry</h2>
              <p className="text-[11px] text-slate-400">Real-time anti-fraud engine invariants</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Tab Verification Rate</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">98.9%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Suspicious Bot Farm Probes Blocked</span>
              <span className="font-mono text-white font-bold tabular-nums">1,429 today</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Average Watch Duration Ratio</span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">91.4% of Target</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Reward Points in Circulation</span>
              <span className="font-mono text-white font-bold tabular-nums">48,250 pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300">
            <p className="font-semibold">Next Scheduled Payout Batch:</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated batch processor runs daily at 00:00 UTC.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

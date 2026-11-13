import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  Clock, 
  Play, 
  ArrowUpRight,
  BarChart2
} from 'lucide-react';

export const VendorOverview: React.FC = () => {
  const { campaigns, currentVendor, setVendorPage, openCampaignDetail, notifications, t } = useApp();

  const myCampaigns = campaigns.filter((c) => c.vendorId === currentVendor.id);
  const activeCount = myCampaigns.filter((c) => c.status === 'active').length;
  const totalViewsDelivered = myCampaigns.reduce((acc, c) => acc + c.currentViews, 0);
  const totalBudgetSpent = myCampaigns.reduce((acc, c) => acc + c.budgetSpent, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {currentVendor.companyName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('vendor_overview', 'Vendor Dashboard')} · {t('platform_tagline', 'Video Promotion & Reward Platform')}
          </p>
        </div>
        <button
          onClick={() => setVendorPage('submit-campaign')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('vendor_submit_campaign', 'Submit New Campaign')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Views Delivered"
          value={totalViewsDelivered.toLocaleString()}
          subValue="verified completions"
          trend={{ value: "+22.8%", isPositive: true }}
          icon={Eye}
        />
        <StatCard
          label="পয়েন্ট খরচ"
          value={`${Math.round(currentVendor.totalSpent || totalBudgetSpent).toLocaleString()} pts`}
          subValue="ক্যাম্পেইনে ব্যবহৃত পয়েন্ট"
          trend={{ value: "+14.1%", isPositive: true }}
          icon={CheckCircle2}
        />
        <StatCard
          label="Active Campaigns"
          value={activeCount.toString()}
          subValue="currently live"
          icon={Play}
        />
        <StatCard
          label="পয়েন্ট ব্যালেন্স"
          value={`${Math.round(currentVendor.balance || 0).toLocaleString()} pts`}
          subValue="বিজ্ঞাপনের জন্য প্রস্তুত"
          icon={CheckCircle2}
        />
      </div>

      {/* Active Campaigns Table & Performance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Your Video Campaigns</h2>
            <p className="text-xs text-slate-400">Manage campaign schedules, view completion velocity, and audit delivery.</p>
          </div>
          <button
            onClick={() => setVendorPage('my-campaigns')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            View All ({myCampaigns.length})
          </button>
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Target Watch</th>
                  <th className="py-3 px-4 text-right">Views Delivered</th>
                  <th className="py-3 px-4 text-right">Points Consumed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                            <img src={camp.thumbnail} alt={camp.title} className="w-full h-full object-cover" />
                          ) : (
                            <Play className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white max-w-xs truncate">{camp.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {camp.id} · {camp.category}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-purple-300">
                      {camp.platform}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {camp.requiredWatchSeconds}s
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-white tabular-nums">
                      <span className="font-bold">{camp.currentViews.toLocaleString()}</span>
                      <span className="text-slate-500 text-[10px]"> / {camp.targetViews.toLocaleString()}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {Math.round(camp.budgetSpent || 0).toLocaleString()} pts
                      <span className="block text-[10px] text-slate-500 font-normal">of {(camp.requiredTotalPoints || camp.budgetTotal).toLocaleString()} pts</span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={camp.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setVendorPage('feedback-reports')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
                      >
                        Analytics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notifications & System Messages */}
      {(() => {
        const vendorNotifs = (notifications || []).filter((n) => 
          n.targetRole === 'vendor' || 
          n.targetRole === 'all' || 
          n.vendorId === currentVendor.id || 
          n.targetUserId === currentVendor.id
        );

        if (vendorNotifs.length === 0) return null;

        return (
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>বিজ্ঞপ্তি ও বার্তা (Notifications & Messages)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{vendorNotifs.length} টি বার্তা</span>
            </div>
            <div className="space-y-2">
              {vendorNotifs.slice(0, 5).map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 hover:border-purple-500/30 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{notif.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

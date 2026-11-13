import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { AdBannerBox } from '../common/AdBannerBox';
import { 
  Coins, 
  Flame, 
  Play, 
  Gift, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const UserOverview: React.FC = () => {
  const { 
    currentUser, 
    campaigns, 
    activities, 
    setUserPage, 
    openCampaignDetail, 
    recordVideoWatchClick,
    getVideoCooldownRemaining,
    clearVideoCooldown,
    settings, 
    t 
  } = useApp();

  const activeCampaigns = campaigns.filter((c) => 
    (c.status === 'active' || c.status === 'approved') && 
    c.isVisibleToUsers !== false &&
    !(c.totalTargetWatchMinutes && Number(c.totalTargetWatchMinutes) > 0 && Number(c.totalWatchedMinutes || 0) >= Number(c.totalTargetWatchMinutes))
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentUser.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
              {currentUser.tier} Tier
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Promoview Watch & Earn Rewards
          </p>
        </div>

        <button
          onClick={() => setUserPage('discover')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>{t('user_discover', 'Discover Campaigns')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label={t('user_available_points', 'Available Points')}
          value={currentUser.points.toLocaleString()}
          subValue="ওয়ালেট ব্যালেন্স"
          trend={{ value: "+850 pts", isPositive: true, label: "today" }}
          icon={Coins}
        />
        <StatCard
          label={t('user_total_earned', 'Lifetime Earned')}
          value={`${currentUser.totalEarnedPoints.toLocaleString()} ${t('pts', 'pts')}`}
          subValue="সর্বমোট অর্জিত"
          icon={Gift}
        />
      </div>

      {/* Box 1 Advertisement Banner (height: 60px, width: 468px) replacing Screenshot_10 */}
      <AdBannerBox boxId="box-1" name="box 1" width={468} height={60} />

      {/* Recommended Campaigns Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recommended Video Premieres</h2>
            <p className="text-xs text-slate-400">High-yield points available right now</p>
          </div>
          <button
            onClick={() => setUserPage('discover')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            Browse All ({activeCampaigns.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeCampaigns.slice(0, 3).map((camp) => {
            const cooldown = getVideoCooldownRemaining(camp.id);
            const isLocked = cooldown.isLocked;

            return (
              <div
                key={camp.id}
                className={`rounded-2xl bg-slate-900/70 border overflow-hidden flex flex-col justify-between transition-all shadow-sm group ${
                  isLocked ? 'border-amber-500/30 bg-slate-900/50' : 'border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                      <img
                        src={camp.thumbnail}
                        alt={camp.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isLocked ? 'grayscale-[25%]' : 'group-hover:scale-105'
                        }`}
                      />
                    ) : (
                      <Play className="h-8 w-8 text-slate-600" />
                    )}
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase tracking-wider">
                      {camp.category}
                    </div>

                    {isLocked ? (
                      <div className="absolute top-2.5 right-2.5 bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ৪ ঘণ্টা বিরতি
                      </div>
                    ) : (
                      <div className="absolute bottom-2.5 right-2.5 bg-purple-950/90 border border-purple-500/40 px-2.5 py-0.5 rounded text-xs font-bold text-purple-300 font-mono">
                        +{camp.rewardPoints} pts
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {camp.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{camp.vendorName}</span>
                      <span className="font-mono text-[11px]">{camp.requiredWatchSeconds}s watch</span>
                    </div>

                    {isLocked && (
                      <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[10px] space-y-0.5">
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>৪ ঘণ্টার জন্য বিরতি চলছে</span>
                        </p>
                        <p className="text-[9px] text-slate-400">
                          ৪ ঘণ্টা পর পুনরায় দেখা যাবে (বাকি: {cooldown.formatted})। অন্য ভিডিও দেখতে পারবেন।
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {isLocked ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        disabled
                        title={`এই ভিডিওটি ৪ ঘণ্টার জন্য লক রয়েছে। ${cooldown.formatted} পর আবার দেখতে পারবেন। অন্য ভিডিও দেখুন।`}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800/90 border border-slate-700/80 shadow-none flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>৪ ঘণ্টা লক ({cooldown.formatted} বাকি)</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearVideoCooldown(camp.id);
                        }}
                        title="লক রিসেট করুন (Reset Lock to Watch Now)"
                        className="px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-800/60 border border-amber-600/40 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔄
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => recordVideoWatchClick(camp.id)}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-purple-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Watch & Claim Points</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Recent Watch Activities</h2>
          <button
            onClick={() => setUserPage('my-activities')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            View All History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Video Title</th>
                <th className="py-2.5 px-4">Watched At</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4 text-right">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activities.slice(0, 3).map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-medium text-white max-w-sm truncate">{act.campaignTitle}</td>
                  <td className="py-2.5 px-4 text-slate-400">{act.watchedAt}</td>
                  <td className="py-2.5 px-4 text-slate-300 font-mono">{act.durationWatched}s</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                    +{act.pointsEarned} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

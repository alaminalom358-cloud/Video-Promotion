import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Play, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Award,
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';

export const DiscoverCampaigns: React.FC = () => {
  const { campaigns, openCampaignDetail, recordVideoWatchClick, getVideoCooldownRemaining, clearVideoCooldown, settings } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'reward' | 'duration' | 'newest'>('reward');
  const [detailsModalCampaign, setDetailsModalCampaign] = useState<Campaign | null>(null);

  const categories = ['All', 'Tech', 'Gaming', 'Lifestyle', 'Education', 'Music'];

  // Display all approved, active, and completed campaigns that are ON (isVisibleToUsers !== false)
  const liveCampaigns = campaigns.filter(
    (c) =>
      (c.status === 'active' || c.status === 'approved' || c.status === 'completed') &&
      c.isVisibleToUsers !== false
  );

  const filtered = liveCampaigns
    .filter((c) => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                            c.vendorName.toLowerCase().includes(search.toLowerCase()) ||
                            (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'reward') return b.rewardPoints - a.rewardPoints;
      if (sortBy === 'duration') return a.requiredWatchSeconds - b.requiredWatchSeconds;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Discover Video Campaigns</h1>
          <p className="text-xs text-slate-400">
            Browse verified video campaigns. Watch voluntarily on YouTube and participate in activities (Feedback, Quiz, Survey, Review) to earn instant points.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="reward">Highest Reward Points</option>
            <option value="duration">Shortest Video Duration</option>
            <option value="newest">Recently Published</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns, brands, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No active or approved campaigns found matching filters.
          </div>
        ) : (
          filtered.map((camp) => {
            const targetMinutes = Number(camp.totalTargetWatchMinutes ?? 100);
            const watchedMinutes = Number(camp.totalWatchedMinutes || 0);
            const isCompleted = camp.status === 'completed' || (targetMinutes > 0 && watchedMinutes >= targetMinutes);
            const cooldown = getVideoCooldownRemaining(camp.id);
            const isCooldownLocked = cooldown.isLocked;

            return (
              <div
                key={camp.id}
                className={`rounded-2xl bg-slate-900/70 border overflow-hidden flex flex-col justify-between transition-all group ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-slate-900/40' 
                    : isCooldownLocked
                    ? 'border-amber-500/30 bg-slate-900/50'
                    : 'border-slate-800 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/10'
                }`}
              >
                <div>
                  {/* 1. Video Thumbnail */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                      <img
                        src={camp.thumbnail}
                        alt={camp.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isCompleted ? 'grayscale-[30%]' : isCooldownLocked ? 'grayscale-[20%]' : 'group-hover:scale-105'
                        }`}
                      />
                    ) : (
                      <Play className="h-8 w-8 text-slate-600" />
                    )}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold text-white uppercase tracking-wider">
                      {camp.category}
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={isCompleted ? 'completed' : camp.status} />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-purple-950/90 backdrop-blur-sm border border-purple-500/40 px-3 py-1 rounded text-xs font-bold text-purple-300 font-mono">
                      {isCompleted ? '✓ Completed' : `+${settings.activityPoints?.review ? settings.activityPoints.review + settings.activityPoints.quiz : camp.rewardPoints} Pts Earnable`}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* 2. Video Title */}
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {camp.title}
                    </h3>

                    {/* 3. Vendor Name */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="text-purple-300 font-medium">By {camp.vendorName}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{camp.durationSeconds}s duration</span>
                      </span>
                    </div>

                    {/* 4. Campaign Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {camp.description || 'Watch promotional video showcase voluntarily and share your verified feedback.'}
                    </p>

                    {/* Completion Notice */}
                    {isCompleted && (
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>ভিডিও লক্ষ্য পূর্ণ ({watchedMinutes}/{targetMinutes} মি.)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">২ দিন পর ডিলিট হবে</span>
                      </div>
                    )}

                    {/* 4-Hour Cooldown Notice */}
                    {isCooldownLocked && !isCompleted && (
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span>৪ ঘণ্টার বিরতি চলছে</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{cooldown.formatted} বাকি</span>
                      </div>
                    )}

                    {/* 5. Expiration Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <Calendar className="h-3 w-3 text-amber-400" />
                        <span>Expires: {camp.expiresAt}</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {camp.platform}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. View Details & 7. Participate Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDetailsModalCampaign(camp)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>

                  {isCompleted ? (
                    <button
                      disabled
                      title="ভিডিওটির নির্ধারিত লক্ষ্যমাত্রা পূর্ণ হওয়ায় ক্যাম্পেইন সম্পন্ন হয়েছে (Completed) এবং নতুন পার্টিসিপেশন বন্ধ রয়েছে"
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800/90 border border-slate-700/80 shadow-none flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>✓ Completed</span>
                    </button>
                  ) : isCooldownLocked ? (
                    <div className="flex items-center gap-1">
                      <button
                        disabled
                        title={`এই ভিডিওটি ৪ ঘণ্টার জন্য লক রয়েছে। ${cooldown.formatted} পর আবার দেখতে পারবেন।`}
                        className="flex-1 py-2 px-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800/90 border border-slate-700/80 shadow-none flex items-center justify-center gap-1 cursor-not-allowed opacity-80"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span className="truncate">{cooldown.formatted}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearVideoCooldown(camp.id);
                        }}
                        title="লক রিসেট করুন (Reset Lock)"
                        className="py-2 px-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-800/60 border border-amber-600/40 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔄
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => recordVideoWatchClick(camp.id)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Participate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Details Modal */}
      {detailsModalCampaign && (
        <Modal
          isOpen={true}
          onClose={() => setDetailsModalCampaign(null)}
          title={detailsModalCampaign.title}
          subtitle={`Promoted by ${detailsModalCampaign.vendorName} · Platform: ${detailsModalCampaign.platform.toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              {detailsModalCampaign.thumbnail && detailsModalCampaign.thumbnail.trim() !== '' ? (
                <img
                  src={detailsModalCampaign.thumbnail}
                  alt={detailsModalCampaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Play className="h-10 w-10 text-slate-600" />
              )}
              <div className="absolute top-3 left-3">
                <StatusBadge status={detailsModalCampaign.status} />
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded text-xs text-white font-mono">
                Duration: {detailsModalCampaign.durationSeconds}s
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Campaign Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {detailsModalCampaign.description || 'Join this promotional campaign to discover new creator content and voluntarily provide your valuable feedback, survey answers, or reviews.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Available Until</span>
                <span className="font-mono text-white font-bold">{detailsModalCampaign.expiresAt}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="text-purple-300 font-semibold">{detailsModalCampaign.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Audience</span>
                <span className="text-white font-mono">{detailsModalCampaign.geoTargets?.join(', ') || 'Global'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Platform</span>
                <span className="text-emerald-400 font-semibold uppercase">{detailsModalCampaign.platform}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-400" />
                <span>Earnable Activities for this Campaign:</span>
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Feedback Form:</span>
                  <span className="text-emerald-400 font-bold">+{settings.activityPoints?.feedback || 10} pts</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Comprehension Quiz:</span>
                  <span className="text-emerald-400 font-bold">+{settings.activityPoints?.quiz || 20} pts</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Preference Survey:</span>
                  <span className="text-emerald-400 font-bold">+{settings.activityPoints?.survey || 15} pts</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Verified Review:</span>
                  <span className="text-emerald-400 font-bold">+{settings.activityPoints?.review || 25} pts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailsModalCampaign(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
              {(() => {
                const modalTarget = Number(detailsModalCampaign.totalTargetWatchMinutes ?? 100);
                const modalWatched = Number(detailsModalCampaign.totalWatchedMinutes || 0);
                const isModalCompleted = detailsModalCampaign.status === 'completed' || (modalTarget > 0 && modalWatched >= modalTarget);

                const modalCooldown = getVideoCooldownRemaining(detailsModalCampaign.id);

                if (isModalCompleted) {
                  return (
                    <button
                      disabled
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 flex items-center gap-1.5 cursor-not-allowed opacity-80"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>✓ Completed (লক্ষ্য পূর্ণ)</span>
                    </button>
                  );
                }

                if (modalCooldown.isLocked) {
                  return (
                    <button
                      disabled
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 flex items-center gap-1.5 cursor-not-allowed opacity-80"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>৪ ঘণ্টা লক ({modalCooldown.formatted} বাকি)</span>
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    onClick={() => {
                      const id = detailsModalCampaign.id;
                      setDetailsModalCampaign(null);
                      recordVideoWatchClick(id);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Participate Now</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CampaignStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  Play, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface VendorMyCampaignsProps {
  forcedFilter?: CampaignStatus | 'all';
}

export const VendorMyCampaigns: React.FC<VendorMyCampaignsProps> = ({ forcedFilter }) => {
  const { campaigns, currentVendor, vendorPage, setVendorPage, deleteCampaign, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [previewCamp, setPreviewCamp] = useState<Campaign | null>(null);

  // Map route to filter
  let initialFilter = 'all';
  if (forcedFilter) {
    initialFilter = forcedFilter;
  } else if (vendorPage === 'pending-campaigns') {
    initialFilter = 'pending';
  } else if (vendorPage === 'approved-campaigns') {
    initialFilter = 'active';
  } else if (vendorPage === 'campaign-history') {
    initialFilter = 'expired';
  }

  const [activeTab, setActiveTab] = useState<string>(initialFilter);

  React.useEffect(() => {
    if (vendorPage === 'pending-campaigns') setActiveTab('pending');
    else if (vendorPage === 'approved-campaigns') setActiveTab('active');
    else if (vendorPage === 'campaign-history') setActiveTab('expired');
  }, [vendorPage]);

  const vendorCampaigns = campaigns.filter((c) => c.vendorId === currentVendor.id);

  // Auto-delete system: When total watched minutes reaches or exceeds target watch minutes, delete permanently
  React.useEffect(() => {
    vendorCampaigns.forEach((camp) => {
      const targetMins = camp.totalTargetWatchMinutes ? Number(camp.totalTargetWatchMinutes) : 0;
      const watchedMins = camp.totalWatchedMinutes ? Number(camp.totalWatchedMinutes) : 0;
      if (targetMins > 0 && watchedMins >= targetMins) {
        deleteCampaign(camp.id);
        showToast(
          `ভিডিও ক্যাম্পেইনের নির্ধারিত মোট সময়কাল (${targetMins} মিনিট) পূর্ণ হওয়ায় ভিডিওটি স্বয়ংক্রিয়ভাবে স্থায়ীভাবে মুছে ফেলা হয়েছে!`,
          'info'
        );
      }
    });
  }, [vendorCampaigns, deleteCampaign, showToast]);

  const filtered = vendorCampaigns.filter((c) => {
    const matchesSearch =
      (c.videoUrl && c.videoUrl.toLowerCase().includes(search.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(search.toLowerCase()));
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getHeading = () => {
    if (activeTab === 'pending') return 'Pending Campaigns (In Audit)';
    if (activeTab === 'active') return 'Active & Approved Campaigns';
    if (activeTab === 'expired') return 'Completed Campaign History';
    return 'All My Video Campaigns';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{getHeading()}</h1>
          <p className="text-xs text-slate-400">Track delivery metrics, watch progress, and audience engagement.</p>
        </div>

        <button
          onClick={() => setVendorPage('submit-campaign')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'active', 'pending', 'expired'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'expired' ? 'History' : tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No campaigns found matching this filter.
          </div>
        ) : (
          filtered.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-sm"
            >
              <div>
                <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                  {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                    <img
                      src={camp.thumbnail}
                      alt={camp.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="h-8 w-8 text-slate-600" />
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={camp.status} />
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 px-2 py-0.5 rounded text-[11px] font-mono text-purple-300">
                    +{camp.rewardPoints} pts
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* ১. ভিডিও লিংক বক্স (Screenshot 8 এর টেক্সট এর পরিবর্তে) */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                        <span>ভিডিও লিংক:</span>
                      </span>
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 font-mono font-bold">
                        {camp.platform}
                      </span>
                    </div>
                    <a
                      href={camp.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-purple-300 hover:text-purple-200 text-xs break-all line-clamp-2 block underline underline-offset-2 hover:underline transition-colors leading-relaxed"
                      title={camp.videoUrl}
                    >
                      {camp.videoUrl}
                    </a>
                  </div>

                  {/* ২. এবং ৩. পাশাপাশি দুই বক্স: ২. ভিডিও মোট কত মিনিট চলবে * এবং এখন পর্যন্ত কত মিনিট চলছে */}
                  {(() => {
                    const targetMinutes = Number(camp.totalTargetWatchMinutes ?? Math.max(1, Math.round((camp.targetViews * camp.durationSeconds) / 60)) ?? 100);
                    const watchedMinutes = Number(camp.totalWatchedMinutes || 0);
                    const percentComplete = Math.min(100, Math.round((watchedMinutes / Math.max(1, targetMinutes)) * 100));

                    return (
                      <div className="space-y-2.5 pt-0.5">
                        <div className="grid grid-cols-2 gap-2">
                          {/* বাম পাশের বক্স: ভিডিও মোট কত মিনিট চলব * */}
                          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-center space-y-1">
                            <span className="text-[10px] font-semibold text-purple-200 block leading-tight">
                              ভিডিও মোট কত মিনিট চলব *
                            </span>
                            <div className="font-mono font-extrabold text-sm text-white flex items-center justify-center gap-1">
                              <span>{targetMinutes.toLocaleString()}</span>
                              <span className="text-[10px] font-normal text-purple-400">মিনিট</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block">ভেন্ডোরের নির্ধারিত লক্ষ্য</span>
                          </div>

                          {/* ডান পাশের বক্স: এখন পর্যন্ত কত মিনিট চলছে */}
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
                            <span className="text-[10px] font-semibold text-emerald-200 block leading-tight">
                              এখন পর্যন্ত কত মিনিট চলছে
                            </span>
                            <div className="font-mono font-extrabold text-sm text-emerald-400 flex items-center justify-center gap-1">
                              <span>{watchedMinutes.toLocaleString()}</span>
                              <span className="text-[10px] font-normal text-emerald-300/80">মিনিট</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block">ইউজারদের দেখা সময়</span>
                          </div>
                        </div>

                        {/* মিনিট পূর্ণ হওয়ার প্রগ্রেস বার */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">লক্ষ্য অর্জনের অগ্রগতি</span>
                            <span className="font-mono text-[11px] font-bold text-slate-200 tabular-nums">
                              {watchedMinutes} / {targetMinutes} মিনিট ({percentComplete}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentComplete}%` }}
                            />
                          </div>

                          {(percentComplete >= 100 || camp.status === 'completed') ? (
                            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[10px] space-y-0.5">
                              <p className="font-bold flex items-center gap-1">
                                <span>✓ ক্যাম্পেইন সম্পন্ন হয়েছে (Completed)</span>
                              </p>
                              <p className="text-[9px] text-slate-300">
                                ভিডিওটির পার্টিসিপেশন বন্ধ রয়েছে। ২ দিন পর স্বয়ংক্রিয়ভাবে ফায়ারবেস থেকে ডিলিট হয়ে যাবে।
                              </p>
                            </div>
                          ) : (
                            <p className="text-[9px] text-slate-400 leading-tight">
                              ⚡ দুই বক্সের সংখ্যা সমান হলে ভিডিওর পার্টিসিপেশন স্বয়ংক্রিয়ভাবে ডিজেবল হয়ে যাবে এবং ২ দিন পর ফায়ারবেস থেকে ডিলিট হবে।
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspect Modal */}
      {previewCamp && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewCamp(null)}
          title={`Campaign: ${previewCamp.title}`}
          subtitle={`Platform: ${previewCamp.platform.toUpperCase()} · Status: ${previewCamp.status.toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="aspect-video rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
              {previewCamp.thumbnail && previewCamp.thumbnail.trim() !== '' ? (
                <img src={previewCamp.thumbnail} alt={previewCamp.title} className="w-full h-full object-cover" />
              ) : (
                <Play className="h-10 w-10 text-slate-600" />
              )}
            </div>

            {/* Video Link */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3 text-purple-400" />
                <span>ভিডিও লিংক (Public Video URL):</span>
              </span>
              <a
                href={previewCamp.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-purple-300 hover:text-purple-200 break-all underline block"
              >
                {previewCamp.videoUrl}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-purple-300 font-semibold block">ভিডিও মোট কত মিনিট চলব *</span>
                <p className="font-mono text-white text-base font-bold">
                  {(previewCamp.totalTargetWatchMinutes ?? Math.max(1, Math.round((previewCamp.targetViews * previewCamp.durationSeconds) / 60))).toLocaleString()} <span className="text-xs font-normal text-purple-400">মিনিট</span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-emerald-300 font-semibold block">এখন পর্যন্ত কত মিনিট চলছে</span>
                <p className="font-mono text-emerald-400 text-base font-bold">
                  {(Number(previewCamp.totalWatchedMinutes || 0)).toLocaleString()} <span className="text-xs font-normal text-emerald-300/80">মিনিট</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-400">Total Points Budget</span>
                <p className="font-mono text-white font-bold">{previewCamp.requiredTotalPoints || previewCamp.budgetTotal} pts</p>
              </div>
              <div>
                <span className="text-slate-400">Required Points</span>
                <p className="font-mono text-purple-300 font-bold">{previewCamp.requiredTotalPoints || 150} pts</p>
              </div>
              <div>
                <span className="text-slate-400">Target Views</span>
                <p className="font-mono text-white font-bold">{previewCamp.targetViews.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewCamp(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

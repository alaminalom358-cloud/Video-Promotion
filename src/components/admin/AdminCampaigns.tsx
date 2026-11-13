import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CampaignStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  Play, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  DollarSign, 
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Filter
} from 'lucide-react';

interface AdminCampaignsProps {
  forcedStatus?: CampaignStatus;
}

export const AdminCampaigns: React.FC<AdminCampaignsProps> = ({ forcedStatus }) => {
  const { campaigns, approveCampaign, rejectCampaign, toggleCampaignVisibility, adminPage, setAdminPage, deleteCampaign, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [rejectingCampaign, setRejectingCampaign] = useState<Campaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Content does not meet platform safety or clarity standards.');

  // Auto-delete system: When total watched minutes reaches or exceeds target watch minutes, delete permanently
  React.useEffect(() => {
    campaigns.forEach((camp) => {
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
  }, [campaigns, deleteCampaign, showToast]);

  // Determine effective status filter
  let effectiveStatus: string = 'all';
  if (forcedStatus) {
    effectiveStatus = forcedStatus;
  } else if (adminPage === 'pending-campaigns') {
    effectiveStatus = 'pending';
  } else if (adminPage === 'approved-campaigns') {
    effectiveStatus = 'approved';
  } else if (adminPage === 'active-campaigns') {
    effectiveStatus = 'active';
  } else if (adminPage === 'rejected-campaigns') {
    effectiveStatus = 'rejected';
  } else if (adminPage === 'expired-campaigns') {
    effectiveStatus = 'expired';
  }

  const [activeFilter, setActiveFilter] = useState<string>(effectiveStatus);

  // Sync if adminPage changes
  React.useEffect(() => {
    if (adminPage === 'pending-campaigns') setActiveFilter('pending');
    else if (adminPage === 'approved-campaigns') setActiveFilter('approved');
    else if (adminPage === 'active-campaigns') setActiveFilter('active');
    else if (adminPage === 'rejected-campaigns') setActiveFilter('rejected');
    else if (adminPage === 'expired-campaigns') setActiveFilter('expired');
  }, [adminPage]);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'all' || c.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getPageTitle = () => {
    switch (activeFilter) {
      case 'pending': return 'Pending Campaign Approvals';
      case 'approved': return 'Approved Campaigns (Scheduled / Ready)';
      case 'active': return 'Active Video Promotions';
      case 'rejected': return 'Rejected Campaigns Archive';
      case 'expired': return 'Expired / Completed Campaigns';
      default: return 'All Campaign Records';
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCampaign) return;
    rejectCampaign(rejectingCampaign.id, rejectionReason);
    setRejectingCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
          <p className="text-xs text-slate-400">Review video duration compliance, viewer reward points, and vendor budget limits.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['all', 'pending', 'approved', 'active', 'rejected', 'expired'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === s
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns by title, brand, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredCampaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No campaigns found matching filter.
          </div>
        ) : (
          filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-sm"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                  {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                    <img
                      src={camp.thumbnail}
                      alt={camp.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Play className="h-8 w-8 text-slate-600" />
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <StatusBadge status={camp.status} />
                    {camp.status === 'active' && camp.isVisibleToUsers === false && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                        OFF (ইউজার দেখতে পাবে না)
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono text-purple-300 border border-purple-500/30">
                    +{camp.rewardPoints} pts
                  </div>
                  <button
                    onClick={() => setPreviewCampaign(camp)}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <div className="h-10 w-10 rounded-full bg-purple-600/90 flex items-center justify-center shadow-lg">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-purple-300 font-semibold">{camp.vendorName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">ID: {camp.id}</span>
                  </div>

                  {camp.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <span>{camp.rejectionReason}</span>
                    </div>
                  )}

                  {/* ১. ভিডিও লিংক বক্স (Screenshot 10 অনুসারে) */}
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

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewCampaign(camp)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {camp.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveCampaign(camp.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingCampaign(camp)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {camp.status === 'approved' && (
                    <button
                      onClick={() => approveCampaign(camp.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Make Active
                    </button>
                  )}

                  {camp.status === 'active' && (
                    <>
                      {(() => {
                        const isVisible = camp.isVisibleToUsers !== false;
                        return (
                          <button
                            type="button"
                            onClick={() => toggleCampaignVisibility(camp.id)}
                            aria-pressed={isVisible}
                            title={
                              isVisible
                                ? 'ভিডিওটি বর্তমানে চালু (ON) আছে — অফ করলে ইউজার দেখতে পাবে না'
                                : 'ভিডিওটি বর্তমানে বন্ধ (OFF) আছে — অন করলে ইউজার দেখতে পারবে'
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35'
                                : 'bg-slate-800/90 hover:bg-slate-700 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                                isVisible ? 'bg-emerald-500' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                                  isVisible ? 'translate-x-3.5' : 'translate-x-0.5'
                                }`}
                              />
                            </span>
                            <span>{isVisible ? 'ON' : 'OFF'}</span>
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => setRejectingCampaign(camp)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-medium transition-colors cursor-pointer"
                        title="ভিডিও ডিলিট করুন"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Preview Modal */}
      {previewCampaign && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewCampaign(null)}
          title={`Campaign Preview: ${previewCampaign.title}`}
          subtitle={`Advertiser: ${previewCampaign.vendorName} · Platform: ${previewCampaign.platform.toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-black relative border border-slate-800 flex items-center justify-center">
              {previewCampaign.thumbnail && previewCampaign.thumbnail.trim() !== '' ? (
                <img
                  src={previewCampaign.thumbnail}
                  alt={previewCampaign.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="p-4 rounded-full bg-purple-600/90 text-white shadow-xl animate-pulse">
                  <Play className="h-8 w-8 fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded text-xs text-white font-mono">
                Duration: {previewCampaign.durationSeconds}s · Required Watch: {previewCampaign.requiredWatchSeconds}s
              </div>
            </div>

            {/* Video Link */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                <span>ভিডিও লিংক (Public Video URL):</span>
              </span>
              <a
                href={previewCampaign.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-purple-300 hover:text-purple-200 break-all underline block"
              >
                {previewCampaign.videoUrl}
              </a>
            </div>

            {/* Dual Boxes */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-purple-300 font-semibold block">ভিডিও মোট কত মিনিট চলব *</span>
                <p className="font-mono text-white text-base font-bold">
                  {(previewCampaign.totalTargetWatchMinutes ?? Math.max(1, Math.round((previewCampaign.targetViews * previewCampaign.durationSeconds) / 60))).toLocaleString()} <span className="text-xs font-normal text-purple-400">মিনিট</span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-emerald-300 font-semibold block">এখন পর্যন্ত কত মিনিট চলছে</span>
                <p className="font-mono text-emerald-400 text-base font-bold">
                  {(Number(previewCampaign.totalWatchedMinutes || 0)).toLocaleString()} <span className="text-xs font-normal text-emerald-300/80">মিনিট</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-400">Reward Per View</span>
                <p className="font-mono text-purple-400 font-bold mt-0.5">+{previewCampaign.rewardPoints} pts</p>
              </div>
              <div>
                <span className="text-slate-400">Total Budget</span>
                <p className="font-mono text-white font-bold mt-0.5">{previewCampaign.requiredTotalPoints || previewCampaign.budgetTotal} pts</p>
              </div>
              <div>
                <span className="text-slate-400">Target Views</span>
                <p className="font-mono text-white font-bold mt-0.5">{previewCampaign.targetViews.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Target Geos</span>
                <p className="font-mono text-white font-bold mt-0.5">{previewCampaign.geoTargets.join(', ')}</p>
              </div>
            </div>

            {previewCampaign.quizQuestion && (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1.5 text-xs">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" /> Anti-Bot Comprehension Challenge:
                </span>
                <p className="text-white font-medium">{previewCampaign.quizQuestion.question}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {previewCampaign.quizQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-1.5 rounded text-[11px] ${
                        i === previewCampaign.quizQuestion?.correctIndex
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {opt} {i === previewCampaign.quizQuestion?.correctIndex && '✓ (Correct)'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewCampaign(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Close Preview
              </button>
              {previewCampaign.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      const c = previewCampaign;
                      setPreviewCampaign(null);
                      setRejectingCampaign(c);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 cursor-pointer"
                  >
                    Reject & Delete
                  </button>
                  <button
                    onClick={() => {
                      approveCampaign(previewCampaign.id);
                      setPreviewCampaign(null);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                  >
                    Approve Immediately
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject & Delete Modal */}
      {rejectingCampaign && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingCampaign(null)}
          title={`Reject & Delete Video: ${rejectingCampaign.title.slice(0, 30)}...`}
          subtitle="ক্যাম্পেইন বাতিল করলে এই ভিডিওটি সিস্টেম ও ফায়ারবেস থেকে স্থায়ীভাবে ডিলিট হয়ে যাবে এবং ৩য় বক্সের পয়েন্ট ভেন্ডোরের ওয়ালেটে ফেরত যাবে।"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 space-y-2">
              <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-400" /> ভিডিওটি স্থায়ীভাবে ডিলিট করার বিবরণ:
              </p>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p>
                  ভেন্ডোর: <span className="text-white font-medium">{rejectingCampaign.vendorName}</span>
                </p>
                <p className="truncate">
                  ভিডিও লিংক: <span className="text-purple-300 font-mono">{rejectingCampaign.videoUrl}</span>
                </p>
                {rejectingCampaign.requiredTotalPoints && (
                  <p className="text-emerald-400 font-semibold">
                    ওয়ালেটে পয়েন্ট ফেরত (Refund): +{rejectingCampaign.requiredTotalPoints.toLocaleString()} পয়েন্ট
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">বাতিলের কারণ / মন্তব্য (Optional)</label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="ভিডিওর নীতিমালার সাথে সাংঘর্ষিক..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingCampaign(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-md shadow-rose-600/30"
              >
                ভিডিও ডিলিট নিশ্চিত করুন
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

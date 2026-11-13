import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, Star, ThumbsUp, Globe, Award, HelpCircle, Users } from 'lucide-react';

export const VendorFeedbackReports: React.FC = () => {
  const { campaigns, currentVendor } = useApp();
  const myCampaigns = campaigns.filter((c) => c.vendorId === currentVendor.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState(myCampaigns[0]?.id || 'camp-101');

  const selectedCampaign = myCampaigns.find((c) => c.id === selectedCampaignId) || myCampaigns[0];

  const viewerFeedbacks = [
    {
      user: 'Elena R.',
      country: 'US',
      rating: 5,
      comment: 'Incredible optical zoom clarity on the foldable test. Watched the whole breakdown twice!',
      time: '2 hours ago'
    },
    {
      user: 'Kai C.',
      country: 'SG',
      rating: 5,
      comment: 'Very informative technical walkthrough. Easy comprehension challenge.',
      time: '5 hours ago'
    },
    {
      user: 'Marcus V.',
      country: 'CA',
      rating: 4,
      comment: 'Great audio quality in the studio demonstration.',
      time: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audience Retention & Feedback Reports</h1>
          <p className="text-xs text-slate-400">Granular view-time completion drop-offs, user sentiment, and quiz comprehension analytics.</p>
        </div>

        {/* Campaign Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Select Campaign:</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white max-w-xs truncate"
          >
            {myCampaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Verified Completion Rate</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">92.4%</p>
          <p className="text-xs text-slate-400">Watched past required {selectedCampaign?.requiredWatchSeconds || 45}s mark</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Comprehension Quiz Pass Rate</span>
          <p className="text-3xl font-extrabold text-purple-400 font-mono">96.1%</p>
          <p className="text-xs text-slate-400">Confirmed viewer absorbed key message</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Viewer Satisfaction Score</span>
          <p className="text-3xl font-extrabold text-amber-400 font-mono">4.9 / 5.0</p>
          <p className="text-xs text-slate-400">Based on 1,420 community ratings</p>
        </div>
      </div>

      {/* 2-Column Grid: Retention Curve & Viewer Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Retention Curve: {selectedCampaign?.title.slice(0, 35)}...</h2>
            <span className="text-xs text-emerald-400 font-mono">Anti-Cheat Validated</span>
          </div>

          <div className="space-y-4">
            {[
              { point: '0s - Hook Phase', pct: 100 },
              { point: '15s - Intro Content', pct: 97 },
              { point: '30s - Key Feature Showcase', pct: 93 },
              { point: '45s - Required Threshold', pct: 92 },
              { point: '60s+ - Full Video Exploration', pct: 84 }
            ].map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono">{r.point}</span>
                  <span className="text-purple-300 font-mono font-bold">{r.pct}% retained</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Algorithmic Advantage:</p>
            <p className="text-[11px] mt-0.5">
              Sustained 90%+ retention in the first 45 seconds signals strong content authority to YouTube recommendation algorithms.
            </p>
          </div>
        </div>

        {/* Viewer Comments */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Viewer Feedback & Reactions</h2>
            <span className="text-xs text-slate-500 font-mono">Live Stream</span>
          </div>

          <div className="space-y-3">
            {viewerFeedbacks.map((fb, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{fb.user} ({fb.country})</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300">{fb.comment}</p>
                <span className="text-[10px] text-slate-500 block">{fb.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

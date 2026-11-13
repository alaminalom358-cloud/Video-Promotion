import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, Globe, PieChart, Users, CheckCircle, ShieldAlert } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { campaigns } = useApp();

  const platformDistribution = [
    { name: 'YouTube', percentage: 58, color: 'bg-red-500' },
    { name: 'TikTok', percentage: 24, color: 'bg-purple-500' },
    { name: 'Vimeo', percentage: 12, color: 'bg-blue-500' },
    { name: 'Instagram Reels', percentage: 6, color: 'bg-pink-500' }
  ];

  const retentionDropoff = [
    { time: '0s (Start)', retention: 100 },
    { time: '15s', retention: 96 },
    { time: '30s', retention: 91 },
    { time: '45s', retention: 88 },
    { time: '60s', retention: 84 },
    { time: '120s', retention: 79 }
  ];

  const geoBreakdown = [
    { country: 'United States', share: '44%', views: '15,312' },
    { country: 'United Kingdom', share: '18%', views: '6,264' },
    { country: 'Germany', share: '14%', views: '4,872' },
    { country: 'Canada', share: '12%', views: '4,176' },
    { country: 'Singapore & APAC', share: '12%', views: '4,176' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Reports & Analytics</h1>
          <p className="text-xs text-slate-400">Deep audience retention curves, video platform distributions, and fraud defense rates.</p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Average View Retention</span>
          <p className="text-3xl font-extrabold text-white font-mono tabular-nums">87.4%</p>
          <p className="text-xs text-emerald-400 font-mono">+4.2% vs industry average</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Quiz Pass Rate</span>
          <p className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums">94.1%</p>
          <p className="text-xs text-slate-400">Validates human comprehension</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Bot Farm Defense Ratio</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">99.9%</p>
          <p className="text-xs text-slate-400">Headless scrapers neutralized</p>
        </div>
      </div>

      {/* 2-Column Grid: Retention Curve & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention Drop-off Curve */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Audience Retention Drop-Off Curve</h2>
              <p className="text-[11px] text-slate-400">Aggregate percent of viewers maintaining active window focus</p>
            </div>
            <span className="text-xs font-mono text-purple-400">Verified Sessions</span>
          </div>

          <div className="space-y-3 pt-2">
            {retentionDropoff.map((point, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono">{point.time}</span>
                  <span className="text-white font-mono font-bold">{point.retention}% active</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${point.retention}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            Note: Platform requirement mandates &ge; 85% completion for full points credit.
          </p>
        </div>

        {/* Video Platform Share */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Campaign Platform Share</h2>
            <p className="text-[11px] text-slate-400">Distribution of video formats promoted</p>
          </div>

          <div className="space-y-4 pt-2">
            {platformDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-purple-300 font-mono font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <p className="text-slate-300 font-semibold">Top Performing Category:</p>
            <p className="text-purple-300">Consumer Tech & Gadgets (42% higher watch completion)</p>
          </div>
        </div>
      </div>

      {/* Geo Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white">Geographic Viewer Demographics</h2>
          <span className="text-xs text-slate-400 font-mono">180+ Countries Sampled</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Country / Territory</th>
                <th className="py-2.5 px-3 text-right">Traffic Share</th>
                <th className="py-2.5 px-3 text-right">Verified Video Views</th>
                <th className="py-2.5 px-3 text-right">Anti-Cheat Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {geoBreakdown.map((geo, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-purple-400" />
                    <span>{geo.country}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-300 font-bold">{geo.share}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{geo.views}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400">99.{8 - idx}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

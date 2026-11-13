import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Award, MessageSquare, HelpCircle, CheckSquare, Star, ArrowUpRight, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ActivityType } from '../../types';

export const UserActivities: React.FC = () => {
  const { activities, setUserPage, openCampaignDetail } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filtered = activities.filter((a) => {
    const matchesSearch =
      (a.campaignTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.activityName || '').toLowerCase().includes(search.toLowerCase());
    
    if (selectedType === 'all') return matchesSearch;
    return matchesSearch && a.activityType === selectedType;
  });

  const totalPointsEarned = activities.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
  const feedbackCount = activities.filter((a) => a.activityType === 'feedback').length;
  const quizCount = activities.filter((a) => a.activityType === 'quiz').length;
  const surveyCount = activities.filter((a) => a.activityType === 'survey').length;
  const reviewCount = activities.filter((a) => a.activityType === 'review').length;

  const getActivityBadge = (type?: ActivityType) => {
    switch (type) {
      case 'feedback':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MessageSquare className="h-3 w-3" />
            Feedback Form
          </span>
        );
      case 'quiz':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HelpCircle className="h-3 w-3" />
            Comprehension Quiz
          </span>
        );
      case 'survey':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckSquare className="h-3 w-3" />
            Market Survey
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="h-3 w-3" />
            Campaign Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Award className="h-3 w-3" />
            Activity
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">My Completed Activities</h1>
          <p className="text-xs text-slate-400">Audited log of your submitted feedback, quizzes, surveys, and reviews with rewarded points.</p>
        </div>
        <button
          onClick={() => setUserPage('discover')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Compass className="h-4 w-4" />
          <span>Discover Campaigns to Earn</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Total Activities Completed</p>
          <p className="text-2xl font-bold text-white font-mono">{activities.length} tasks</p>
          <p className="text-[11px] text-slate-500">Across active video campaigns</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Total Points Awarded</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">+{totalPointsEarned.toLocaleString()} pts</p>
          <p className="text-[11px] text-slate-500">Instant credit to available wallet</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Quizzes & Feedback</p>
          <p className="text-2xl font-bold text-purple-400 font-mono">{feedbackCount + quizCount} completed</p>
          <p className="text-[11px] text-slate-500">{quizCount} quizzes passed, {feedbackCount} feedback</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Surveys & Reviews</p>
          <p className="text-2xl font-bold text-blue-400 font-mono">{surveyCount + reviewCount} submitted</p>
          <p className="text-[11px] text-slate-500">{surveyCount} surveys, {reviewCount} reviews</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: `All (${activities.length})` },
            { id: 'feedback', label: `Feedback (${feedbackCount})` },
            { id: 'quiz', label: `Quizzes (${quizCount})` },
            { id: 'survey', label: `Surveys (${surveyCount})` },
            { id: 'review', label: `Reviews (${reviewCount})` }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedType(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedType === pill.id
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by campaign title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white">No activities found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't participated in any {selectedType !== 'all' ? selectedType : ''} activities yet. Visit Discover Campaigns to watch videos and submit activities!
            </p>
            <button
              onClick={() => setUserPage('discover')}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Campaigns</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-4">Completed Date</th>
                  <th className="py-3 px-4 text-right">Points Earned</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{act.id}</td>
                    <td className="py-3 px-4">
                      {getActivityBadge(act.activityType)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                      {act.campaignTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{act.watchedAt}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      +{act.pointsEarned} pts
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified & Awarded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

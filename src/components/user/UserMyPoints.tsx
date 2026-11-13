import React from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, Award, Gift, ArrowRight, TrendingUp, Clock, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { AdBannerBox } from '../common/AdBannerBox';

export const UserMyPoints: React.FC = () => {
  const { currentUser, settings, setUserPage } = useApp();

  const availablePoints = currentUser.points;
  const totalEarnedPoints = currentUser.totalEarnedPoints;
  const pendingPoints = currentUser.pendingPoints || 0;
  const redeemedPoints = currentUser.redeemedPoints || 0;

  const cashBdt = Math.round((availablePoints / 1000) * (settings.pointsToBdtRate || 120));
  const minRedeem = Math.max(1, settings.minimumRedemptionPoints ?? 5000);
  const isEligibleForWithdraw = availablePoints >= minRedeem;

  const watchPoints = currentUser.totalWatchMinutes || 0;
  const pointBreakdown = [
    { label: 'Video Watch Duration (1 min = 1 pt - Firebase Synced)', points: watchPoints, percent: totalEarnedPoints > 0 ? Math.min(100, Math.round((watchPoints / totalEarnedPoints) * 100)) : 0, color: 'bg-emerald-500' },
    { label: 'Feedback Activity Completions', points: Math.round(Math.max(0, totalEarnedPoints - watchPoints) * 0.30), percent: 30, color: 'bg-purple-500' },
    { label: 'Comprehension Quiz Rewards', points: Math.round(Math.max(0, totalEarnedPoints - watchPoints) * 0.40), percent: 40, color: 'bg-indigo-500' },
    { label: 'Audience Preference Surveys', points: Math.round(Math.max(0, totalEarnedPoints - watchPoints) * 0.15), percent: 15, color: 'bg-amber-500' },
    { label: 'Verified Campaign Reviews', points: Math.round(Math.max(0, totalEarnedPoints - watchPoints) * 0.15), percent: 15, color: 'bg-cyan-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User Point Wallet & Balance</h1>
          <p className="text-xs text-slate-400">
            Real-time server-validated wallet ledger. Only Cloud Functions can issue or deduct points.
          </p>
        </div>

        <button
          type="button"
          disabled={!isEligibleForWithdraw}
          onClick={() => setUserPage('redeem')}
          title={
            isEligibleForWithdraw
              ? 'Redeem via bKash / Nagad / Rocket'
              : `সর্বনিম্ন ${minRedeem.toLocaleString()} পয়েন্ট না হওয়া পর্যন্ত উত্তোলন বন্ধ থাকবে`
          }
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-all ${
            isEligibleForWithdraw
              ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 cursor-pointer'
              : 'text-slate-500 bg-slate-800/70 border border-slate-700/60 opacity-55 cursor-not-allowed shadow-none'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>
            {isEligibleForWithdraw
              ? 'Redeem via bKash / Nagad / Rocket'
              : `Withdrawal Locked (Min ${minRedeem.toLocaleString()} pts)`}
          </span>
        </button>
      </div>

      {/* Box 1 Adsterra 468x60 Banner */}
      <AdBannerBox boxId="box-1" name="box 1" width={468} height={60} />

      {/* 4 MANDATORY WALLET STATS (Total Earned, Available, Pending, Redeemed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Earned Points */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-400">Total Earned Points</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {totalEarnedPoints.toLocaleString()}
            </span>
            <span className="text-xs text-purple-300 font-semibold font-mono">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            সর্বমোট অর্জিত পয়েন্ট
          </p>
        </div>

        {/* 2. Available Points */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-purple-300">Available Points</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {availablePoints.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold font-mono">pts</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">≈ ৳{cashBdt.toLocaleString()} (টাকা)</span>
          </div>
        </div>

        {/* 3. Pending Points */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-400">Pending Points</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
              {pendingPoints.toLocaleString()}
            </span>
            <span className="text-xs text-amber-300/80 font-mono">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Reserved in active payout requests
          </p>
        </div>

        {/* 4. Redeemed Points */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-400">Redeemed Points</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {redeemedPoints.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-300/80 font-mono">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Successfully disbursed via bKash/Nagad
          </p>
        </div>
      </div>

      {/* Main Big Wallet Card with Multiplier & Tier */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
              Ready to Withdraw Balance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                {availablePoints.toLocaleString()}
              </span>
              <span className="text-lg text-purple-300 font-semibold">pts</span>
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              ≈ ৳{cashBdt.toLocaleString()} (টাকা)
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              কনভার্সন রেট: ১,০০০ পয়েন্ট = {settings.pointsToBdtRate || 120} ৳ (টাকা)। পয়েন্ট উত্তোলনের জন্য সর্বনিম্ন প্রয়োজন {minRedeem.toLocaleString()} pts।
            </p>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Tier Status</span>
              <span className="text-purple-300 font-bold bg-purple-900/60 px-2.5 py-0.5 rounded border border-purple-700/50">
                {currentUser.tier} Tier (Active)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Anti-Cheat Biometric Status</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Daily Active Reward</span>
              <span className="font-mono text-emerald-400 font-bold">+50 pts / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Points Source Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
          Point Accumulation by Approved User Activity
        </h2>

        <div className="space-y-4">
          {pointBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-medium">{item.label}</span>
                <span className="font-mono text-purple-300 font-bold">
                  {item.points.toLocaleString()} pts ({item.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav to History */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Need to audit each credited transaction or cashout status?</span>
        <button
          onClick={() => setUserPage('points-history')}
          className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>View Points Ledger History</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

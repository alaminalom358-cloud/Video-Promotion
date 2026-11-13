import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, DollarSign, Award, Sliders, CheckCircle2, MessageSquare, HelpCircle, CheckSquare, Star, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

export const AdminPoints: React.FC = () => {
  const { settings, updateSettings, transactions, users, showToast } = useApp();
  
  const [pointsToUsdRate, setPointsToUsdRate] = useState(settings.pointsToUsdRate || 1000);
  const [pointsToBdtRate, setPointsToBdtRate] = useState(settings.pointsToBdtRate || 120);
  const [minRedeem, setMinRedeem] = useState(settings.minimumRedemptionPoints ?? 5000);
  
  // Activity Points
  const [feedbackPts, setFeedbackPts] = useState(settings.activityPoints?.feedback ?? 10);
  const [quizPts, setQuizPts] = useState(settings.activityPoints?.quiz ?? 20);
  const [surveyPts, setSurveyPts] = useState(settings.activityPoints?.survey ?? 15);
  const [reviewPts, setReviewPts] = useState(settings.activityPoints?.review ?? 25);

  // Video Duration & Welcome Bonus
  const [signupBonus, setSignupBonus] = useState(settings.signupBonus ?? 0);
  const [pointsPerMinute, setPointsPerMinute] = useState(settings.pointsPerMinuteDefault ?? 1);

  const [rateSaved, setRateSaved] = useState(false);

  useEffect(() => {
    setPointsToUsdRate(settings.pointsToUsdRate || 1000);
    setPointsToBdtRate(settings.pointsToBdtRate || 120);
    setMinRedeem(settings.minimumRedemptionPoints ?? 5000);
    setFeedbackPts(settings.activityPoints?.feedback ?? 10);
    setQuizPts(settings.activityPoints?.quiz ?? 20);
    setSurveyPts(settings.activityPoints?.survey ?? 15);
    setReviewPts(settings.activityPoints?.review ?? 25);
    setSignupBonus(settings.signupBonus ?? 0);
    setPointsPerMinute(settings.pointsPerMinuteDefault ?? 1);
  }, [settings]);

  const handleSaveEconomy = (e: React.FormEvent) => {
    e.preventDefault();
    const safeMinRedeem = Math.max(100, Number(minRedeem) || 5000);
    setMinRedeem(safeMinRedeem);
    updateSettings({
      pointsToUsdRate,
      pointsToBdtRate,
      minimumRedemptionPoints: safeMinRedeem,
      signupBonus,
      pointsPerMinuteDefault: pointsPerMinute,
      activityPoints: {
        feedback: feedbackPts,
        quiz: quizPts,
        survey: surveyPts,
        review: reviewPts,
      }
    });
    setRateSaved(true);
    showToast(`সর্বনিম্ন উত্তোলন সীমা (${safeMinRedeem.toLocaleString()} পয়েন্ট) এবং পয়েন্টের নিয়ম সফলভাবে সেভ হয়েছে!`, 'success');
    setTimeout(() => setRateSaved(false), 3000);
  };

  const totalPointsCirculating = users.reduce((acc, u) => acc + (u.points || 0), 0);
  const totalPendingPoints = users.reduce((acc, u) => acc + (u.pendingPoints || 0), 0);
  const totalRedeemedPoints = users.reduce((acc, u) => acc + (u.redeemedPoints || 0), 0);
  
  const totalCirculatingBdt = ((totalPointsCirculating / 1000) * pointsToBdtRate).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Points & Activity Reward Configuration</h1>
          <p className="text-xs text-slate-400">Configure reward valuations for user activities, MFS exchange rates (bKash/Nagad/Rocket), and redemption thresholds.</p>
        </div>
      </div>

      {/* Economy Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Available in User Wallets</p>
            <Coins className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalPointsCirculating.toLocaleString()} pts</p>
          <p className="text-[11px] text-purple-400 font-mono">≈ ৳{Number(totalCirculatingBdt).toLocaleString()} BDT</p>
        </div>
        
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Locked in Pending Cashouts</p>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{totalPendingPoints.toLocaleString()} pts</p>
          <p className="text-[11px] text-slate-400 font-mono">≈ ৳{((totalPendingPoints / 1000) * pointsToBdtRate).toFixed(0)} BDT</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Total Redeemed Points</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{totalRedeemedPoints.toLocaleString()} pts</p>
          <p className="text-[11px] text-slate-400 font-mono">Paid out through MFS & Gateways</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Min Redemption Gate</p>
            <Sliders className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 font-mono">{minRedeem.toLocaleString()} pts</p>
          <p className="text-[11px] text-slate-400 font-mono">= ৳{((minRedeem / 1000) * pointsToBdtRate).toFixed(0)} BDT</p>
        </div>
      </div>

      {/* Activity Reward Valuation Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Activity Reward Point Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Define points awarded per verified user task on approved video campaigns.</p>
          </div>
          {rateSaved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved Successfully
            </span>
          )}
        </div>

        <form onSubmit={handleSaveEconomy} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feedback Points */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  Feedback Form
                </span>
                <span className="text-[11px] text-purple-400 font-mono font-bold">+{feedbackPts} pts</span>
              </div>
              <input
                type="number"
                min="1"
                max="500"
                value={feedbackPts}
                onChange={(e) => setFeedbackPts(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500">Points awarded when user submits structured feedback answers.</p>
            </div>

            {/* Quiz Points */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                  Comprehension Quiz
                </span>
                <span className="text-[11px] text-purple-400 font-mono font-bold">+{quizPts} pts</span>
              </div>
              <input
                type="number"
                min="1"
                max="500"
                value={quizPts}
                onChange={(e) => setQuizPts(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500">Points awarded when user passes campaign comprehension quiz.</p>
            </div>

            {/* Survey Points */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  Market Survey
                </span>
                <span className="text-[11px] text-purple-400 font-mono font-bold">+{surveyPts} pts</span>
              </div>
              <input
                type="number"
                min="1"
                max="500"
                value={surveyPts}
                onChange={(e) => setSurveyPts(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500">Points awarded when user completes audience demographic survey.</p>
            </div>

            {/* Review Points */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  Campaign Review
                </span>
                <span className="text-[11px] text-purple-400 font-mono font-bold">+{reviewPts} pts</span>
              </div>
              <input
                type="number"
                min="1"
                max="500"
                value={reviewPts}
                onChange={(e) => setReviewPts(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500">Points awarded when user submits a verified review & rating.</p>
            </div>
          </div>

          {/* Currency Conversion Rates */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>Currency Exchange & Payout Conversion Rates</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">BDT Rate per 1,000 Points (bKash/Nagad/Rocket)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-pink-400 font-mono">৳</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    step="5"
                    value={pointsToBdtRate}
                    onChange={(e) => setPointsToBdtRate(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">1,000 pts = {pointsToBdtRate} BDT. Example: {minRedeem.toLocaleString()} pts = {((minRedeem / 1000) * pointsToBdtRate).toFixed(0)} BDT.</p>
              </div>



              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">
                  Minimum Withdrawal Points (সর্বনিম্ন উত্তোলন পয়েন্ট সীমা)
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  value={minRedeem}
                  onChange={(e) => setMinRedeem(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  এখানে যে পয়েন্ট সেট করবেন (যেমন ৪০০০ বা ৫০০০), ইউজার প্যানেলে <span className="text-purple-300 font-semibold">"সর্ব নিম্ন {minRedeem.toLocaleString()} পয়েন্ট হলে উত্তোলন করা যাবে"</span> দেখাবে এবং ঐ পয়েন্ট পূর্ণ না হওয়া পর্যন্ত <span className="text-rose-400 font-semibold">Withdrawal</span> বাটনটি বন্ধ (OFF) থাকবে।
                </p>
              </div>
            </div>

            {/* Video Watch Time & Signup Bonus Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 mt-4 border-t border-slate-800/80">
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>New User Welcome Bonus (নতুন ইউজার বোনাস)</span>
                  <span className="text-[11px] text-purple-400 font-mono font-bold">+{signupBonus} pts</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="10"
                  value={signupBonus}
                  onChange={(e) => setSignupBonus(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  ডিফল্ট 0 পয়েন্ট। যদি আপনি কোনো বোনাস দেন, নতুন একাউন্ট খোলার সাথে সাথে ইউজার সেই বোনাস পাবে।
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Watch Duration Points Rate (ওয়াচ টাইম পয়েন্ট)</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">{pointsPerMinute} pt / min</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={pointsPerMinute}
                  onChange={(e) => setPointsPerMinute(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  প্রতি ১ মিনিট ভিডিও দেখলে ইউজার ১টি পয়েন্ট পাবে (১ মিনিট = ১ পয়েন্ট)। ফায়ারবেজে প্রতি ইউজারের আইডি অনুযায়ী জমা হবে।
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              Save Points & Economic Rules
            </button>
          </div>
        </form>
      </div>

      {/* System Transaction Audit Ledger */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">System Point Transactions Audit Trail</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{transactions.length} recorded entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-400">{tx.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{tx.userId}</td>
                  <td className="py-3 px-4 uppercase text-[10px] font-mono text-purple-300">
                    {tx.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-white max-w-xs truncate">{tx.description}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    <span className={tx.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{tx.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      tx.status === 'credited' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      tx.status === 'debited' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-slate-400 bg-slate-500/10 border-slate-500/20'
                    }`}>
                      {tx.status}
                    </span>
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

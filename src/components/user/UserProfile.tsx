import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Coins, 
  Share2, 
  Copy, 
  Award, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Wallet,
  Users
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('elena.rostova@paypal.me');
  const [cryptoAddress, setCryptoAddress] = useState('0x71C8A39F220B...8B39');

  const referralCode = 'ELENA99';
  const referralLink = `https://promoview.io/join?ref=${referralCode}`;

  const copyRefLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard! Share to earn 500 pts per friend.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Payout preferences saved successfully.', 'success');
  };

  const tiers = [
    { name: 'Bronze', multiplier: '1.0x', requiredWatched: 0, current: false },
    { name: 'Silver', multiplier: '1.1x', requiredWatched: 25, current: false },
    { name: 'Gold', multiplier: '1.2x', requiredWatched: 100, current: true },
    { name: 'Diamond', multiplier: '1.5x', requiredWatched: 250, current: false }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">User Profile & Referral Center</h1>
        <p className="text-xs text-slate-400">Manage account credentials, payout addresses, and referral commission earnings.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 border-2 border-purple-500/40 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-lg shadow-md">
            <img src="/flower_avatar.jpg" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Award className="h-3 w-3" />
                {currentUser.tier} Tier Earner
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser.email} · {currentUser.country} · Member since {currentUser.joinedDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Wallet Points</span>
            <p className="font-mono text-purple-400 font-bold text-sm mt-0.5">
              {currentUser.points.toLocaleString()} pts
            </p>
          </div>
          <div>
            <span className="text-slate-400">Lifetime Earned</span>
            <p className="font-mono text-white font-bold text-sm mt-0.5">
              {currentUser.totalEarnedPoints.toLocaleString()} pts
            </p>
          </div>
          <div>
            <span className="text-slate-400">Videos Completed</span>
            <p className="font-mono text-emerald-400 font-bold text-sm mt-0.5">
              {currentUser.totalVideosWatched} videos
            </p>
          </div>
        </div>
      </div>

      {/* Referral Program Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple-400" />
              <span>Invite Friends & Earn Referral Commissions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Earn <span className="text-purple-300 font-semibold">+500 Points</span> for every friend who joins and watches their first 3 video premieres.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            12 Friends Joined (+6,000 pts)
          </span>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="font-mono text-xs text-slate-300 flex-1 truncate">{referralLink}</span>
          <button
            onClick={copyRefLink}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Tier Multipliers */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="h-4 w-4 text-purple-400" />
          <span>Loyalty Multiplier Tiers</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                t.current
                  ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30'
                  : 'bg-slate-950/60 border-slate-800 opacity-70'
              }`}
            >
              <p className="text-xs font-bold text-white">{t.name}</p>
              <p className="text-lg font-mono font-extrabold text-purple-300">{t.multiplier}</p>
              <p className="text-[10px] text-slate-400">{t.requiredWatched}+ videos</p>
              {t.current && (
                <span className="inline-block text-[9px] font-mono text-emerald-400 font-semibold uppercase">
                  Active Tier
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Saved Payout Accounts Form */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Wallet className="h-4 w-4 text-purple-400" />
          <span>Saved Payout Destinations</span>
        </h3>

        <form onSubmit={handleSaveAccounts} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ডিফল্ট উত্তোলন মাধ্যম (Default Method)</label>
              <input
                type="text"
                value={paypalEmail}
                placeholder="bKash / Nagad / Rocket"
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">মোবাইল ব্যাংকিং অ্যাকাউন্ট নম্বর</label>
              <input
                type="text"
                value={cryptoAddress}
                placeholder="01XXXXXXXXX"
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Save Payout Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Coins, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  TrendingUp, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { TutorialVideoBox } from '../common/TutorialVideoBox';

export const HowItWorksPage: React.FC = () => {
  const { setRole, setVendorPage, setUserPage, setPublicPage, lang } = useApp();
  const [activeTab, setActiveTab] = useState<'advertiser' | 'viewer'>('advertiser');
  const [budgetSlider, setBudgetSlider] = useState<number>(500);
  const [dailyHours, setDailyHours] = useState<number>(1.5);

  const isBn = lang === 'bn';

  // Estimations
  const estimatedViews = Math.round((budgetSlider / 0.25));
  const estimatedWatchMinutes = Math.round(estimatedViews * 0.75);

  const estimatedMonthlyPoints = Math.round(dailyHours * 60 * (200 / 0.5) * 30 * 0.1); 
  const estimatedMonthlyCash = (estimatedMonthlyPoints / 1000).toFixed(2);

  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header (Screenshot 32) */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isBn 
              ? 'স্বচ্ছ ভিডিও প্রমোশন এবং ভেরিফিকেশন ব্যবস্থা' 
              : 'Transparent Video Promotion and Verification'}
          </h1>
          <p className="text-base text-slate-300">
            {isBn
              ? 'জানুন কীভাবে বিজ্ঞাপনদাতারা আসল দর্শকের কাছে পৌঁছান এবং কীভাবে দর্শকরা ভিডিও দেখে আয় করেন।'
              : 'Learn how advertisers reach high-intent audiences and how viewers monetize their attention.'}
          </p>

          {/* Interactive Mode Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('advertiser')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'advertiser'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'বিজ্ঞাপনদাতা ও ক্রিয়েটরদের জন্য' : 'For Advertisers & Creators'}
            </button>
            <button
              onClick={() => setActiveTab('viewer')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'দর্শক ও উপার্জনকারীদের জন্য' : 'For Viewers & Earners'}
            </button>
          </div>
        </div>

        {/* How It Works Tutorial Video Box */}
        <TutorialVideoBox />

        {/* Dynamic Workflow (Screenshot 33) */}
        {activeTab === 'advertiser' ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-purple-400">
                  {isBn ? 'ধাপ ১' : 'Step 1'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'ক্যাম্পেইন তৈরি করুন' : 'Create Campaign'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'আপনার ইউটিউব, টিকটক বা ভিমিও ভিডিওর লিংক দিন। নির্ধারিত সময়কাল (১৫ সেকেন্ড থেকে ১৮০ সেকেন্ড) ও প্রতি ভিউয়ের জন্য পয়েন্ট রিওয়ার্ড সেট করুন।'
                    : 'Provide your YouTube, TikTok, or Vimeo URL. Choose target duration (15s to 180s) and set points reward per view.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-purple-400">
                  {isBn ? 'ধাপ ২' : 'Step 2'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'এআই অ্যান্টি-ফ্রড ভেরিফিকেশন' : 'AI Anti-Fraud Verification'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'আমাদের সিস্টেম সক্রিয় ট্যাব ফোকাস, অনন্য ডিভাইস ফিঙ্গারপ্রিন্ট এবং প্রশ্নের মাধ্যমে আসল মানুষের দেখা নিশ্চিত করে।'
                    : 'Our system verifies tab focus, device fingerprint uniqueness, and optional comprehension questions to confirm real human viewing.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-purple-400">
                  {isBn ? 'ধাপ ৩' : 'Step 3'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'অ্যালগরিদম গ্রোথ ও অ্যানালিটিক্স' : 'Algorithmic Lift & Analytics'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'উচ্চ অডিয়েন্স রিটেনশন ইউটিউব এবং টিকটক অ্যালগরিদমকে সংকেত দেয় যে আপনার কনটেন্ট জনপ্রিয়, যা অর্গানিক রিকমেন্ডেশন বাড়িয়ে দেয়।'
                    : 'High audience retention signals to YouTube and TikTok algorithms that your content is engaging, prompting organic recommendations.'}
                </p>
              </div>
            </div>

            {/* Reach Calculator */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isBn ? 'ইন্টারেক্টিভ ক্যাম্পেইন রিচ ক্যালকুলেটর' : 'Interactive Campaign Reach Calculator'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'আনুমানিক ওয়াচ টাইম এবং যাচাইকৃত ভিউ হিসেব করুন' : 'Estimate human watch time and verified completions'}
                  </p>
                </div>
                <Sliders className="h-5 w-5 text-purple-400" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">
                    {isBn ? 'টার্গেট বাজেট (পয়েন্ট)' : 'Target Budget (Points)'}
                  </span>
                  <span className="text-purple-300 font-mono font-bold text-sm">
                    {budgetSlider.toLocaleString()} {isBn ? 'পয়েন্ট' : 'pts'}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(Number(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'আনুমানিক যাচাইকৃত ভিউ' : 'Estimated Verified Views'}
                  </p>
                  <p className="text-2xl font-bold text-white font-mono">{estimatedViews.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'আনুমানিক ওয়াচ টাইম' : 'Estimated Watch Time'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">
                    {estimatedWatchMinutes.toLocaleString()} {isBn ? 'মিনিট' : 'mins'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setRole('vendor'); setVendorPage('submit-campaign'); }}
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isBn ? 'এই ক্যাম্পেইন চালু করুন' : 'Launch This Campaign'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-indigo-400">
                  {isBn ? 'ধাপ ১' : 'Step 1'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'পছন্দের ভিডিও বেছে নিন' : 'Pick What You Love'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'গেমিং ট্রেইলার, গ্যাজেট আনবক্সিং, মিউজিক ও টেক টিউটোরিয়াল থেকে সর্বোচ্চ পয়েন্টের ভিডিও বেছে নিন।'
                    : 'Browse gaming trailers, gadget unboxings, music premieres, and tech tutorials sorted by highest point rewards.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-indigo-400">
                  {isBn ? 'ধাপ ২' : 'Step 2'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'কাউন্টডাউন শেষ হওয়া পর্যন্ত দেখুন' : 'Watch Until Countdown Reaches Zero'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'ব্রাউজারে ভিডিওটি সক্রিয় রাখুন। রিওয়ার্ড দাবি করতে সহজ ১-ক্লিক কনফার্মেশন সম্পন্ন করুন।'
                    : 'Keep the video active in your browser. Answer a 1-click confirmation challenge to claim your reward.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-indigo-400">
                  {isBn ? 'ধাপ ৩' : 'Step 3'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {isBn ? 'দৈনিক ক্যাশআউট করুন' : 'Cashout Daily'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isBn
                    ? 'বিকাশ, নগদ বা রকেটের মাধ্যমে সরাসরি আপনার মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা উত্তোলন করুন।'
                    : 'Withdraw to bKash, Nagad, or Rocket. Fast automated processing directly to your mobile banking account.'}
                </p>
              </div>
            </div>

            {/* Viewer Earnings Calculator */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isBn ? 'মাসিক আনুমানিক রিওয়ার্ড আয়' : 'Estimated Monthly Viewer Rewards'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'নিয়মিত ভিডিও দেখা ও স্ট্রিক বোনাসের ওপর ভিত্তি করে' : 'Based on standard engagement and streak bonuses'}
                  </p>
                </div>
                <Coins className="h-5 w-5 text-indigo-400" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">
                    {isBn ? 'দৈনিক দেখার সময়' : 'Daily Watch Time'}
                  </span>
                  <span className="text-indigo-300 font-mono font-bold text-sm">
                    {dailyHours} {isBn ? 'ঘণ্টা/দিন' : 'Hours/Day'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'মাসিক আনুমানিক পয়েন্ট' : 'Estimated Points / Month'}
                  </p>
                  <p className="text-2xl font-bold text-white font-mono">{estimatedMonthlyPoints.toLocaleString()} {isBn ? 'পয়েন্ট' : 'pts'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'আনুমানিক ক্যাশআউট মূল্য' : 'Estimated Cashout Value'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">≈ ৳{Math.round((estimatedMonthlyPoints / 1000) * 115).toLocaleString()} BDT</p>
                </div>
              </div>

              <button
                onClick={() => { setRole('user'); setUserPage('discover'); }}
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isBn ? 'আজই দেখা ও আয় শুরু করুন' : 'Start Watching Today'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

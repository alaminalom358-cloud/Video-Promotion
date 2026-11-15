import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Award, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Coins, 
  Users, 
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { TutorialVideoBox } from '../common/TutorialVideoBox';

export const HomePage: React.FC = () => {
  const { campaigns, openCampaignDetail, setRole, setVendorPage, setUserPage, setPublicPage, lang, settings } = useApp();

  const isBn = lang === 'bn';
  const minWithdraw = Math.max(1, settings.minimumRedemptionPoints ?? 5000);
  const toBnDigits = (val: number | string) =>
    String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active' && c.isVisibleToUsers !== false).slice(0, 3);

  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen">
      {/* Hero Section (Screenshot 30) */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>
                  {isBn 
                    ? 'নেক্সট-জেন ভিডিও প্রমোশন ও নিশ্চিত ওয়াচ-টাইম রিওয়ার্ডস' 
                    : 'Next-Gen Video Promotion & Guaranteed Watch-Time Rewards'}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
                {isBn ? (
                  <>
                    প্রকৃত মানব সম্পৃক্ততায় ভিডিও গ্রোথ বৃদ্ধি করুন{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
                      আসল দর্শকের অ্যাক্টিভ ভিউ
                    </span>
                  </>
                ) : (
                  <>
                    Accelerate Video Growth with{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
                      Real Human Engagement
                    </span>
                  </>
                )}
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                {isBn
                  ? 'বিজ্ঞাপনদাতারা পান নিশ্চিত সম্পূর্ণ ভিডিও ভিউ, জালিয়াতিমুক্ত রিটেনশন এবং আসল ব্র্যান্ড পরিচিতি। আর দর্শকরা পছন্দের ভিডিও দেখে মোবাইল ব্যাংকিংয়ের মাধ্যমে নগদ অর্থ ও রিওয়ার্ড অর্জন করেন।'
                  : 'Advertisers get guaranteed video completions, fraud-proof retention curves, and genuine brand recall. Viewers discover curated video premieres and earn real cash, crypto, and gift cards.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => { setRole('vendor'); setVendorPage('submit-campaign'); }}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{isBn ? 'ভিডিও ক্যাম্পেইন শুরু করুন' : 'Launch Video Campaign'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => { setRole('user'); setUserPage('discover'); }}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 text-purple-400 fill-purple-400" />
                  <span>{isBn ? 'ভিডিও দেখুন এবং আয় করুন' : 'Start Watching & Earning'}</span>
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{isBn ? 'শতভাগ বট-মুক্ত আসল ট্রাফিক' : 'Zero Bot Traffic Guarantee'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{isBn ? 'তাৎক্ষণিক পয়েন্ট পে-আউট' : 'Instant Point Payouts'}</span>
                </div>
              </div>
            </div>

            {/* Right Media Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/30 bg-slate-900/80">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/src/assets/images/hero_video_platform_1793714103286.jpg"
                    alt="Video Analytics Studio"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-transparent to-black/20" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium text-purple-300 border border-purple-500/30 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{isBn ? 'লাইভ ভেরিফিকেশন ইঞ্জিন' : 'Live Verification Engine'}</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">{isBn ? 'সক্রিয় অডিয়েন্স পুল' : 'Active Audience Pool'}</p>
                      <p className="text-sm font-bold text-white font-mono tabular-nums">
                        {isBn ? '৪৮২,৯১০ যাচাইকৃত দর্শক' : '482,910 Verified Viewers'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{isBn ? 'কমপ্লিশন রেট' : 'Completion Rate'}</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">96.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Strip */}
      <section className="bg-slate-950/70 border-b border-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">14.8M+</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {isBn ? 'মোট দেখা মিনিট' : 'Minutes Watched'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums">50M+ pts</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {isBn ? 'বিতরণকৃত রিওয়ার্ড' : 'Rewards Distributed'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">99.4%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {isBn ? 'অডিয়েন্স রিটেনশন' : 'Audience Retention'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">4,200+</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {isBn ? 'সম্পন্ন ক্যাম্পেইন' : 'Campaigns Completed'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Campaigns */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {isBn ? 'বিশেষ ভিডিও ক্যাম্পেইনসমূহ' : 'Featured Promoted Videos'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {isBn ? 'সেরা রিওয়ার্ডের বিশেষ ভিডিওসমূহ' : 'Premieres Earning Top Rewards Today'}
            </h2>
          </div>
          <button
            onClick={() => { setRole('user'); setUserPage('discover'); }}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>{isBn ? 'সব লাইভ ক্যাম্পেইন দেখুন' : 'Explore All 24+ Live Campaigns'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="group rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-950 flex items-center justify-center">
                  {camp.thumbnail && camp.thumbnail.trim() !== '' ? (
                    <img
                      src={camp.thumbnail}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Play className="h-8 w-8 text-slate-600" />
                  )}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold text-white uppercase tracking-wider">
                    {camp.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-purple-950/90 backdrop-blur-sm border border-purple-500/40 px-2.5 py-1 rounded text-xs font-bold text-purple-300 font-mono">
                    +{camp.rewardPoints} Pts
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {camp.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{camp.vendorName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{camp.requiredWatchSeconds}{isBn ? ' সেকেন্ড প্রয়োজন' : 's required'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => openCampaignDetail(camp.id)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>
                    {isBn 
                      ? `দেখুন এবং ${camp.rewardPoints} পয়েন্ট অর্জন করুন` 
                      : `Watch & Claim ${camp.rewardPoints} Points`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / 4-Step Mechanism */}
      <section className="py-20 bg-slate-950 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {isBn ? 'স্বচ্ছ প্ল্যাটফর্ম কাঠামো' : 'Transparent Architecture'}
            </span>
            <h2 className="text-3xl font-bold text-white">
              {isBn ? 'প্ল্যাটফর্মটি যেভাবে কাজ করে' : 'How The Platform Delivers Value'}
            </h2>
            <p className="text-sm text-slate-400">
              {isBn
                ? 'একটি ভারসাম্যপূর্ণ ইকোসিস্টেম যেখানে বিজ্ঞাপনদাতার বাজেট মধ্যস্বত্বভোগী ছাড়া সরাসরি যাচাইকৃত দর্শকদের পুরস্কৃত করে।'
                : 'A balanced ecosystem where advertiser budgets directly reward verified viewers with zero intermediary waste.'}
            </p>
          </div>

          <div className="mb-12">
            <TutorialVideoBox />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <p className="text-xs font-mono text-purple-400 font-semibold">
                {isBn ? '০১. ক্যাম্পেইন সেটআপ' : '01. Setup Campaign'}
              </p>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'ভিডিও লিংক দিন ও ওয়াচ টাইম নির্ধারণ করুন' : 'Paste Video URL & Set Watch Time'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBn
                  ? 'ইউটিউব, টিকটক বা ভিমিও ভিডিও সংযুক্ত করুন। প্রয়োজনীয় দেখার সময়কাল ও লক্ষ্য নির্ধারণ করুন।'
                  : 'Connect YouTube, TikTok, or Vimeo videos. Define required watch duration and set target audience geography.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-xs font-mono text-purple-400 font-semibold">
                {isBn ? '০২. অ্যাডমিন রিভিউ' : '02. Admin Review'}
              </p>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'নিরাপত্তা ও নীতিমালা অডিট' : 'Safety & Compliance Audit'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBn
                  ? 'স্বয়ংক্রিয় ইন্টিগ্রিটি চেক এবং অ্যাডমিন রিভিউ নিশ্চিত করে ব্র্যান্ড-নিরাপদ ও কপিরাইট-মুক্ত প্রচার।'
                  : 'Promoview automated integrity checks and admin review ensure brand-safe, copyright-cleared media promotions.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Eye className="h-6 w-6" />
              </div>
              <p className="text-xs font-mono text-purple-400 font-semibold">
                {isBn ? '০৩. আসল ওয়াচ ভেরিফিকেশন' : '03. Real Watch Verification'}
              </p>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'জালিয়াতি রোধে সক্রিয় ট্যাব ট্র্যাকিং' : 'Anti-Cheat Active Tab Tracking'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBn
                  ? 'দর্শকদের ব্রাউজারে সক্রিয় মনোযোগ রাখতে হয় এবং প্রশ্নের উত্তরের মাধ্যমে বাস্তব উপস্থিতি যাচাই করা হয়।'
                  : 'Viewers must maintain active focus with optional comprehension questions to confirm real human immersion.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Coins className="h-6 w-6" />
              </div>
              <p className="text-xs font-mono text-purple-400 font-semibold">
                {isBn ? '০৪. তাৎক্ষণিক রিওয়ার্ড' : '04. Instant Rewards'}
              </p>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'বিকাশ, নগদ ও রকেটে উত্তোলন' : 'Redeem via bKash, Nagad & Rocket'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBn
                  ? 'ভিডিও দেখা সম্পন্ন হওয়ার সাথে সাথে পয়েন্ট যোগ হয়। ব্যবহারকারীরা সরাসরি বিকাশ, নগদ বা রকেটে টাকা তুলতে পারেন।'
                  : 'Points credit immediately upon completion. Users redeem directly via bKash, Nagad, or Rocket accounts.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Bento Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Advertisers */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                {isBn ? 'ব্র্যান্ড ও কনটেন্ট ক্রিয়েটরদের জন্য' : 'For Brands & Content Creators'}
              </span>
              <h3 className="text-2xl font-bold text-white">
                {isBn ? 'নিশ্চিত ভিডিও রিচ ও অ্যালগরিদম গ্রোথ' : 'Guaranteed Video Reach & Algorithmic Lift'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isBn
                  ? 'সাধারণ ব্যানারের মতো মানুষ স্ক্রোল করে এড়িয়ে যায় না, প্রমোভিউ দেয় গভীর ওয়াচ-টাইম যা ইউটিউব সার্চ ও টিকটক রিকমেন্ডেশন বাড়ায়।'
                  : 'Unlike traditional banner ads that get scrolled past, Promoview delivers focused video watch-time that boosts YouTube search rankings and TikTok recommendation feeds.'}
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{isBn ? 'গড় ৮৫% এর বেশি অডিয়েন্স রিটেনশন রেট' : 'Audience retention curves exceeding 85% average'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{isBn ? 'প্রোডাক্টের মূল বার্তা যাচাইয়ের জন্য কাস্টম প্রশ্ন' : 'Custom comprehension quiz to enforce key product messages'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{isBn ? 'রিয়েল-টাইম জিও-রিপোর্টিং ও ড্রপ-অফ মেট্রিক্স' : 'Real-time geo-demographic reporting & drop-off metrics'}</span>
              </li>
            </ul>

            <button
              onClick={() => { setRole('vendor'); setVendorPage('submit-campaign'); }}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>{isBn ? 'ভেন্ডর পোর্টাল দেখুন' : 'Explore Vendor Portal'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* For Viewers */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {isBn ? 'দর্শক ও ক্রিয়েটরদের জন্য' : 'For Viewers & Creators'}
              </span>
              <h3 className="text-2xl font-bold text-white">
                {isBn ? 'আপনার অবসর স্ক্রিন টাইমকে আয়ে রূপান্তর করুন' : 'Monetize Your Everyday Screen Time'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isBn
                  ? 'আপনার বিনোদনের সময়কে রূপান্তর করুন আয়ের উৎসে। যেকোনো ডিভাইসে নতুন গেমিং ট্রেইলার, গ্যাজেট আনবক্সিং দেখে তাৎক্ষণিক রিওয়ার্ড পান।'
                  : 'Turn your entertainment breaks into tangible income. Watch new gaming trailers, tech unboxings, and music videos on any device and get rewarded instantly.'}
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{isBn ? 'দৈনিক লগইন স্ট্রিক ও লয়্যালটি গুণক বোনাস (২ গুণ পর্যন্ত)' : 'Daily login streaks and loyalty tier multipliers (up to 2x)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{isBn ? `বিকাশ, নগদ বা রকেটের মাধ্যমে মাত্র ${toBnDigits(minWithdraw.toLocaleString('en-US'))} পয়েন্ট থেকে উত্তোলন` : `Redeem starting from ${minWithdraw.toLocaleString()} points via bKash, Nagad, or Rocket`}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{isBn ? 'কোনো বিরক্তিকর বিজ্ঞাপন বা ক্ষতিকর অ্যাপ ইনস্টলের ঝামেলা নেই' : 'No invasive ads or intrusive app installations'}</span>
              </li>
            </ul>

            <button
              onClick={() => { setRole('user'); setUserPage('discover'); }}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>{isBn ? 'ইউজার রিওয়ার্ডস দেখুন' : 'Explore User Rewards'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-[#0B1021] border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            {isBn ? 'আপনার ভিডিও গ্রোথ বৃদ্ধি করতে প্রস্তুত?' : 'Ready to Supercharge Your Video Strategy?'}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            {isBn 
              ? '১২,০০০+ ক্রিয়েটর, মিডিয়া এজেন্সি এবং ৫ লাখের বেশি দর্শকের সাথে যুক্ত হোন।' 
              : 'Join over 12,000 creators, media agencies, and half a million viewers worldwide.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => setPublicPage('register')}
              className="px-6 py-3 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isBn ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}
            </button>
            <button
              onClick={() => setPublicPage('contact')}
              className="px-6 py-3 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
            >
              {isBn ? 'যোগাযোগ করুন' : 'Contact Sales Team'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

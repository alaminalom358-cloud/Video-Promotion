import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Target, Users, Zap, Globe, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { lang } = useApp();
  const isBn = lang === 'bn';

  return (
    <div className="bg-[#0B1021] text-slate-100 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header (Screenshot 31) */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            {isBn ? 'প্রমোভিউ সম্পর্কে' : 'About Promoview'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isBn 
              ? 'আসল মানবিক মনোযোগের মূল্যায়নে ভিডিও ডিস্ট্রিবিউশনের নতুন দিগন্ত' 
              : 'Redefining Video Distribution Through Rewarded Human Attention'}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {isBn
              ? '২০২৪ সালে প্রতিষ্ঠিত, প্রমোভিউ ডিজিটাল বিজ্ঞাপনের সবচেয়ে বড় ব্যর্থতা দূর করতে তৈরি হয়েছে: বিজ্ঞাপনে কোটি কোটি টাকা খরচ হলেও যা কেউ সত্যিকার অর্থে দেখে না।'
              : 'Founded in 2024, Promoview was built to solve digital advertising’s greatest failure: billions spent on programmatic ads that nobody truly watches.'}
          </p>
        </div>

        {/* Mission & Vision Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isBn ? 'আমাদের লক্ষ্য' : 'Our Mission'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isBn
                ? 'আমরা ক্রিয়েটর এবং ব্র্যান্ডগুলোকে আসল ওয়াচ-টাইম এবং অর্গানিক অ্যালগরিদম গ্রোথ অর্জনে সহায়তা করি, যা বিজ্ঞাপনী বাজেটকে সরাসরি সেই আসল দর্শকদের কাছে পৌঁছে দেয় যারা মনোযোগ দিয়ে ভিডিও দেখেন।'
                : 'We empower creators and brands to attain authentic video watch-time, real search index velocity, and organic algorithmic boost by directly distributing marketing capital back to real viewers who pay genuine attention.'}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isBn ? 'জালিয়াতি প্রতিরোধ দর্শন' : 'Anti-Cheat Philosophy'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isBn
                ? 'আমরা ভুয়া বট ফার্ম, ব্যাকগ্রাউন্ড ট্যাব ট্র্যাকার এবং স্ক্র্যাপার সম্পূর্ণরূপে প্রত্যাখ্যান করি। আমাদের উন্নত টেলিম্যাট্রি নিশ্চিত করে প্রতিটি ব্যয়িত অর্থের বিনিময়ে আসল মানুষের দৃষ্টি ও মনোযোগ পাওয়া যায়।'
                : 'We reject fraudulent bot farms, headless browser scrapers, and background-tab tabulators. Our multi-factor behavioral telemetry ensures every dollar spent corresponds to a verified pair of human eyes.'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold text-white font-mono">180+</p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'সক্রিয় দেশ' : 'Countries Active'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-purple-400 font-mono">99.8%</p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'পে-আউট সন্তুষ্টি' : 'Payout Satisfaction'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-mono">42ms</p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'টেলিম্যাট্রি লেটেন্সি' : 'Telemetry Latency'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">100%</p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'ব্র্যান্ড-নিরাপদ মিডিয়া' : 'Brand-Safe Media'}
              </p>
            </div>
          </div>
        </div>

        {/* Team Leadership */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {isBn ? 'নেতৃত্ব' : 'Leadership'}
            </span>
            <h2 className="text-2xl font-bold text-white">
              {isBn ? 'মিডিয়া ও অ্যাডটেক বিশেষজ্ঞদের দ্বারা নির্মিত' : 'Built by Media & AdTech Veterans'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full overflow-hidden border-2 border-purple-500/40">
                <img
                  src="/flower_avatar.jpg"
                  alt="Diana Vance"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Diana Vance</h3>
                <p className="text-xs text-purple-400">
                  {isBn ? 'প্রধান নির্বাহী কর্মকর্তা (সিইও)' : 'Chief Executive Officer'}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'স্ট্রিমফোর্জের ভিডিও গ্রোথ সাবেক প্রধান, অডিয়েন্স অ্যাকুইজিশনে ১২ বছরের অভিজ্ঞতা।'
                  : 'Ex-Head of Video Growth at StreamForge, 12 years in audience acquisition.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full overflow-hidden border-2 border-purple-500/40 bg-slate-800 flex items-center justify-center text-xl font-bold text-purple-300">
                KR
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kevin Richter</h3>
                <p className="text-xs text-purple-400">
                  {isBn ? 'প্রধান প্রযুক্তি কর্মকর্তা (সিটিও)' : 'Chief Technology Officer'}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'অ্যান্টি-ফ্রড নিউরাল নেটওয়ার্ক বিশেষজ্ঞ প্রাক্তন প্রিন্সিপাল এমএল ইঞ্জিনিয়ার।'
                  : 'Former Principal ML Engineer specializing in anti-fraud graph neural networks.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full overflow-hidden border-2 border-purple-500/40 bg-slate-800 flex items-center justify-center text-xl font-bold text-purple-300">
                SL
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sarah Lin</h3>
                <p className="text-xs text-purple-400">
                  {isBn ? 'ভিপি অব ট্রাস্ট অ্যান্ড কমপ্লায়েন্স' : 'VP of Trust & Compliance'}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আমাদের সার্বক্ষণিক ক্যাম্পেইন অডিট ডেস্ক এবং বিশ্বব্যাপী কপিরাইট যাচাই তত্ত্বাবধান করেন।'
                  : 'Oversees our 24/7 campaign audit desk and global copyright clearance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

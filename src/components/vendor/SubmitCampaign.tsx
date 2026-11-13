import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VideoPlatform, Campaign } from '../../types';
import { Save, CheckCircle2 } from 'lucide-react';

export const SubmitCampaign: React.FC = () => {
  const { addCampaign, setVendorPage, currentVendor, deductVendorPoints, showToast } = useApp();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [platform, setPlatform] = useState<VideoPlatform>('youtube');
  const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=sample-premiere-99');
  
  // Bengali numerals to English numerals conversion
  const toEnglishDigits = (str: string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (match) => bengaliDigits.indexOf(match).toString());
  };

  // ৩ টি বক্স (কি-বোর্ড দিয়ে টাইপ করার জন্য স্ট্রিং স্টেট ও কনভার্সন):
  // ১. ভিডিও কত মিনিট লম্বা
  const [videoLengthInput, setVideoLengthInput] = useState<string>('3');
  // ২. ভিডিও মোট কত মিনিট চলবে
  const [totalWatchInput, setTotalWatchInput] = useState<string>('100');
  // ৩. কত পয়েন্ট প্রয়োজন (১ মিনিটের = ১.৫ পয়েন্ট লাগবে)
  const [requiredPointsInput, setRequiredPointsInput] = useState<string>('150');

  const handleVideoLengthChange = (raw: string) => {
    const converted = toEnglishDigits(raw);
    const cleaned = converted.replace(/[^0-9.]/g, '');
    setVideoLengthInput(cleaned);
  };

  const handleTotalMinutesChange = (raw: string) => {
    const converted = toEnglishDigits(raw);
    const cleaned = converted.replace(/[^0-9.]/g, '');
    setTotalWatchInput(cleaned);
    if (cleaned && !isNaN(Number(cleaned))) {
      const mins = parseFloat(cleaned);
      const calculatedPts = Number((mins * 1.5).toFixed(1));
      setRequiredPointsInput(String(calculatedPts));
    } else {
      setRequiredPointsInput('');
    }
  };

  const handleRequiredPointsChange = (raw: string) => {
    const converted = toEnglishDigits(raw);
    const cleaned = converted.replace(/[^0-9.]/g, '');
    setRequiredPointsInput(cleaned);
    if (cleaned && !isNaN(Number(cleaned))) {
      const pts = parseFloat(cleaned);
      const calculatedMins = Math.round(pts / 1.5);
      setTotalWatchInput(String(calculatedMins));
    } else {
      setTotalWatchInput('');
    }
  };

  // গানিতিক ও সাবমিটের জন্য নিউমেরিক মান
  const numericVideoLength = Math.max(1, parseFloat(videoLengthInput) || 1);
  const numericTotalWatch = Math.max(1, parseFloat(totalWatchInput) || 1);
  const numericRequiredPoints = Math.max(1.5, parseFloat(requiredPointsInput) || Number((numericTotalWatch * 1.5).toFixed(1)));

  const handleSaveToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl || videoUrl.trim() === '') {
      showToast('অনুগ্রহ করে Public Video URL প্রদান করুন।', 'error');
      return;
    }

    // ভেন্ডোর ব্যালেন্স চেক: ৩ নম্বর বক্সের পয়েন্ট খরচের জন্য পর্যাপ্ত ব্যালেন্স আছে কিনা
    const currentBalance = currentVendor.balance || 0;
    if (currentBalance < numericRequiredPoints) {
      showToast(
        `অপর্যাপ্ত পয়েন্ট ব্যালেন্স! এই ক্যাম্পেইনের জন্য ৩য় বক্স অনুযায়ী ${numericRequiredPoints} পয়েন্ট প্রয়োজন, কিন্তু আপনার ওয়ালেটে আছে মাত্র ${Math.round(currentBalance)} পয়েন্ট। অনুগ্রহ করে সাইডবার থেকে পয়েন্ট সংগ্রহ করুন।`,
        'error'
      );
      return;
    }

    setIsSaving(true);
    try {
      const getYouTubeEmbedId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : '';
      };

      const ytId = getYouTubeEmbedId(videoUrl);
      const finalThumbnail = ytId 
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
        : '/src/assets/images/hero_video_platform_1793714103286.jpg';

      const finalTitle = `${currentVendor.companyName || 'Vendor'} Video Campaign (${numericVideoLength} মিনিট)`;

      // ৩ নম্বর বক্স অনুযায়ী পয়েন্ট কর্তন করা
      const deducted = await deductVendorPoints(
        numericRequiredPoints,
        `Campaign creation points cost (${numericRequiredPoints} pts for ${numericTotalWatch} mins)`
      );

      if (!deducted) {
        setIsSaving(false);
        return;
      }

      // Complete campaign data saved to Firebase Firestore under currentVendor.id
      const campaignData: Omit<Campaign, 'id' | 'createdAt' | 'currentViews' | 'budgetSpent'> = {
        title: finalTitle,
        vendorId: currentVendor.id,
        vendorName: currentVendor.companyName || 'Vendor',
        platform,
        videoUrl: videoUrl.trim(),
        thumbnail: finalThumbnail,
        category: 'Tech',
        durationSeconds: numericVideoLength * 60,
        requiredWatchSeconds: Math.min(numericVideoLength * 60, 60),
        videoLengthMinutes: Number(numericVideoLength),
        totalTargetWatchMinutes: Number(numericTotalWatch),
        totalWatchedMinutes: 0,
        pointsPerMinute: 1.5,
        requiredTotalPoints: Number(numericRequiredPoints),
        rewardPoints: Math.round(Number(numericRequiredPoints) / Math.max(1, Number(numericTotalWatch) / Number(numericVideoLength))),
        budgetTotal: Math.max(10, Math.round(Number(numericRequiredPoints) / 10)),
        targetViews: Math.max(1, Math.round(Number(numericTotalWatch) / Number(numericVideoLength))),
        status: 'pending',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        geoTargets: ['Global']
      };

      // Saves into Firebase Firestore and broadcasts to real-time state
      addCampaign(campaignData);

      showToast(
        `ক্যাম্পেইনের সব তথ্য সফলভাবে ফায়ারবেজে সেভ হয়েছে এবং আপনার ওয়ালেট থেকে ${numericRequiredPoints} পয়েন্ট বাদ দেওয়া হয়েছে! বর্তমান ব্যালেন্স: ${Math.round(currentBalance - numericRequiredPoints)} পয়েন্ট।`,
        'success'
      );
      setVendorPage('pending-campaigns');
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      showToast(err?.message || 'ক্যাম্পেইন সেভ করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Create & Submit Video Campaign</h1>
        <p className="text-xs text-slate-400">
          আপনার ভিডিওর লিংক ও সময়কাল প্রদান করে ফায়ারবেজে ক্যাম্পেইন সেভ করুন।
        </p>
      </div>

      {/* Campaign Form Container */}
      <form onSubmit={handleSaveToFirebase} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        {/* 1. Video Hosting Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Video Hosting Platform *</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as VideoPlatform)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
          >
            <option value="youtube">YouTube (Standard / Shorts)</option>
            <option value="tiktok">TikTok Video</option>
            <option value="vimeo">Vimeo Pro</option>
            <option value="instagram">Instagram Reels</option>
            <option value="x">X (Twitter) Media</option>
          </select>
        </div>

        {/* 2. Public Video URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Public Video URL *</label>
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 font-mono"
          />
          <p className="text-[11px] text-slate-500">
            Enter your public video link. The video player and discovery preview are synchronized automatically.
          </p>
        </div>

        {/* ৩ টি বক্স: স্ক্রীনশট বক্সের নিচে */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-4 shadow-lg">
          <div className="border-b border-purple-900/40 pb-2">
            <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              ⏱️ ভিডিও সময়কাল ও পয়েন্ট কনফিগারেশন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* ১ম বক্স: ভিডিও কত মিনিট লম্বা */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block">
                ১. ভিডিও কত মিনিট লম্বা *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={videoLengthInput}
                  onChange={(e) => handleVideoLengthChange(e.target.value)}
                  placeholder="উদাঃ 3"
                  className="w-full px-3 py-2 pr-12 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-purple-300 font-medium">মিনিট</span>
              </div>
              <p className="text-[10px] text-slate-400">
                ভিডিওর মোট দৈর্ঘ্য ({numericVideoLength * 60} সেকেন্ড)
              </p>
            </div>

            {/* ২য় বক্স: ভিডিও মোট কত মিনিট চলব */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block">
                ভিডিও মোট কত মিনিট চলব *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={totalWatchInput}
                  onChange={(e) => handleTotalMinutesChange(e.target.value)}
                  placeholder="উদাঃ 100"
                  className="w-full px-3 py-2 pr-12 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-purple-300 font-medium">মিনিট</span>
              </div>
              <p className="text-[10px] text-slate-400">
                ইউজাররা মোট যত মিনিট ভিডিও দেখবে
              </p>
            </div>

            {/* ৩য় বক্স: ভিডিও মোট মিনিট চলার জন্য কত পয়েন্ট প্রয়োজন (১ মিনিটের = ১.৫ পয়েন্ট লাগবে) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-amber-500/40">
              <label className="text-xs font-semibold text-amber-300 block">
                ৩. কত পয়েন্ট প্রয়োজন *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={requiredPointsInput}
                  onChange={(e) => handleRequiredPointsChange(e.target.value)}
                  placeholder="উদাঃ 150"
                  className="w-full px-3 py-2 pr-14 rounded-lg bg-slate-900 border border-amber-500/50 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-amber-400 font-bold">পয়েন্ট</span>
              </div>
              <p className="text-[10px] text-amber-400/90 font-mono">
                {numericTotalWatch} মিনিট × ১.৫ = {numericRequiredPoints} পয়েন্ট
              </p>
            </div>
          </div>

          {/* পয়েন্ট কর্তন সামারি ও ব্যালেন্স স্ট্যাটাস */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">বর্তমান ওয়ালেট ব্যালেন্স</span>
                <span className="font-mono font-bold text-white text-sm">
                  {Math.round(currentVendor.balance || 0).toLocaleString()} <span className="text-[10px] text-purple-300">পয়েন্ট</span>
                </span>
              </div>
              <span className="text-slate-600">→</span>
              <div>
                <span className="text-amber-400 block text-[11px]">৩য় বক্সের খরচ (কর্তন)</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  -{numericRequiredPoints.toLocaleString()} <span className="text-[10px]">পয়েন্ট</span>
                </span>
              </div>
              <span className="text-slate-600">→</span>
              <div>
                <span className="text-slate-400 block text-[11px]">সেভ করার পর অবশিষ্ট</span>
                <span className={`font-mono font-bold text-sm ${
                  (currentVendor.balance || 0) >= numericRequiredPoints ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {Math.max(0, Math.round((currentVendor.balance || 0) - numericRequiredPoints)).toLocaleString()} <span className="text-[10px]">পয়েন্ট</span>
                </span>
              </div>
            </div>

            {(currentVendor.balance || 0) < numericRequiredPoints && (
              <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                ⚠️ অপর্যাপ্ত ব্যালেন্স
              </span>
            )}
          </div>
        </div>

        {/* SAVE Button */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving || (currentVendor.balance || 0) < numericRequiredPoints}
            className="px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'SAVE'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

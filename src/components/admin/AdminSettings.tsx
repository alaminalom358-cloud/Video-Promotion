import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Shield, Sliders, Globe, Lock, Save, CheckCircle2, Server, CreditCard, Award, Smartphone, Megaphone, ExternalLink, Sparkles, Zap, Bell, Clock, Play } from 'lucide-react';
import { VideoPlatform } from '../../types';
import { AdBannerBox } from '../common/AdBannerBox';
import { VideoSocialBarOverlay } from '../common/VideoSocialBarOverlay';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    contactEmail: settings.contactEmail,
    antiBotWatchTolerancePercent: settings.antiBotWatchTolerancePercent,
    maintenanceMode: settings.maintenanceMode,
    allowedPlatforms: [...settings.allowedPlatforms],
    pointsToBdtRate: settings.pointsToBdtRate || 120,
    pointsToUsdRate: settings.pointsToUsdRate || 1000,
    minimumRedemptionPoints: settings.minimumRedemptionPoints ?? 5000,
  });

  // box -1 Advertisement Banner State (height: 60px, width: 468px) — always starts empty with faint sample placeholder
  const [adBox1Link, setAdBox1Link] = useState('');
  const [adBox1Target, setAdBox1Target] = useState('');
  const [adBox1Enabled, setAdBox1Enabled] = useState(settings.adBox1?.enabled !== false);

  // Box No-2 Advertisement Banner State (height: 250px, width: 300px)
  const [adBox2Link, setAdBox2Link] = useState('');
  const [adBox2Target, setAdBox2Target] = useState('');
  const [adBox2Enabled, setAdBox2Enabled] = useState(settings.adBox2?.enabled !== false);

  // Link Box-2: Adsterra Social Bar & Popunder State (Video Box Top-Right, 5-min interval)
  const [socialBarLink, setSocialBarLink] = useState('');
  const [socialBarTarget, setSocialBarTarget] = useState('');
  const [socialBarEnabled, setSocialBarEnabled] = useState(settings.socialBarAd?.enabled !== false);

  useEffect(() => {
    if (settings.adBox1) {
      setAdBox1Enabled(settings.adBox1.enabled !== false);
    }
  }, [settings.adBox1]);

  useEffect(() => {
    if (settings.adBox2) {
      setAdBox2Enabled(settings.adBox2.enabled !== false);
    }
  }, [settings.adBox2]);

  useEffect(() => {
    if (settings.socialBarAd) {
      setSocialBarEnabled(settings.socialBarAd.enabled !== false);
    }
  }, [settings.socialBarAd]);

  useEffect(() => {
    if (typeof settings.minimumRedemptionPoints === 'number') {
      setFormData((prev) => ({
        ...prev,
        minimumRedemptionPoints: settings.minimumRedemptionPoints
      }));
    }
  }, [settings.minimumRedemptionPoints]);

  const togglePlatform = (p: VideoPlatform) => {
    setFormData((prev) => {
      const exists = prev.allowedPlatforms.includes(p);
      const updated = exists
        ? prev.allowedPlatforms.filter((item) => item !== p)
        : [...prev.allowedPlatforms, p];
      return { ...prev, allowedPlatforms: updated };
    });
  };

  const handleSaveAdBox1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedLink = adBox1Link.trim();
    if (!trimmedLink) {
      showToast('বক্সে কোনো তথ্য দেওয়া হয়নি! সেভ করতে আগে এ্যাডের লিংক বা কোড দিন।', 'error');
      return;
    }
    updateSettings({
      adBox1: {
        adLink: trimmedLink,
        targetUrl: adBox1Target.trim(),
        enabled: true,
        updatedAt: new Date().toISOString()
      }
    });
    setAdBox1Link('');
    setAdBox1Target('');
    showToast('Link Box-1 (Adsterra ৪৬৮×৬০) সফলভাবে ফায়ারবেসে সেভ হয়েছে এবং বক্স খালি করা হয়েছে!', 'success');
  };

  const handleSaveAdBox2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedLink = adBox2Link.trim();
    if (!trimmedLink) {
      showToast('বক্সে কোনো তথ্য দেওয়া হয়নি! সেভ করতে আগে Box No-2 এর লিংক বা কোড দিন।', 'error');
      return;
    }
    updateSettings({
      adBox2: {
        adLink: trimmedLink,
        targetUrl: adBox2Target.trim(),
        enabled: true,
        updatedAt: new Date().toISOString()
      }
    });
    setAdBox2Link('');
    setAdBox2Target('');
    showToast('Box No-2 (Adsterra ৩০০×২৫০) সফলভাবে ফায়ারবেসে সেভ হয়েছে এবং বক্স খালি করা হয়েছে!', 'success');
  };

  const handleSaveSocialBar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedLink = socialBarLink.trim();
    if (!trimmedLink) {
      showToast('বক্সে কোনো তথ্য দেওয়া হয়নি! সেভ করতে আগে Social Bar বা Popunder লিংক দিন।', 'error');
      return;
    }
    updateSettings({
      socialBarAd: {
        adLink: trimmedLink,
        targetUrl: socialBarTarget.trim(),
        enabled: true,
        updatedAt: new Date().toISOString()
      }
    });
    setSocialBarLink('');
    setSocialBarTarget('');
    showToast('Adsterra Social Bar / Popunder সফলভাবে ফায়ারবেসে সেভ হয়েছে এবং বক্স খালি করা হয়েছে!', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextAdBox1 = adBox1Link.trim()
      ? {
          adLink: adBox1Link.trim(),
          targetUrl: adBox1Target.trim(),
          enabled: adBox1Enabled,
          updatedAt: new Date().toISOString()
        }
      : settings.adBox1;

    const nextAdBox2 = adBox2Link.trim()
      ? {
          adLink: adBox2Link.trim(),
          targetUrl: adBox2Target.trim(),
          enabled: adBox2Enabled,
          updatedAt: new Date().toISOString()
        }
      : settings.adBox2;

    const nextSocialBar = socialBarLink.trim()
      ? {
          adLink: socialBarLink.trim(),
          targetUrl: socialBarTarget.trim(),
          enabled: socialBarEnabled,
          updatedAt: new Date().toISOString()
        }
      : settings.socialBarAd;

    updateSettings({
      siteName: formData.siteName,
      contactEmail: formData.contactEmail,
      antiBotWatchTolerancePercent: formData.antiBotWatchTolerancePercent,
      maintenanceMode: formData.maintenanceMode,
      allowedPlatforms: formData.allowedPlatforms,
      pointsToBdtRate: formData.pointsToBdtRate,
      pointsToUsdRate: formData.pointsToUsdRate,
      minimumRedemptionPoints: Math.max(100, Number(formData.minimumRedemptionPoints) || 5000),
      ...(nextAdBox1 ? { adBox1: nextAdBox1 } : {}),
      ...(nextAdBox2 ? { adBox2: nextAdBox2 } : {}),
      ...(nextSocialBar ? { socialBarAd: nextSocialBar } : {})
    });

    if (adBox1Link.trim()) {
      setAdBox1Link('');
      setAdBox1Target('');
    }
    if (adBox2Link.trim()) {
      setAdBox2Link('');
      setAdBox2Target('');
    }
    if (socialBarLink.trim()) {
      setSocialBarLink('');
      setSocialBarTarget('');
    }

    showToast('Platform settings successfully saved.', 'success');
  };

  const allPlatforms: { id: VideoPlatform; label: string }[] = [
    { id: 'youtube', label: 'YouTube (Official Player - Phase 4 Voluntary Discovery)' },
    { id: 'tiktok', label: 'TikTok Video Posts' },
    { id: 'vimeo', label: 'Vimeo Pro Players' },
    { id: 'instagram', label: 'Instagram Reels' },
    { id: 'x', label: 'X (Twitter) Media Cards' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Website & System Settings</h1>
          <p className="text-xs text-slate-400">Configure global platform metadata, MFS cashout channels, and security parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Metadata */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="h-4 w-4 text-purple-400" />
            <span>Platform Branding & General</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Site Title</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Primary Support Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Platform Maintenance Mode</p>
              <p className="text-[11px] text-slate-400">Temporarily pauses campaign submissions and user activity reward payouts for maintenance.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* MFS Payment Gateways (bKash, Nagad, Rocket) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>MFS Payment Gateways (Bangladesh)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center border border-pink-500/30">
                  bK
                </div>
                <div>
                  <p className="text-xs font-bold text-white">bKash Personal / Agent</p>
                  <p className="text-[10px] text-emerald-400">● Active & Operational</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">0% Fee</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/30">
                  NG
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Nagad Mobile</p>
                  <p className="text-[10px] text-emerald-400">● Active & Operational</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">0% Fee</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                  RK
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rocket (DBBL)</p>
                  <p className="text-[10px] text-emerald-400">● Active & Operational</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">0% Fee</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">BDT Exchange Rate (per 1,000 pts)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-pink-400 font-mono">৳</span>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={formData.pointsToBdtRate}
                  onChange={(e) => setFormData({ ...formData, pointsToBdtRate: Number(e.target.value) })}
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>সর্বনিম্ন উত্তোলন পয়েন্ট (Min Withdrawal Points)</span>
                <span className="text-[10px] font-mono text-purple-300">
                  বর্তমান: {(settings.minimumRedemptionPoints ?? 5000).toLocaleString()} pts
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  value={formData.minimumRedemptionPoints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumRedemptionPoints: Number(e.target.value)
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const safeMin = Math.max(100, Number(formData.minimumRedemptionPoints) || 0);
                    if (!safeMin || safeMin < 100) {
                      showToast('অনুগ্রহ করে কমপক্ষে ১০০ বা তার বেশি পয়েন্ট সংখ্যা দিন।', 'error');
                      return;
                    }
                    updateSettings({ minimumRedemptionPoints: safeMin });
                    showToast(
                      `সর্বনিম্ন উত্তোলন সীমা ${safeMin.toLocaleString()} পয়েন্ট সেট করা হয়েছে! এই পয়েন্ট না হওয়া পর্যন্ত ইউজারের Withdrawal বাটন OFF থাকবে।`,
                      'success'
                    );
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>সেভ</span>
                </button>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-snug">
                উদাহরণ: ৪০০০ সেট করলে ৪,০০০ পয়েন্ট না হওয়া পর্যন্ত ইউজার উত্তোলন করতে পারবে না এবং Withdrawal বাটনটি OFF থাকবে।
              </p>
            </div>
          </div>
        </div>

        {/* Link Box-1: Adsterra 468x60 Ad Configuration (Screenshot_12 & Screenshot_11) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Link Box-1 (Adsterra 468 × 60)
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {settings.adBox1?.adLink && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-semibold">
                  ✓ ফায়ারবেসে সেভ করা আছে
                </span>
              )}
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                Adsterra ৪৬৮×৬০ সাপোর্টেড
              </span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                বক্সের নাম: Link Box-1
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Screenshort_12 অনুযায়ী এই বক্সে <strong className="text-emerald-400">Adsterra ব্যানার ৪৬৮×৬০</strong> এর স্ক্রিপ্ট কোড, ডিরেক্ট লিংক (Direct Link) অথবা ইমেজ লিংক বসিয়ে ডান পাশের <strong className="text-emerald-400">সেভ (Save)</strong> বাটনে ক্লিক করুন। এটি ফায়ারবেসে জমা হবে এবং ইউজার রিউওয়ার্ড এর <strong className="text-purple-300">box 1</strong> (সাইজ: 468 × 60) এ সরাসরি প্রদর্শিত হবে।
          </p>

          {/* Ad Link / Code Input with Save Button on the Right (Exact Screenshot 12 layout) */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
              <div className="relative flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="নমুনা: <script type='text/javascript'>atOptions={'key':'...','height':60,'width':468};</script> অথবা https://example.com/ad"
                  value={adBox1Link}
                  onChange={(e) => {
                    setAdBox1Link(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-400/35 focus:border-purple-500 focus:outline-none transition-colors font-mono"
                />

                {/* Detected Format Badge */}
                {adBox1Link.trim() && (
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-400">সনাক্তকৃত ফরম্যাট:</span>
                    {adBox1Link.includes('<script') || adBox1Link.includes('atOptions') ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                        ✓ Adsterra 468×60 Script Code
                      </span>
                    ) : adBox1Link.includes('profitablecpmrate.com') || adBox1Link.includes('highrevenuegate.com') || adBox1Link.includes('alwingulla.com') ? (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono font-bold">
                        ✓ Adsterra Direct Link (Smartlink)
                      </span>
                    ) : adBox1Link.includes('invoke.js') || adBox1Link.endsWith('.js') ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                        ✓ Adsterra invoke.js URL
                      </span>
                    ) : /\.(jpeg|jpg|gif|png|webp|svg)/i.test(adBox1Link) ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                        ✓ Banner Image URL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        ✓ Web / Direct Link
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Green Save Button (As shown in Screenshot_12) */}
              <button
                type="button"
                onClick={handleSaveAdBox1}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>সেভ (Save)</span>
              </button>
            </div>

            {/* Quick Test Samples */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-500 font-medium">কুইক স্যাম্পল:</span>
              <button
                type="button"
                onClick={() => {
                  setAdBox1Link(`<script type="text/javascript">
	atOptions = {
		'key' : 'f3e827a5d3f237bfb17478df7ce5d3ab',
		'format' : 'iframe',
		'height' : 60,
		'width' : 468,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/f3e827a5d3f237bfb17478df7ce5d3ab/invoke.js"></script>`);
                  setAdBox1Target('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra 468×60 Script
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox1Link('https://www.profitablecpmrate.com/adsterra_direct_link_demo');
                  setAdBox1Target('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra Direct Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox1Link('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=468&auto=format&fit=crop&q=80');
                  setAdBox1Target('https://adsterra.com');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                468×60 Image Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox1Link('');
                  setAdBox1Target('');
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-[10px] font-mono cursor-pointer transition-colors ml-auto"
              >
                মুছে ফেলুন (Clear)
              </button>
            </div>

            {/* Optional Target / Destination URL */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs pt-1">
              <label className="text-slate-400 shrink-0 font-medium text-[11px]">
                ক্লিক লিংক (Target URL - ঐচ্ছিক):
              </label>
              <input
                type="text"
                placeholder="নমুনা: https://sponsor-website.com (এ্যাডে ক্লিক করলে ভিজিটর এই লিংকে যাবে)"
                value={adBox1Target}
                onChange={(e) => setAdBox1Target(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 placeholder:text-slate-400/35 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview of box 1 using AdBannerBox */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>box 1 লাইভ প্রিভিউ (User Rewards পেজে ঠিক যেভাবে দেখা যাবে)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                468 × 60 px Live
              </span>
            </div>

            <AdBannerBox
              boxId="box-1"
              name="box 1"
              width={468}
              height={60}
              previewContent={adBox1Link.trim() ? adBox1Link : (settings.adBox1?.adLink || '')}
              previewTarget={adBox1Target.trim() ? adBox1Target : (settings.adBox1?.targetUrl || '')}
              className="my-0"
            />
          </div>
        </div>

        {/* Link Box-2: Adsterra Social Bar & Popunder (Right below Screenshot_14) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Link Box-2 (Adsterra Social Bar / Popunder)
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {settings.socialBarAd?.adLink && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-semibold">
                  ✓ ফায়ারবেসে সেভ করা আছে
                </span>
              )}
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                ভিডিও বক্সের উপরে ৫ মি. পর পর
              </span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                বক্সের নাম: Link Box-2
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Screenshot_14 এর ঠিক নিচে এই বক্সে <strong className="text-amber-400">Adsterra Social Bar বা Popunder</strong> এ্যাডের স্ক্রিপ্ট কোড / ডিরেক্ট লিংক বসিয়ে ডান পাশের <strong className="text-emerald-400">সেভ (Save)</strong> বাটনে ক্লিক করুন। এটি ফায়ারবেসে জমা হবে। শর্তানুযায়ী ইউজার ভিডিও বক্সে ক্লিক করার পর <strong className="text-emerald-400">প্রতি ৫ মিনিট পর পর</strong> স্বয়ংক্রিয়ভাবে ভিডিও বক্সের <strong className="text-purple-300">উপরে ডান কোনে</strong> এই এ্যাডটি শো করবে।
          </p>

          {/* Ad Link / Code Input with Green Save Button on the Right (Matching Screenshot_14 style) */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
              <div className="relative flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="নমুনা: <script type='text/javascript' src='//pl....highperformanceformat.com/.../invoke.js'></script> অথবা https://..."
                  value={socialBarLink}
                  onChange={(e) => setSocialBarLink(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-400/35 focus:border-amber-500 focus:outline-none transition-colors font-mono"
                />

                {/* Detected Format Badge */}
                {socialBarLink.trim() && (
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-400">সনাক্তকৃত ফরম্যাট:</span>
                    {socialBarLink.includes('<script') || socialBarLink.includes('atOptions') ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono font-bold">
                        ✓ Adsterra Social Bar Script Code
                      </span>
                    ) : socialBarLink.includes('profitablecpmrate.com') || socialBarLink.includes('highrevenuegate.com') || socialBarLink.includes('alwingulla.com') ? (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono font-bold">
                        ✓ Adsterra Direct Link (Popunder / Smartlink)
                      </span>
                    ) : socialBarLink.includes('invoke.js') || socialBarLink.endsWith('.js') ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                        ✓ Adsterra Script / Popunder URL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        ✓ Web / Direct Link
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Green Save Button (Matching Screenshot_14) */}
              <button
                type="button"
                onClick={handleSaveSocialBar}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>সেভ (Save)</span>
              </button>
            </div>

            {/* Quick Test Samples */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-500 font-medium">কুইক স্যাম্পল:</span>
              <button
                type="button"
                onClick={() => {
                  setSocialBarLink(`<script type="text/javascript" src="//pl19827364.highperformanceformat.com/a1/b2/c3/a1b2c3d4e5f6g7h8.js"></script>`);
                  setSocialBarTarget('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra Social Bar Script
              </button>
              <button
                type="button"
                onClick={() => {
                  setSocialBarLink('https://www.profitablecpmrate.com/popunder_direct_link_demo');
                  setSocialBarTarget('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra Popunder / Direct Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setSocialBarLink('');
                  setSocialBarTarget('');
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-[10px] font-mono cursor-pointer transition-colors ml-auto"
              >
                মুছে ফেলুন (Clear)
              </button>
            </div>

            {/* Optional Target / Destination URL */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs pt-1">
              <label className="text-slate-400 shrink-0 font-medium text-[11px]">
                ক্লিক লিংক (Target URL - ঐচ্ছিক):
              </label>
              <input
                type="text"
                placeholder="নমুনা: https://sponsor-website.com (ক্লিক করলে এই পেজ ওপেন হবে)"
                value={socialBarTarget}
                onChange={(e) => setSocialBarTarget(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 placeholder:text-slate-400/35 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Mockup Preview of Video Box Top-Right Social Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>ভিডিও বক্সের উপরে লাইভ প্রিভিউ (ভিডিও বক্সে ক্লিক করলে উপরে ডান কোনে শো করবে)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                ৫ মিনিট পর পর অটো শো
              </span>
            </div>

            <div className="relative aspect-video max-w-xl mx-auto rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Fake video backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center opacity-80 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-white mb-2">
                  <Play className="h-6 w-6 fill-white" />
                </div>
                <p className="text-xs font-mono text-slate-300">ভিডিও বক্স (Screenshot_13)</p>
                <p className="text-[10px] text-slate-500">ইউজার ক্লিক করলে ৫ মিনিট পর পর উপরে ডান কোনে এ্যাড শো করে</p>
              </div>

              {/* Render Social Bar Overlay right here in the top right! */}
              <VideoSocialBarOverlay
                previewContent={socialBarLink.trim() ? socialBarLink : (settings.socialBarAd?.adLink || '')}
                previewTarget={socialBarTarget.trim() ? socialBarTarget : (settings.socialBarAd?.targetUrl || '')}
                forceShowForPreview={true}
              />
            </div>
          </div>
        </div>

        {/* Box No-2 Link Configuration: Adsterra 300 × 250 (Replacing Screenshot_5 on Video Watcher Page) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Link Box No-2 (Adsterra 300 × 250)
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {settings.adBox2?.adLink && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-semibold">
                  ✓ ফায়ারবেসে সেভ করা আছে
                </span>
              )}
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                Adsterra ৩০০×২৫০ সাপোর্টেড
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded font-semibold uppercase">
                বক্সের নাম: Box No-2
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            ইউজার রিউওয়ার্ডস পেজের Screenshot_5 এর স্থানে তৈরি <strong className="text-indigo-300">Box No-2</strong> (সাইজ: width 300 × height 250) এর জন্য এখানে Adsterra ৩০০×২৫০ স্ক্রিপ্ট কোড, ডিরেক্ট লিংক অথবা ইমেজ লিংক বসিয়ে ডান পাশের <strong className="text-emerald-400">সেভ (Save)</strong> বাটনে ক্লিক করুন।
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
              <div className="relative flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="নমুনা: <script type='text/javascript'>atOptions={'key':'...','height':250,'width':300};</script> অথবা https://example.com/ad"
                  value={adBox2Link}
                  onChange={(e) => setAdBox2Link(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-400/35 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                />

                {adBox2Link.trim() && (
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-400">সনাক্তকৃত ফরম্যাট:</span>
                    {adBox2Link.includes('<script') || adBox2Link.includes('atOptions') ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                        ✓ Adsterra 300×250 Script Code
                      </span>
                    ) : adBox2Link.includes('profitablecpmrate.com') || adBox2Link.includes('highrevenuegate.com') || adBox2Link.includes('alwingulla.com') ? (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono font-bold">
                        ✓ Adsterra Direct Link (Smartlink)
                      </span>
                    ) : adBox2Link.includes('invoke.js') || adBox2Link.endsWith('.js') ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                        ✓ Adsterra invoke.js URL
                      </span>
                    ) : /\.(jpeg|jpg|gif|png|webp|svg)/i.test(adBox2Link) ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                        ✓ Banner Image URL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        ✓ Web / Direct Link
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveAdBox2}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>সেভ (Save)</span>
              </button>
            </div>

            {/* Quick Test Samples for Box No-2 (300x250) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-500 font-medium">কুইক স্যাম্পল:</span>
              <button
                type="button"
                onClick={() => {
                  setAdBox2Link(`<script type="text/javascript">
	atOptions = {
		'key' : 'a1b2c3d4e5f67890abcdef1234567890',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/a1b2c3d4e5f67890abcdef1234567890/invoke.js"></script>`);
                  setAdBox2Target('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra 300×250 Script
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox2Link('https://www.profitablecpmrate.com/adsterra_300x250_direct_link');
                  setAdBox2Target('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                Adsterra Direct Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox2Link('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=250&fit=crop&q=80');
                  setAdBox2Target('https://adsterra.com');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                300×250 Image Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdBox2Link('');
                  setAdBox2Target('');
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-[10px] font-mono cursor-pointer transition-colors ml-auto"
              >
                মুছে ফেলুন (Clear)
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs pt-1">
              <label className="text-slate-400 shrink-0 font-medium text-[11px]">
                ক্লিক লিংক (Target URL - ঐচ্ছিক):
              </label>
              <input
                type="text"
                placeholder="নমুনা: https://sponsor-website.com (এ্যাডে ক্লিক করলে ভিজিটর এই লিংকে যাবে)"
                value={adBox2Target}
                onChange={(e) => setAdBox2Target(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 placeholder:text-slate-400/35 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview of Box No-2 */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Box No-2 লাইভ প্রিভিউ (User Rewards ভিডিও পেজে ঠিক যেভাবে দেখা যাবে)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                300 × 250 px Live
              </span>
            </div>

            <AdBannerBox
              boxId="box-2"
              name="Box No-2"
              width={300}
              height={250}
              previewContent={adBox2Link.trim() ? adBox2Link : (settings.adBox2?.adLink || '')}
              previewTarget={adBox2Target.trim() ? adBox2Target : (settings.adBox2?.targetUrl || '')}
              className="my-0"
            />
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="h-4 w-4 text-purple-400" />
            <span>Supported Video Embed Providers</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allPlatforms.map((plat) => {
              const isEnabled = formData.allowedPlatforms.includes(plat.id);
              return (
                <button
                  type="button"
                  key={plat.id}
                  onClick={() => togglePlatform(plat.id)}
                  className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isEnabled
                      ? 'bg-purple-950/40 border-purple-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-medium">{plat.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Platform Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

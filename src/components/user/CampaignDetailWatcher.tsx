import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { VideoSocialBarOverlay } from '../common/VideoSocialBarOverlay';
import { AdBannerBox } from '../common/AdBannerBox';
import { 
  Play, 
  Pause,
  RotateCcw,
  Clock,
  Coins,
  ArrowLeft,
  CheckCircle2,
  Award,
  Calendar,
  Activity
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const CampaignDetailWatcher: React.FC = () => {
  const { 
    campaigns, 
    activeCampaignId, 
    trackVideoWatchTime,
    getVideoCooldownRemaining,
    setVideoCooldown,
    clearVideoCooldown,
    currentUser, 
    settings, 
    setUserPage,
    showToast,
    t
  } = useApp();

  const visibleCampaigns = campaigns.filter(
    (c) =>
      (c.status === 'active' || c.status === 'approved' || c.status === 'completed') &&
      c.isVisibleToUsers !== false
  );
  const requestedCampaign = campaigns.find((c) => c.id === activeCampaignId);
  const isBlockedByAdmin = requestedCampaign?.isVisibleToUsers === false;
  const campaign = requestedCampaign || visibleCampaigns[0] || campaigns[0];

  const targetMinutes = Number(campaign?.totalTargetWatchMinutes ?? 100);
  const watchedMinutes = Number(campaign?.totalWatchedMinutes || 0);
  const isCampaignCompleted = campaign?.status === 'completed' || (targetMinutes > 0 && watchedMinutes >= targetMinutes);
  const cooldown = getVideoCooldownRemaining(campaign?.id || '');
  const videoLengthMinutes = Number(campaign?.videoLengthMinutes || Math.max(1, Math.round((campaign?.durationSeconds || 60) / 60)));
  const maxVideoSeconds = Math.max(60, Number(campaign?.durationSeconds || videoLengthMinutes * 60));

  // Helper to extract YouTube embed ID
  const getYouTubeEmbedId = (url: string): string => {
    if (!url) return 'dQw4w9WgXcQ';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';
  };

  const youtubeId = getYouTubeEmbedId(campaign?.videoUrl || '');

  // Watch Time Duration Tracker State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [totalSecondsWatched, setTotalSecondsWatched] = useState<number>(0);
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);
  const [recentPointAwarded, setRecentPointAwarded] = useState<boolean>(false);
  const ytPlayerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const secondsRef = useRef<number>(0);

  // Stable callback refs to prevent ticker interruption on state updates
  const trackRef = useRef(trackVideoWatchTime);
  trackRef.current = trackVideoWatchTime;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const setCooldownRef = useRef(setVideoCooldown);
  setCooldownRef.current = setVideoCooldown;
  const tRef = useRef(t);
  tRef.current = t;

  // Sync ref with state when campaign changes
  useEffect(() => {
    secondsRef.current = 0;
    setTotalSecondsWatched(0);
    setSessionPointsEarned(0);
    setIsPlaying(false);
  }, [campaign?.id]);

  // 1. YouTube Iframe API setup & state listener
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const setupYTPlayer = () => {
      if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
        try {
          if (ytPlayerRef.current) {
            try {
              ytPlayerRef.current.destroy();
            } catch {}
          }

          ytPlayerRef.current = new window.YT.Player('youtube-player-iframe', {
            events: {
              onReady: (event: any) => {
                ytPlayerRef.current = event.target;
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
                if (event.data === 1) {
                  if (cooldown.isLocked) {
                    try {
                      event.target.pauseVideo();
                    } catch {}
                    setIsPlaying(false);
                    showToastRef.current(`এই ভিডিওটি ৪ ঘণ্টার জন্য লক রয়েছে (${cooldown.formatted} বাকি)। অন্য ভিডিও দেখুন।`, 'info');
                    return;
                  }
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  // Video finished 1 full run!
                  setIsPlaying(false);
                  if (secondsRef.current > 0) {
                    const earned = Math.floor(secondsRef.current / 60);
                    const targetPts = Math.max(1, Math.round(maxVideoSeconds / 60));
                    if (earned < targetPts) {
                      trackRef.current(campaign.id, campaign.title, 1, targetPts - earned, secondsRef.current);
                      setSessionPointsEarned(targetPts);
                    }
                    setCooldownRef.current(campaign.id, 4 * 60 * 60 * 1000);
                    showToastRef.current(
                      `🎉 ভিডিওটি ১ বার সম্পূর্ণ চলেছে (${Math.floor(maxVideoSeconds / 60)} মিনিট)! পয়েন্ট যোগ হয়েছে। বাটনটি ৪ ঘণ্টার জন্য লক থাকবে। অন্য ভিডিও দেখতে পারবেন।`,
                      'success'
                    );
                  }
                }
              }
            }
          });
        } catch (err) {
          console.warn('YouTube Player setup note:', err);
        }
      }
    };

    if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
      const timer = setTimeout(setupYTPlayer, 200);
      return () => clearTimeout(timer);
    } else {
      window.onYouTubeIframeAPIReady = setupYTPlayer;
    }

    // High frequency heartbeat to ensure isPlaying is always exactly matching player state
    pollTimer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        try {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 1) {
            setIsPlaying((prev) => (prev ? prev : true));
          } else if (state === 2 || state === 0) {
            setIsPlaying((prev) => (!prev ? prev : false));
          }
        } catch {}
      }
    }, 400);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }
    };
  }, [campaign?.id, youtubeId, maxVideoSeconds, cooldown.isLocked, cooldown.formatted]);

  // 2. Cross-origin postMessage listener from YouTube iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        let data = e.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        // infoDelivery playerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
        if (data.event === 'infoDelivery' && data.info) {
          const pState = data.info.playerState;
          if (pState === 1) {
            setIsPlaying(true);
          } else if (pState === 2 || pState === 0) {
            setIsPlaying(false);
          }
        }
        if (data.event === 'onStateChange') {
          if (data.info === 1) setIsPlaying(true);
          if (data.info === 2 || data.info === 0) setIsPlaying(false);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 3. Detect when user clicks into the iframe (window blur detection)
  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
          try {
            const state = ytPlayerRef.current.getPlayerState();
            if (state === 1) setIsPlaying(true);
            else if (state === 2 || state === 0) setIsPlaying(false);
          } catch {}
        }
      }, 300);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // 4. Interval Ticker: every 1 second ONLY when isPlaying is true (ভিডিও চললে পয়েন্ট হবে, না চললে হবে না)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && !isCampaignCompleted && !cooldown.isLocked && !isBlockedByAdmin && campaign) {
      timer = setInterval(() => {
        secondsRef.current += 1;
        const currentSec = secondsRef.current;
        setTotalSecondsWatched(currentSec);

        // Every full 60 seconds (1 minute), credit 1 point!
        if (currentSec > 0 && currentSec % 60 === 0) {
          trackRef.current(campaign.id, campaign.title, 1, 1, 60);
          setSessionPointsEarned((p) => p + 1);
          setRecentPointAwarded(true);
          setTimeout(() => setRecentPointAwarded(false), 3000);
          showToastRef.current(tRef.current('point_credited_toast', '🎉 +1 Point added to your wallet for 1 minute of watch time!'), 'success');
        }

        // Single-run completion: When video reaches its designated length
        if (currentSec >= maxVideoSeconds) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
            try {
              ytPlayerRef.current.pauseVideo();
            } catch {}
          }
          if (iframeRef.current?.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                '*'
              );
            } catch {}
          }
          setIsPlaying(false);

          // Credit any remaining points for reaching full duration
          const earned = Math.floor(currentSec / 60);
          const targetPts = Math.max(1, Math.round(maxVideoSeconds / 60));
          if (earned < targetPts) {
            trackRef.current(campaign.id, campaign.title, 1, targetPts - earned, currentSec);
            setSessionPointsEarned(targetPts);
          }

          // Set 4-hour cooldown for this specific user
          setCooldownRef.current(campaign.id, 4 * 60 * 60 * 1000);
          showToastRef.current(
            `🎉 ভিডিওটি ১ বার সম্পূর্ণ (${Math.floor(maxVideoSeconds / 60)} মিনিট) চলেছে এবং পয়েন্ট কাউন্ট হয়েছে! বাটনটি আপনার জন্য ৪ ঘণ্টার জন্য লক করা হয়েছে। আপনি অন্য ভিডিও দেখতে পারেন।`,
            'success'
          );
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, isCampaignCompleted, cooldown.isLocked, isBlockedByAdmin, campaign?.id, campaign?.title, maxVideoSeconds]);

  const toggleWatchPlayback = () => {
    if (cooldown.isLocked) {
      showToast(
        `এই ভিডিওটি আপনার জন্য ৪ ঘণ্টার জন্য বিরতিতে রয়েছে (বাকি: ${cooldown.formatted})। আপনি অন্যান্য ভিডিও দেখতে পারেন।`,
        'info'
      );
      return;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
          return;
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          return;
        }
      } catch (err) {
        console.warn('Playback toggle error:', err);
      }
    }
    setIsPlaying((prev) => !prev);
  };

  const resetWatchSession = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    setIsPlaying(false);
    secondsRef.current = 0;
    setTotalSecondsWatched(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSecondsInMinute = totalSecondsWatched % 60;
  const progressPercent = Math.min(100, Math.round((currentSecondsInMinute / 60) * 100));

  if (!campaign || isBlockedByAdmin || campaign.isVisibleToUsers === false) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
        <p className="text-base font-bold text-white">
          এই ভিডিওটি বর্তমানে অ্যাডমিন কর্তৃক বন্ধ (OFF) রাখা হয়েছে
        </p>
        <p className="text-xs text-slate-400">
          অ্যাডমিন ভিডিওটি পুনরায় চালু (ON) করলে আপনি আবার এটি দেখতে পারবেন। অনুগ্রহ করে অন্য ভিডিও দেখুন।
        </p>
        <button
          onClick={() => setUserPage('discover')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>অন্যান্য ভিডিও দেখুন (Discover Campaigns)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setUserPage('discover')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discover Campaigns</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={isCampaignCompleted ? 'completed' : campaign.status} />
          <span className="text-xs text-slate-400 font-mono">ID: {campaign.id}</span>
        </div>
      </div>

      {/* Completed Banner if target reached */}
      {isCampaignCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-200">ক্যাম্পেইনটি সম্পন্ন হয়েছে (Completed)</p>
              <p className="text-xs text-slate-300">
                এই ভিডিওটির ভেন্ডোরের নির্ধারিত সময়কাল ({targetMinutes} মিনিট) পূর্ণ হওয়ায় নতুন পার্টিসিপেশন বন্ধ রয়েছে। ২ দিন পর স্বয়ংক্রিয়ভাবে মুছে যাবে।
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs uppercase font-bold shrink-0 self-start sm:self-auto">
            ✓ Finished
          </span>
        </div>
      )}

      {/* 4-Hour Cooldown Banner */}
      {cooldown.isLocked && !isCampaignCompleted && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-100">৪ ঘণ্টার বিরতি চলছে (4h Cooldown Active)</p>
              <p className="text-xs text-slate-300">
                ভিডিওটি ১ বার সম্পূর্ণ চলেছে। আপনার জন্য এটি ৪ ঘণ্টার জন্য বন্ধ থাকবে (বাকি: {cooldown.formatted})। ৪ ঘণ্টা পর আবার দেখতে পারবেন। আপনি এখন অন্য ভিডিও দেখতে পারেন।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                clearVideoCooldown(campaign.id);
                showToast('লক সফলভাবে সরানো হয়েছে! এখন আপনি সম্পূর্ণ ১ বার দেখতে পারবেন।', 'success');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-medium text-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>লক রিসেট করুন (Reset Lock)</span>
            </button>
            <button
              onClick={() => setUserPage('overview')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-medium text-xs cursor-pointer"
            >
              অন্যান্য ভিডিও দেখুন →
            </button>
          </div>
        </div>
      )}

      {/* Campaign Header info */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider font-mono">
            {campaign.category} Premiere · Advertiser: {campaign.vendorName}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Available until: {campaign.expiresAt}</span>
          </span>
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">{campaign.title}</h1>
        <p className="text-xs text-slate-400 leading-relaxed">{campaign.description}</p>
      </div>

      {/* Official YouTube Embedded Player */}
      <div className="rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl relative group">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            id="youtube-player-iframe"
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&rel=0&modestbranding=1&playsinline=1`}
            title={campaign.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          {/* Adsterra Social Bar & Popunder Overlay (Shows on start + every 5 minutes using totalSecondsWatched counter) */}
          <VideoSocialBarOverlay
            campaignId={campaign.id}
            watchedSeconds={totalSecondsWatched}
            isPlaying={isPlaying}
            onUserClickedVideo={() => {
              if (!isPlaying && !cooldown.isLocked && !isCampaignCompleted) {
                toggleWatchPlayback();
              }
            }}
          />
        </div>
      </div>

      {/* Real-time Video Watch Duration & Points Counter (Firebase Synced) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/30 space-y-4 shadow-xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className={`h-3 w-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isPlaying ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isPlaying ? '🟢 ভিডিও চলছে (পয়েন্ট কাউন্ট সক্রিয়)' : '⏸️ ভিডিও বন্ধ আছে (ভিডিও চালু করলে পয়েন্ট কাউন্ট হবে)'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-900/60 text-purple-300 border border-purple-700/50">
              {t('rule_1min_1pt', '১ মিনিট ভিডিও = ১ পয়েন্ট')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              User ID: <span className="text-purple-300 font-semibold">{currentUser.id.slice(0, 8)}...</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
              isPlaying ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isPlaying ? 'Watching (সক্রিয়)' : 'Paused (স্থগিত)'}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Watch Duration (Screenshot_16: Also drives 5-min Adsterra Social Bar trigger) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('watch_duration', 'ভিডিও দেখার সময়')}</span>
              <Clock className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono tracking-tight">
              {formatTime(totalSecondsWatched)} <span className="text-xs text-slate-400 font-normal">/ {formatTime(maxVideoSeconds)}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              ভিডিওর দৈর্ঘ্য {Math.floor(maxVideoSeconds / 60)} মিনিট (১ বার চলবে)
            </p>
            {settings.socialBarAd?.adLink?.trim() && settings.socialBarAd?.enabled !== false && (
              <p className="text-[10px] text-purple-300 font-mono pt-0.5">
                ⏱️ পরবর্তী এ্যাড: {formatTime(300 - (totalSecondsWatched % 300))} পর (প্রতি ৫ মি.)
              </p>
            )}
          </div>

          {/* 2. Points Earned This Session */}
          <div className={`p-3.5 rounded-xl bg-slate-950/80 border transition-all duration-300 space-y-1 ${
            recentPointAwarded ? 'border-emerald-500 shadow-md shadow-emerald-500/20' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('points_earned_watch', 'অর্জিত পয়েন্ট')}</span>
              <Coins className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                +{sessionPointsEarned} <span className="text-xs text-slate-300 font-normal">pts</span>
              </p>
              {recentPointAwarded && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500 animate-bounce">
                  +1 pt Added!
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-medium">
              ১ মিনিটে ১ পয়েন্ট হিসেবে যোগ হচ্ছে
            </p>
          </div>

          {/* 3. Total Balance in Header Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>হেডার বক্স ব্যালেন্স (মোট)</span>
              <Award className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono tracking-tight">
              {currentUser.points.toLocaleString()} <span className="text-xs text-purple-300 font-normal">pts</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              ওয়ালেট ব্যালেন্স
            </p>
          </div>
        </div>

        {/* Progress Bar towards Next Point (+1 Pt every 60s) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-purple-400" />
              <span>{t('next_point_progress', 'Progress to Next Point')}</span>
            </span>
            <span className="font-mono text-purple-300 font-bold">
              {currentSecondsInMinute}s / 60s ({60 - currentSecondsInMinute}s বাকি)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-300 ease-linear ${
                !isPlaying && 'opacity-60'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Player Controls & User Instructions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {cooldown.isLocked ? (
              <button
                disabled
                title={`এই ভিডিওটি ৪ ঘণ্টার জন্য লক রয়েছে। ${cooldown.formatted} পর আবার দেখতে পারবেন।`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed flex items-center gap-2 opacity-80"
              >
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>৪ ঘণ্টা লক ({cooldown.formatted} বাকি)</span>
              </button>
            ) : (
              <button
                onClick={toggleWatchPlayback}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>ভিডিও বিরতি দিন (Pause Video)</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>ভিডিও চালান (Play Video)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={resetWatchSession}
              title="Reset session timer"
              className="p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            💡 <span className="text-purple-300 font-medium">নিয়ম:</span> ভিডিও চললে পয়েন্ট কাউন্ট হবে, ভিডিও না চললে পয়েন্ট হবে না (প্রতি ১ মিনিটে ১টি পয়েন্ট)।
          </p>
        </div>
      </div>

      {/* Box No-2 Advertisement Banner (width: 300px, height: 250px) replacing Screenshot_5 */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-xl">
        <AdBannerBox boxId="box-2" name="Box No-2" width={300} height={250} />
      </div>
    </div>
  );
};

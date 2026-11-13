import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ExternalLink, Zap, Bell, CheckCircle2, Clock } from 'lucide-react';

interface VideoSocialBarOverlayProps {
  campaignId?: string;
  watchedSeconds?: number;
  isPlaying?: boolean;
  previewContent?: string;
  previewTarget?: string;
  forceShowForPreview?: boolean;
  onUserClickedVideo?: () => void;
}

export const VideoSocialBarOverlay: React.FC<VideoSocialBarOverlayProps> = ({
  campaignId,
  watchedSeconds = 0,
  isPlaying = false,
  previewContent,
  previewTarget,
  forceShowForPreview = false,
  onUserClickedVideo
}) => {
  const { settings, showToast } = useApp();

  const adConfig = settings.socialBarAd;
  const rawInput = (previewContent !== undefined ? previewContent : (adConfig?.adLink || '')).trim();
  const targetUrl = (previewTarget !== undefined ? previewTarget : (adConfig?.targetUrl || '')).trim();
  const isEnabled = adConfig?.enabled !== false;

  const [hasInteracted, setHasInteracted] = useState<boolean>(forceShowForPreview);
  const [isVisible, setIsVisible] = useState<boolean>(forceShowForPreview);
  const [popunderOpened, setPopunderOpened] = useState<boolean>(false);
  const hasShownInitialAdRef = useRef<boolean>(forceShowForPreview);
  const lastMilestoneRef = useRef<number>(0);
  const prevWatchedRef = useRef<number>(watchedSeconds);

  // Sync preview mode
  useEffect(() => {
    if (forceShowForPreview) {
      setHasInteracted(true);
      setIsVisible(true);
      hasShownInitialAdRef.current = true;
    }
  }, [forceShowForPreview, rawInput]);

  // Reset state cleanly when campaign changes
  useEffect(() => {
    if (forceShowForPreview) return;
    setHasInteracted(false);
    setIsVisible(false);
    setPopunderOpened(false);
    hasShownInitialAdRef.current = false;
    lastMilestoneRef.current = 0;
    prevWatchedRef.current = 0;
  }, [campaignId, forceShowForPreview]);

  // Trigger initial ad once when video starts playing (either via video box click or Play button)
  useEffect(() => {
    if (forceShowForPreview || !rawInput || !isEnabled) return;
    if (isPlaying) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      if (!hasShownInitialAdRef.current) {
        hasShownInitialAdRef.current = true;
        setIsVisible(true);
      }
    }
  }, [isPlaying, hasInteracted, forceShowForPreview, rawInput, isEnabled]);

  // Determine ad type
  const adType = useMemo(() => {
    if (!rawInput) return 'empty';
    if (rawInput.includes('<script') || rawInput.includes('atOptions') || rawInput.includes('<iframe')) {
      return 'html_script';
    }
    if (
      (rawInput.includes('highperformanceformat.com') ||
       rawInput.includes('topcreativeformat.com') ||
       rawInput.includes('invoke.js') ||
       rawInput.endsWith('.js')) &&
      !rawInput.includes('<')
    ) {
      return 'script_url';
    }
    return 'direct_link';
  }, [rawInput]);

  // 1. Reset milestone tracking ONLY when an active watch counter is explicitly reset back to 0
  useEffect(() => {
    if (!forceShowForPreview && prevWatchedRef.current > 0 && watchedSeconds === 0) {
      lastMilestoneRef.current = 0;
      hasShownInitialAdRef.current = false;
      setHasInteracted(false);
      setIsVisible(false);
      setPopunderOpened(false);
    }
    prevWatchedRef.current = watchedSeconds;
  }, [watchedSeconds, forceShowForPreview]);

  // 2. Use Screenshot_16 counter (watchedSeconds) to automatically show Ad every 5 minutes (05:00, 10:00, 15:00, 20:00...)
  useEffect(() => {
    if (forceShowForPreview || !rawInput || !isEnabled) return;

    const currentMilestone = Math.floor(watchedSeconds / 300); // 1 at 5:00, 2 at 10:00, 3 at 15:00...
    if (currentMilestone > 0 && currentMilestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = currentMilestone;
      setIsVisible(true);
      showToast(
        `🔔 Adsterra Social Bar: ভিডিও দেখার সময় ${currentMilestone * 5} মিনিট পূর্ণ হওয়ায় এ্যাড শো হয়েছে!`,
        'info'
      );
    }
  }, [watchedSeconds, forceShowForPreview, rawInput, isEnabled, showToast]);

  // 3. External Script Injection for native Adsterra Social Bar scripts once triggered
  useEffect(() => {
    if (!isVisible || !rawInput || !isEnabled || forceShowForPreview) return;

    if (adType === 'script_url') {
      const fixedUrl = rawInput.startsWith('//') ? `https:${rawInput}` : rawInput;
      const scriptId = 'adsterra-socialbar-script';
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      const s = document.createElement('script');
      s.id = scriptId;
      s.type = 'text/javascript';
      s.src = fixedUrl;
      s.async = true;
      document.body.appendChild(s);
    }
  }, [isVisible, rawInput, isEnabled, adType, forceShowForPreview]);

  // Handle initial click on video box: starts video, shows ad immediately once, & activates 5-min counter
  const handleVideoBoxClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);

      if (rawInput && isEnabled && !hasShownInitialAdRef.current) {
        hasShownInitialAdRef.current = true;
        setIsVisible(true);
      }

      // Trigger Popunder on first click if configured as direct link / popunder URL
      if (!popunderOpened && rawInput && isEnabled) {
        setPopunderOpened(true);
        const destination = targetUrl || (rawInput.startsWith('http') ? rawInput : '');
        if (destination && !rawInput.includes('<script')) {
          try {
            window.open(destination, '_blank', 'noopener,noreferrer');
          } catch {}
        }
      }

      if (onUserClickedVideo) {
        onUserClickedVideo();
      }
    }
  };

  // Remaining seconds until next 5-minute milestone based on Screenshot_16 counter
  const remainingSeconds = 300 - (watchedSeconds % 300);
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Generate safe srcDoc for Social Bar iframe
  const iframeSrcDoc = useMemo(() => {
    if (adType === 'html_script') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex; align-items: center; justify-content: center;
    }
  </style>
</head>
<body>
  ${rawInput}
</body>
</html>`;
    }
    if (adType === 'script_url') {
      const fixedUrl = rawInput.startsWith('//') ? `https:${rawInput}` : rawInput;
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
  </style>
</head>
<body>
  <script type="text/javascript" src="${fixedUrl}"></script>
</body>
</html>`;
    }
    return '';
  }, [adType, rawInput]);

  if (!rawInput && !forceShowForPreview) {
    return null;
  }

  const destinationLink = targetUrl || (rawInput.startsWith('http') ? rawInput : 'https://adsterra.com');

  return (
    <>
      {/* First click detector on video box: starts video playback, shows initial ad once & activates 5-min counter */}
      {!hasInteracted && !forceShowForPreview && (
        <div
          onClick={handleVideoBoxClick}
          className="absolute inset-0 z-20 cursor-pointer"
          title="ভিডিও চালু করতে ক্লিক করুন"
        />
      )}

      {/* Top-Right Corner Floating Social Bar / Popunder Ad Widget */}
      {isVisible && (
        <div className="absolute top-3 right-3 z-30 max-w-[320px] w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative rounded-2xl bg-slate-950/95 backdrop-blur-md border border-purple-500/50 shadow-2xl p-3 text-white overflow-hidden group">
            {/* Ambient animated gradient edge */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 pointer-events-none" />

            {/* Header: Label, 5-min counter status, & Close button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10.5px] font-mono font-bold text-purple-300 uppercase flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span>Adsterra Social Bar</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!forceShowForPreview && (
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1"
                    title="ভিডিও দেখার সময় প্রতি ৫ মিনিট পর পর শো করে"
                  >
                    <Clock className="h-2.5 w-2.5 text-purple-400" />
                    <span>{formatCountdown(remainingSeconds)}</span>
                  </span>
                )}

                {/* Close Button: Hides current view, will auto-reappear at next 5-minute mark */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                    if (!forceShowForPreview) {
                      showToast('এ্যাড বন্ধ করা হয়েছে। ভিডিও দেখার সময় পরবর্তী ৫ মিনিট পূর্ণ হলে পুনরায় শো করবে।', 'info');
                    }
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="এ্যাডটি বন্ধ করুন"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content Body: Script Iframe or Interactive Social Bar Card */}
            <div className="relative z-10">
              {adType === 'html_script' || adType === 'script_url' ? (
                <div className="w-full h-[90px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <iframe
                    title="Adsterra Social Bar Widget"
                    srcDoc={iframeSrcDoc}
                    className="w-full h-full border-0"
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  />
                </div>
              ) : (
                <a
                  href={destinationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group/link block"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-600/30 group-hover/link:scale-105 transition-transform">
                    <Bell className="h-4 w-4 fill-white text-white animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-white truncate group-hover/link:text-purple-200 transition-colors">
                      🎁 বিশেষ স্পনসর রিওয়ার্ড অফার
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Adsterra Sponsored • এখনই চেক করুন
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm shrink-0">
                    <span>ভিজিট</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </a>
              )}
            </div>

            {/* Sub-footer reminder */}
            <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>৫ মিনিট পর পর অটো শো</span>
              </span>
              <span className="text-purple-400">Adsterra Popunder/Social</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

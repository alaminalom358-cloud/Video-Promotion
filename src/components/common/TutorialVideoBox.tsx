import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Youtube, Sparkles } from 'lucide-react';

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

interface TutorialVideoBoxProps {
  previewUrl?: string;
  compact?: boolean;
  className?: string;
}

export const TutorialVideoBox: React.FC<TutorialVideoBoxProps> = ({
  previewUrl,
  compact = false,
  className = ''
}) => {
  const { settings, lang } = useApp();
  const isBn = lang === 'bn';

  const activeUrl = previewUrl !== undefined ? previewUrl : (settings.tutorialVideoUrl || '');
  const videoId = extractYouTubeVideoId(activeUrl);

  return (
    <div
      className={`rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-2xl shadow-purple-950/30 overflow-hidden ${
        compact ? 'max-w-xl mx-auto' : 'max-w-4xl mx-auto'
      } ${className}`}
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Youtube className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white leading-tight">
              {isBn ? 'টিউটোরিয়াল ভিডিও (How It Works)' : 'Tutorial Video (How It Works)'}
            </p>
            <p className="text-[10px] text-slate-400">
              {isBn
                ? 'প্ল্যাটফর্মটি কীভাবে কাজ করে তা ভিডিওর মাধ্যমে দেখুন'
                : 'Watch a quick walkthrough of how the platform works'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[10px] font-semibold text-purple-300">
          <Sparkles className="h-3 w-3" />
          <span>{videoId ? (isBn ? 'টিউটোরিয়াল প্লেয়ার' : 'YouTube Player') : (isBn ? 'ভিডিও বক্স' : 'Video Box')}</span>
        </span>
      </div>

      {/* 16:9 YouTube Player / Placeholder Frame */}
      <div className="relative aspect-video bg-slate-950 w-full">
        {videoId ? (
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="How It Works Tutorial Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-[#111732] to-purple-950/30 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/20">
              <Play className="h-6 w-6 fill-purple-400 text-purple-400 ml-0.5" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="text-sm font-bold text-white">
                {isBn ? 'How It Works টিউটোরিয়াল ভিডিও বক্স' : 'How It Works Tutorial Video Box'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBn
                  ? 'অ্যাডমিন সেটিংস থেকে "টিউটিরিয়াল ভিডিও" বক্সে ইউটিউব ভিডিও লিংক সেভ করলে এখানে সরাসরি ভিডিও প্রদর্শিত হবে।'
                  : 'Save a YouTube video link in Admin Settings under "Tutorial Video" to display the guide video here.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

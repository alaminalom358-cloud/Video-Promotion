import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, Megaphone, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface AdBannerBoxProps {
  boxId?: string;
  name?: string;
  width?: number;
  height?: number;
  className?: string;
  previewContent?: string;
  previewTarget?: string;
}

export const AdBannerBox: React.FC<AdBannerBoxProps> = ({
  boxId = 'box-1',
  name = 'box 1',
  width = 468,
  height = 60,
  className = '',
  previewContent,
  previewTarget
}) => {
  const { settings } = useApp();
  const [imgError, setImgError] = useState(false);

  // Get ad configuration strictly matching the requested boxId
  const adConfig =
    boxId === 'box-2'
      ? (settings.adBox2 || settings.adBanners?.['box-2'])
      : boxId === 'box-1'
      ? (settings.adBox1 || settings.adBanners?.['box-1'])
      : settings.adBanners?.[boxId];

  const rawInput = (previewContent !== undefined ? previewContent : (adConfig?.adLink || '')).trim();
  const targetUrl = (previewTarget !== undefined ? previewTarget : (adConfig?.targetUrl || '')).trim();
  const isEnabled = adConfig?.enabled !== false;
  const isTallBox = height >= 150;

  // Detect Adsterra and other ad formats
  const adType = useMemo(() => {
    if (!rawInput) return 'empty';

    // 1. Full HTML or Script Code (Adsterra code snippet with <script or atOptions)
    if (
      rawInput.includes('<script') || 
      rawInput.includes('atOptions') || 
      rawInput.includes('<iframe') ||
      (rawInput.includes('invoke.js') && rawInput.includes('<'))
    ) {
      return 'html_script';
    }

    // 2. Script URL (e.g. //www.highperformanceformat.com/.../invoke.js or https://...invoke.js)
    if (
      (rawInput.includes('highperformanceformat.com') ||
       rawInput.includes('topcreativeformat.com') ||
       rawInput.includes('invoke.js') ||
       rawInput.endsWith('.js')) &&
      !rawInput.includes('<')
    ) {
      return 'script_url';
    }

    // 3. Image URL (.jpg, .jpeg, .png, .gif, .webp, .svg or data:image)
    const isImageExt = /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(rawInput) || rawInput.startsWith('data:image/');
    if (isImageExt) {
      return 'image';
    }

    // 4. Adsterra Direct Link (profitablecpmrate.com, highrevenuegate.com, alwingulla.com, etc.) or web link
    return 'direct_link';
  }, [rawInput]);

  // Generate safe srcDoc for Adsterra iframe with exact box dimensions
  const iframeSrcDoc = useMemo(() => {
    if (adType === 'html_script') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}, initial-scale=1">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
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
      // Extract Adsterra 32-character key if present in invoke.js URL
      const keyMatch = fixedUrl.match(/([a-f0-9]{32})/i);
      const adsterraKey = keyMatch ? keyMatch[1] : '';

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}, initial-scale=1">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  ${adsterraKey ? `
  <script type="text/javascript">
    atOptions = {
      'key' : '${adsterraKey}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>` : ''}
  <script type="text/javascript" src="${fixedUrl}"></script>
</body>
</html>`;
    }

    return '';
  }, [adType, rawInput, width, height]);

  const hasActiveAd = Boolean(rawInput && isEnabled && (adType !== 'image' || !imgError));

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      {/* Box Header Label */}
      <div
        style={{ maxWidth: `${width}px` }}
        className="flex items-center justify-between w-full px-1 mb-1.5 text-[11px] font-mono text-slate-400"
      >
        <span className="flex items-center gap-1.5 font-bold text-purple-400">
          <Megaphone className="h-3 w-3 text-purple-400" />
          <span>{name}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {width} × {height} Adsterra Ad
        </span>
      </div>

      {/* Exact Ad Banner Container */}
      <div 
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative max-w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg flex items-center justify-center transition-all hover:border-purple-500/50"
      >
        {hasActiveAd ? (
          <>
            {/* 1 & 2. Adsterra HTML Script or Script URL rendered in isolated iframe */}
            {(adType === 'html_script' || adType === 'script_url') && (
              <iframe
                title={`Adsterra ${width}x${height} Banner`}
                srcDoc={iframeSrcDoc}
                width={width}
                height={height}
                style={{ width: `${width}px`, height: `${height}px`, border: 'none', overflow: 'hidden' }}
                scrolling="no"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                className="w-full h-full block"
              />
            )}

            {/* 3. Standard Direct Image Banner */}
            {adType === 'image' && (
              targetUrl ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full h-full flex items-center justify-center group overflow-hidden cursor-pointer"
                  title={`${name} - Adsterra Sponsor`}
                >
                  <img
                    src={rawInput}
                    alt={`${name} Adsterra advertisement banner`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-[9px] text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Visit</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </a>
              ) : (
                <img
                  src={rawInput}
                  alt={`${name} Adsterra banner`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              )
            )}

            {/* 4. Adsterra Direct Link (Smartlink) / Interactive Sponsored Banner */}
            {adType === 'direct_link' && (
              isTallBox ? (
                <a
                  href={rawInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full p-5 flex flex-col items-center justify-between text-center bg-gradient-to-br from-purple-900/80 via-indigo-900/90 to-slate-950 border border-purple-500/40 rounded-xl group hover:border-purple-400 transition-all cursor-pointer relative overflow-hidden"
                  title="Adsterra Sponsored Offer - Click to explore"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase font-mono font-bold bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400/40">
                      Adsterra Sponsor
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div className="flex flex-col items-center gap-2.5 my-auto">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                      <Zap className="h-6 w-6 fill-amber-300 text-amber-300 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                        বিশেষ স্পনসর বোনাস ও রিওয়ার্ড অফার
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {name} • {width} × {height} স্পনসরড এ্যাড
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md group-hover:shadow-emerald-500/30 transition-all">
                    <span>অফারটি দেখুন (Visit Now)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ) : (
                <a
                  href={rawInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full p-2 flex items-center justify-between bg-gradient-to-r from-purple-900/80 via-indigo-900/90 to-purple-950/90 border border-purple-500/40 rounded-xl px-3 group hover:border-purple-400 transition-all cursor-pointer relative overflow-hidden"
                  title="Adsterra Sponsored Offer - Click to explore"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform shrink-0">
                      <Zap className="h-4 w-4 fill-amber-300 text-amber-300 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold bg-purple-500/30 text-purple-200 px-1.5 py-0.2 rounded border border-purple-400/40">
                          Adsterra Sponsor
                        </span>
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
                        বিশেষ স্পনসর বোনাস ও রিওয়ার্ড অফার
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm group-hover:shadow-emerald-500/30 transition-all shrink-0">
                    <span>ভিজিট করুন</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              )
            )}
          </>
        ) : (
          /* Sleek Adsterra Placeholder when no ad is active or set */
          isTallBox ? (
            <div className="w-full h-full p-5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-br from-purple-950/30 via-slate-900 to-indigo-950/30 border border-dashed border-slate-700/80 rounded-xl">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200 tracking-tight">
                  {name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {width} × {height} Adsterra ব্যানার স্পেস
                </p>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-700/40 px-2.5 py-1 rounded-md">
                Adsterra {width} × {height} Slot
              </span>
            </div>
          ) : (
            <div className="w-full h-full p-2 flex items-center justify-between bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 border border-dashed border-slate-700/80 rounded-xl px-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
                    {name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {width} × {height} Adsterra ব্যানার স্পেস
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-700/40 px-2 py-0.5 rounded">
                  Adsterra Slot
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

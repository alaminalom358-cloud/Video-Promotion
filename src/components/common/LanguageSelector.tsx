import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { lang, setLang } = useApp();

  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center rounded-xl bg-slate-900/90 border border-slate-800 p-0.5 shadow-sm text-xs font-medium ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            lang === 'en'
              ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Switch to English"
        >
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => setLang('bn')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            lang === 'bn'
              ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="বাংলায় পরিবর্তন করুন"
        >
          <span>বাংলা</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Globe className="h-3.5 w-3.5 text-purple-400" />
        <span className="hidden sm:inline font-medium">{lang === 'bn' ? 'ভাষা:' : 'Language:'}</span>
      </div>
      <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            lang === 'en'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang('bn')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            lang === 'bn'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          বাংলা
        </button>
      </div>
    </div>
  );
};

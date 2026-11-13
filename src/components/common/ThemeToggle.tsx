import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'icon-only';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { theme, toggleTheme, setTheme, lang } = useApp();
  const isDark = theme === 'dark';
  const isBn = lang === 'bn';

  if (variant === 'full') {
    return (
      <div 
        className={`inline-flex items-center rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-700/80 p-0.5 shadow-sm text-xs font-medium ${className}`}
        role="group"
        aria-label="Theme mode toggle"
      >
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            isDark
              ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isBn ? 'ডার্ক মোড সক্রিয় করুন' : 'Activate Dark Mode'}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>{isBn ? 'ডার্ক' : 'Dark'}</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            !isDark
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isBn ? 'লাইট মোড সক্রিয় করুন' : 'Activate Light Mode'}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>{isBn ? 'লাইট' : 'Light'}</span>
        </button>
      </div>
    );
  }

  // Compact toggle: clean button with icon and label/indicator
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium select-none shadow-sm ${
        isDark 
          ? 'bg-slate-900/90 hover:bg-slate-800 text-purple-300 border-purple-500/30 hover:border-purple-500/50' 
          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-amber-500/10'
      } ${className}`}
      title={
        isDark
          ? (isBn ? 'লাইট মোডে পরিবর্তন করুন (Switch to Light Mode)' : 'Switch to Light Mode')
          : (isBn ? 'ডার্ক মোডে পরিবর্তন করুন (Switch to Dark Mode)' : 'Switch to Dark Mode')
      }
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <>
          <Moon className="h-3.5 w-3.5 text-purple-400 fill-purple-400/20" />
          <span className="text-[11px] font-semibold text-slate-200">
            {isBn ? 'ডার্ক' : 'Dark'}
          </span>
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-600 fill-amber-400" />
          <span className="text-[11px] font-bold text-amber-900">
            {isBn ? 'লাইট' : 'Light'}
          </span>
        </>
      )}
    </button>
  );
};

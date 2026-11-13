import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicPage } from '../../types';
import { Play, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';

export const PublicNavbar: React.FC = () => {
  const { publicPage, setPublicPage, setRole, setUserPage, setVendorPage, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PublicPage; label: string }[] = [
    { id: 'home', label: t('nav_home', 'Home') },
    { id: 'about', label: t('nav_about', 'About Us') },
    { id: 'how-it-works', label: t('nav_how_it_works', 'How It Works') },
    { id: 'contact', label: t('nav_contact', 'Contact Us') }
  ];

  const handleNavClick = (page: PublicPage) => {
    setPublicPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-[33px] z-30 bg-[#0B1021]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark with icon */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Play className="h-4 w-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">
            Promoview
          </span>
        </button>

        {/* Zone 2: 4 clean text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`hover:text-purple-400 transition-colors whitespace-nowrap cursor-pointer relative py-1 ${
                publicPage === link.id ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              {link.label}
              {publicPage === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('privacy')}
            className={`hover:text-purple-400 transition-colors whitespace-nowrap cursor-pointer py-1 ${
              publicPage === 'privacy' || publicPage === 'terms' ? 'text-purple-400' : 'text-slate-400 text-xs'
            }`}
          >
            {t('nav_legal', 'Legal & Policy')}
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
          <button
            onClick={() => handleNavClick('login')}
            className="px-4 py-2 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            {t('nav_login', 'Sign In')}
          </button>
          <button
            onClick={() => handleNavClick('register')}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{t('nav_register', 'Get Started')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B1021] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('privacy')}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {t('nav_privacy', 'Privacy Policy')}
          </button>
          <button
            onClick={() => handleNavClick('terms')}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {t('nav_terms', 'Terms & Conditions')}
          </button>
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('login')}
              className="w-full py-2 text-center text-xs font-medium text-slate-200 bg-slate-800 rounded-lg"
            >
              {t('nav_login', 'Log In')}
            </button>
            <button
              onClick={() => handleNavClick('register')}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-purple-600 rounded-lg"
            >
              {t('nav_register', 'Register')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

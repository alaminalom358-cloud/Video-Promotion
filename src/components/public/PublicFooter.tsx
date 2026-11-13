import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Shield, Globe, Award, Heart } from 'lucide-react';
import { PublicPage } from '../../types';

export const PublicFooter: React.FC = () => {
  const { setPublicPage, setRole, setVendorPage, setUserPage, lang } = useApp();
  const isBn = lang === 'bn';

  const handleNav = (p: PublicPage) => {
    setPublicPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <Play className="h-4 w-4 fill-white" />
              </div>
              <span className="text-lg font-bold text-white font-display tracking-tight">
                Promoview
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {isBn 
                ? 'উচ্চ ক্ষমতাসম্পন্ন ভিডিও প্রমোশন এবং ভেরিফায়েড রিওয়ার্ড প্ল্যাটফর্ম। ইউটিউব, টিকটক ও ভিমিওতে আসল ও মনোযোগী দর্শকের সাথে বিজ্ঞাপনদাতাদের সরাসরি সংযোগ ঘটায়।'
                : 'The high-performance video promotion and verified reward infrastructure. Connecting advertisers with real, attentive audiences across YouTube, TikTok, and Vimeo.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-400" /> {isBn ? 'এসওসি২ অনুমোদিত' : 'SOC2 Compliant'}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-purple-400" /> {isBn ? '১৮০+ দেশ' : '180+ Countries'}</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">{isBn ? 'প্ল্যাটফর্ম' : 'Platform'}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => handleNav('home')} className="hover:text-purple-400 transition-colors">{isBn ? 'হোম পেজ' : 'Home'}</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-purple-400 transition-colors">{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</button></li>
              <li><button onClick={() => handleNav('how-it-works')} className="hover:text-purple-400 transition-colors">{isBn ? 'কীভাবে কাজ করে' : 'How It Works'}</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-purple-400 transition-colors">{isBn ? 'যোগাযোগ ও সাপোর্ট' : 'Contact Support'}</button></li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">{isBn ? 'পোর্টালসমূহ' : 'Portals'}</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => { setRole('vendor'); setVendorPage('overview'); }} 
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  {isBn ? 'ভেন্ডর ও বিজ্ঞাপনদাতা পোর্টাল' : 'Vendor & Advertiser Portal'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setRole('user'); setUserPage('overview'); }} 
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  {isBn ? 'ইউজার রিওয়ার্ড পোর্টাল' : 'User Rewards Portal'}
                </button>
              </li>
              <li><button onClick={() => handleNav('register')} className="hover:text-purple-400 transition-colors">{isBn ? 'ক্রিয়েটর হিসেবে যুক্ত হোন' : 'Join as Creator'}</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">{isBn ? 'আইন ও শর্তাবলী' : 'Trust & Legal'}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => handleNav('privacy')} className="hover:text-purple-400 transition-colors">{isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</button></li>
              <li><button onClick={() => handleNav('terms')} className="hover:text-purple-400 transition-colors">{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}</button></li>
              <li><span className="text-slate-500">{isBn ? 'অ্যান্টি-ফ্রড আর্কিটেকচার' : 'Anti-Fraud Architecture'}</span></li>
              <li><span className="text-slate-500">{isBn ? 'কুকি সেটিংস' : 'Cookie Preferences'}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Promoview Media Network Inc. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</p>
          <p className="flex items-center gap-1">
            Engineered with deep blue, purple & white SaaS design system
          </p>
        </div>
      </div>
    </footer>
  );
};

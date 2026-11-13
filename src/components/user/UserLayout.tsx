import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPage } from '../../types';
import { 
  LayoutDashboard, 
  Compass, 
  Play, 
  Clock, 
  Coins, 
  History, 
  Gift, 
  Bell, 
  User, 
  Menu, 
  X, 
  Flame, 
  Award, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Lock
} from 'lucide-react';

import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { userPage, setUserPage, setRole, setPublicPage, currentUser, settings, handleFirebaseLogout, setLoginRoleTab, t, showToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { id: UserPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: t('user_overview', 'User Dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'discover', label: t('user_discover', 'Discover Campaigns'), icon: <Compass className="h-4 w-4 text-purple-400" />, badge: 'New' },
    { id: 'campaign-detail', label: t('user_campaign_details', 'Video Watcher & Claim'), icon: <Play className="h-4 w-4" /> },
    { id: 'my-activities', label: t('user_my_activities', 'My Activities'), icon: <Clock className="h-4 w-4" /> },
    { id: 'my-points', label: t('user_my_points', 'My Points Wallet'), icon: <Coins className="h-4 w-4" /> },
    { id: 'points-history', label: t('user_points_history', 'Points Ledger History'), icon: <History className="h-4 w-4" /> },
    { id: 'redeem', label: t('user_redeem_points', 'Redeem Points Store'), icon: <Gift className="h-4 w-4 text-emerald-400" /> },
    { id: 'notifications', label: t('user_notifications', 'Notifications'), icon: <Bell className="h-4 w-4" /> },
    { id: 'profile', label: t('user_profile', 'Profile & Referrals'), icon: <User className="h-4 w-4" /> }
  ];


  return (
    <div className="min-h-screen bg-[#0B1021] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-400 fill-purple-400" />
          <span className="font-bold text-sm text-white">Promoview Rewards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Brand */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <Play className="h-4 w-4 fill-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight">Promoview Rewards</p>
                <p className="text-[10px] text-purple-400 font-mono">EARNER PORTAL</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Points Widget */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-purple-950/40 to-slate-900/90 border border-purple-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Wallet Balance</span>
              <Coins className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {currentUser.points.toLocaleString()} <span className="text-xs text-purple-300 font-normal">pts</span>
              </p>
            </div>

            {(() => {
              const minPoints = Math.max(1, settings.minimumRedemptionPoints ?? 5000);
              const currentPoints = currentUser.points || 0;
              const isEligible = currentPoints >= minPoints;
              const progressPercent = Math.min(100, Math.floor((currentPoints / minPoints) * 100));
              const toBnDigits = (val: number | string) =>
                String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

              return (
                <div className="space-y-2">
                  {/* Withdrawal Button (Screenshot_7) - OFF / Disabled until admin-configured minPoints is reached */}
                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={() => {
                      if (!isEligible) {
                        showToast(
                          `সর্বনিম্ন ${toBnDigits(minPoints)} পয়েন্ট না হওয়া পর্যন্ত পয়েন্ট উত্তোলন করা যাবে না।`,
                          'error'
                        );
                        return;
                      }
                      setUserPage('redeem');
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isEligible
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 cursor-pointer'
                        : 'bg-slate-800/70 text-slate-500 border border-slate-700/60 opacity-55 cursor-not-allowed shadow-none'
                    }`}
                    title={
                      isEligible
                        ? 'পয়েন্ট উত্তোলন করুন (Withdrawal)'
                        : `সর্বনিম্ন ${toBnDigits(minPoints)} পয়েন্ট না হওয়া পর্যন্ত বাটনটি বন্ধ (OFF) থাকবে`
                    }
                  >
                    {isEligible ? (
                      <Gift className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>Withdrawal</span>
                  </button>

                  {/* সর্ব নিম্ন {minPoints} পয়েন্ট হলে উত্তোলন করার বক্স (Screenshot_6) */}
                  <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 shadow-inner">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1 text-[10.5px] leading-tight">
                        <span className="font-semibold text-purple-200">
                          সর্ব নিম্ন {toBnDigits(minPoints)} পয়েন্ট হলে উত্তোলন করা যাবে
                        </span>
                        <span
                          className={`font-mono font-bold text-xs shrink-0 ${
                            isEligible ? 'text-emerald-400' : 'text-purple-300'
                          }`}
                        >
                          {progressPercent}%
                        </span>
                      </div>

                      {/* যত পয়েন্ট হবে বক্স তত পরিমান পুরুন হবে */}
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEligible
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(progressPercent, currentPoints > 0 ? 3 : 0))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{currentPoints.toLocaleString()} pts</span>
                      <span>{toBnDigits(minPoints.toLocaleString('en-US'))} pts</span>
                    </div>

                    {isEligible ? (
                      <div className="text-[9.5px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/30">
                        <span>✓</span>
                        <span>১০০% পূরণ হয়েছে! পয়েন্ট উত্তোলন আনলক হয়েছে।</span>
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-400 leading-tight">
                        উত্তোলনের জন্য আরও{' '}
                        <span className="text-purple-300 font-mono font-semibold">
                          {(minPoints - currentPoints).toLocaleString()}
                        </span>{' '}
                        পয়েন্ট প্রয়োজন।
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Earn & Manage
            </p>
            {navItems.map((item) => {
              const isActive = userPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setUserPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/90 text-white font-semibold shadow-sm shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Profile */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-300 text-xs shadow-sm">
              <img src="/flower_avatar.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-purple-400">সদস্য প্রোফাইল</p>
            </div>
          </div>
          <button
            onClick={async () => {
              setLoginRoleTab('user');
              await handleFirebaseLogout('login');
              setRole('public');
              setPublicPage('login');
            }}
            title="Sign out of Rewards Portal"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-[33px] z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Rewards</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-purple-400 font-medium capitalize">
              {userPage.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle variant="compact" />
            <LanguageSelector variant="compact" />

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-mono text-purple-300">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold text-white tabular-nums">{currentUser.points.toLocaleString()} {t('pts', 'pts')}</span>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6 flex-1 bg-[#0B1021]">
          {children}
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPage } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  Archive, 
  Coins, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    adminPage, 
    setAdminPage, 
    setRole, 
    setPublicPage,
    campaigns, 
    redemptions, 
    handleFirebaseLogout,
    setLoginRoleTab,
    firebaseUser,
    t
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAdminLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setLoginRoleTab('user');
      await handleFirebaseLogout('login');
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      setRole('public');
      setPublicPage('login');
      setIsLoggingOut(false);
    }
  };

  const pendingCampaignsCount = campaigns.filter((c) => c.status === 'pending').length;
  const pendingRedemptionsCount = redemptions.filter((r) => r.status === 'pending').length;

  const navGroups: {
    title: string;
    items: { id: AdminPage; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      title: t('admin_group_overview', 'Overview'),
      items: [
        { id: 'overview', label: t('admin_overview', 'Admin Dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> }
      ]
    },
    {
      title: t('admin_group_moderation', 'Campaign Moderation'),
      items: [
        { 
          id: 'pending-campaigns', 
          label: t('admin_pending_campaigns', 'Pending Campaigns'), 
          icon: <Clock className="h-4 w-4" />,
          badge: pendingCampaignsCount 
        },
        { id: 'approved-campaigns', label: t('admin_approved_campaigns', 'Approved Campaigns'), icon: <CheckCircle className="h-4 w-4" /> },
        { id: 'active-campaigns', label: t('admin_active_campaigns', 'Active Campaigns'), icon: <PlayCircle className="h-4 w-4" /> },
        { id: 'rejected-campaigns', label: t('admin_rejected_campaigns', 'Rejected Campaigns'), icon: <XCircle className="h-4 w-4" /> },
        { id: 'expired-campaigns', label: t('admin_expired_campaigns', 'Expired Campaigns'), icon: <Archive className="h-4 w-4" /> }
      ]
    },
    {
      title: t('admin_group_accounts', 'Platform Accounts'),
      items: [
        { id: 'users', label: t('admin_user_management', 'User Management'), icon: <Users className="h-4 w-4" /> },
        { id: 'vendors', label: t('admin_vendor_management', 'Vendor Management'), icon: <Briefcase className="h-4 w-4" /> }
      ]
    },
    {
      title: t('admin_group_economy', 'Reward & Economy'),
      items: [
        { id: 'points-management', label: t('admin_points_management', 'Points Management'), icon: <Coins className="h-4 w-4" /> },
        { 
          id: 'redemptions', 
          label: t('admin_redemption_requests', 'Redemption Requests'), 
          icon: <CreditCard className="h-4 w-4" />,
          badge: pendingRedemptionsCount 
        }
      ]
    },
    {
      title: t('admin_group_system', 'System & Intelligence'),
      items: [
        { id: 'analytics', label: t('admin_reports', 'Reports & Analytics'), icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'notifications', label: t('admin_notifications', 'Notifications'), icon: <Bell className="h-4 w-4" /> },
        { id: 'settings', label: t('admin_settings', 'Website Settings'), icon: <Settings className="h-4 w-4" /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1021] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          <span className="font-bold text-sm text-white">Promoview Admin</span>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Brand Wordmark */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight leading-none">Admin Console</p>
                <p className="text-[10px] text-purple-400 font-mono mt-0.5">SUPER ADMIN ROOT</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const isActive = adminPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminPage(item.id);
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
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Profile / Logout */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img src="/flower_avatar.jpg" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">Al Amin</p>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate" title={firebaseUser?.email || 'alaminalom358@gmail.com'}>
                {firebaseUser?.email || 'alaminalom358@gmail.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleAdminLogout}
            disabled={isLoggingOut}
            title="লগআউট করে আবার লগইন করুন (Sign Out & Go to Login)"
            aria-label="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-lg transition-all cursor-pointer group disabled:opacity-50"
          >
            {isLoggingOut ? (
              <span className="h-4 w-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-[33px] z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Admin</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-purple-400 font-medium capitalize">
              {adminPage.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Global search ID, email, video..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle variant="compact" />
              <LanguageSelector variant="compact" />

              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono tabular-nums flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Node 01 Online</span>
              </span>

              <button
                onClick={handleAdminLogout}
                disabled={isLoggingOut}
                className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title="লগআউট করুন এবং লগইন পেজে যান"
              >
                {isLoggingOut ? (
                  <span className="h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="p-6 lg:p-8 space-y-6 flex-1 bg-[#0B1021]">
          {children}
        </main>
      </div>
    </div>
  );
};

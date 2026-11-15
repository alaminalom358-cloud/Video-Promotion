import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation } from '../i18n/translations';
import { 
  UserRole, 
  PublicPage, 
  AdminPage, 
  VendorPage, 
  UserPage, 
  Campaign, 
  UserAccount, 
  VendorAccount, 
  UserActivity, 
  PointTransaction, 
  RedemptionRequest, 
  NotificationItem, 
  PlatformSettings,
  CampaignStatus,
  VendorPointRequest,
  ThemeMode
} from '../types';
import { 
  INITIAL_CAMPAIGNS, 
  INITIAL_USERS, 
  INITIAL_VENDORS, 
  INITIAL_USER_ACTIVITIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_REDEMPTIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SETTINGS 
} from '../data/mockData';
import { auth, db, testConnection } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  registerViewerUser, 
  registerVendorAccount, 
  loginWithEmail, 
  loginWithGoogle, 
  logoutFirebaseUser, 
  sendPasswordReset, 
  initializeAdminAccount,
  fetchRoleAndProfile
} from '../lib/firebaseAuth';
import { 
  seedInitialFirestoreData, 
  getFirestoreCampaigns, 
  subscribeToFirestoreCampaigns,
  createFirestoreCampaign, 
  updateCampaignStatusInFirestore, 
  editCampaignInFirestore,
  toggleCampaignVisibilityInFirestore,
  deleteCampaignInFirestore,
  checkAndExpireCampaignsInFirestore,
  submitFirestoreRedemption, 
  adminProcessRedemptionInFirestore,
  submitUserActivityInFirestore,
  updatePlatformSettingsInFirestore,
  subscribeToFirestoreSettings,
  logActivity,
  subscribeToUserWallet,
  recordVideoWatchTimeAndPoints,
  updateVendorBalanceInFirestore,
  submitVendorPointRequestInFirestore,
  subscribeToVendorPointRequests,
  updateVendorPointRequestStatusInFirestore,
  subscribeToFirestoreUsers,
  subscribeToFirestoreVendors,
  deleteUserInFirestore,
  deleteVendorInFirestore,
  adjustUserPointsInFirestore,
  updateUserVideoCooldownInFirestore
} from '../lib/firestoreService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
  adminPage: AdminPage;
  setAdminPage: (page: AdminPage) => void;
  vendorPage: VendorPage;
  setVendorPage: (page: VendorPage) => void;
  userPage: UserPage;
  setUserPage: (page: UserPage) => void;
  
  // Active Campaign Detail Viewer
  activeCampaignId: string | null;
  openCampaignDetail: (id: string) => void;

  // Data Collections
  campaigns: Campaign[];
  users: UserAccount[];
  vendors: VendorAccount[];
  activities: UserActivity[];
  transactions: PointTransaction[];
  redemptions: RedemptionRequest[];
  notifications: NotificationItem[];
  settings: PlatformSettings;
  vendorPointRequests: VendorPointRequest[];
  
  // Current session mock and Firebase entities
  currentUser: UserAccount;
  currentVendor: VendorAccount;
  firebaseUser: FirebaseUser | null;
  authenticatedRole: UserRole | null;
  isFirebaseLoading: boolean;

  // Actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'currentViews' | 'budgetSpent'>) => void;
  approveCampaign: (id: string) => void;
  rejectCampaign: (id: string, reason?: string) => void;
  pauseCampaign: (id: string) => void;
  activateCampaign: (id: string) => void;
  toggleCampaignVisibility: (id: string, isVisible?: boolean) => void;
  editCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  adjustUserPoints: (userId: string, amount: number, reason: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateVendorStatus: (vendorId: string, status: 'verified' | 'suspended' | 'pending') => void;
  deleteVendor: (vendorId: string) => Promise<boolean>;
  collectVendorPoints: (amount: number) => Promise<boolean>;
  deductVendorPoints: (amount: number, reason?: string) => Promise<boolean>;
  adminAdjustVendorPoints: (vendorId: string, amount: number, mode: 'add' | 'set') => Promise<boolean>;
  requestVendorPoints: (points: number, whatsappNumber: string) => Promise<boolean>;
  adminApproveVendorPointRequest: (requestId: string) => Promise<boolean>;
  adminRejectVendorPointRequest: (requestId: string, reason?: string) => Promise<boolean>;
  processRedemption: (id: string, action: 'approve' | 'reject' | 'paid', options?: { transactionRef?: string; rejectionReason?: string }) => void;
  submitRedemption: (method: RedemptionRequest['method'], points: number, payoutAddress: string, accountType?: 'personal' | 'agent', whatsappNumber?: string) => boolean;
  submitActivityReward: (campaignId: string, activityType: 'feedback' | 'quiz' | 'survey' | 'review', payload?: any) => Promise<boolean>;
  claimVideoReward: (campaignId: string) => void;
  trackVideoWatchTime: (campaignId: string, campaignTitle: string, minutes: number, points: number, seconds: number) => Promise<boolean>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  
  // 4-Hour Video Cooldown Tracking (User-specific)
  videoCooldowns: Record<string, number>;
  getVideoCooldownRemaining: (campaignId: string) => { isLocked: boolean; remainingMs: number; formatted: string };
  recordVideoWatchClick: (campaignId: string) => boolean;
  setVideoCooldown: (campaignId: string, durationMs?: number) => void;
  clearVideoCooldown: (campaignId: string) => void;
  
  // Firebase Auth Integrations
  loginRoleTab: 'user' | 'vendor' | 'admin';
  setLoginRoleTab: (tab: 'user' | 'vendor' | 'admin') => void;
  handleFirebaseRegisterUser: (name: string, email: string, pass: string, country?: string) => Promise<boolean>;
  handleFirebaseRegisterVendor: (company: string, contact: string, email: string, pass: string, country?: string) => Promise<boolean>;
  handleFirebaseLogin: (email: string, pass: string) => Promise<boolean>;
  handleFirebaseGoogleLogin: () => Promise<boolean>;
  handleFirebaseLogout: (targetPage?: PublicPage) => Promise<void>;
  handleFirebaseResetPassword: (email: string) => Promise<boolean>;
  handleFirebaseInitAdmin: (name: string) => Promise<boolean>;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Language & i18n
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;

  // Theme (Dark / Light mode)
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [adminPage, setAdminPage] = useState<AdminPage>('overview');
  const [vendorPage, setVendorPage] = useState<VendorPage>('overview');
  const [userPage, setUserPage] = useState<UserPage>('overview');
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>('camp-101');

  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [vendors, setVendors] = useState<VendorAccount[]>(INITIAL_VENDORS);
  const [activities, setActivities] = useState<UserActivity[]>(INITIAL_USER_ACTIVITIES);
  const [transactions, setTransactions] = useState<PointTransaction[]>(INITIAL_TRANSACTIONS);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>(INITIAL_REDEMPTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [vendorPointRequests, setVendorPointRequests] = useState<VendorPointRequest[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Language State with persistence
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('promoview_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {}
    return 'bn'; // Defaulting to Bengali per user request, user can toggle anytime
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('promoview_lang', newLang);
    } catch {}
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(lang, key, fallback);
  };

  // Theme Mode State (Dark / Light) with persistence
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('promoview_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark'; // Defaulting to Dark Mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('promoview_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const [loginRoleTab, setLoginRoleTab] = useState<'user' | 'vendor' | 'admin'>('user');

  // Firebase State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [currentVendor, setCurrentVendor] = useState<VendorAccount>(INITIAL_VENDORS[0]);

  // 12-Hour Video Cooldown State (campaignId -> expiration timestamp in ms)
  const [videoCooldowns, setVideoCooldowns] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`promoview_cooldowns_${INITIAL_USERS[0].id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Real-time ticker to update cooldown remaining countdowns smoothly every second
  const [, setCooldownTicker] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldownTicker(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync cooldowns when currentUser changes or loads from Firestore
  useEffect(() => {
    if (!currentUser?.id) return;
    try {
      const savedLocal = localStorage.getItem(`promoview_cooldowns_${currentUser.id}`);
      const localMap = savedLocal ? JSON.parse(savedLocal) : {};
      const firestoreMap = currentUser.videoCooldowns || {};
      const merged = { ...localMap, ...firestoreMap };
      const cleaned: Record<string, number> = {};
      const now = Date.now();
      Object.entries(merged).forEach(([cId, expiry]) => {
        if (typeof expiry === 'number' && expiry > now) {
          cleaned[cId] = expiry;
        }
      });
      setVideoCooldowns(cleaned);
    } catch {}
  }, [currentUser?.id, currentUser?.videoCooldowns]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Firebase Startup Initialization & Real-Time Sync & Auth Listener
  useEffect(() => {
    let unsubscribeCampaigns: (() => void) | undefined;
    let unsubscribePointRequests: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeVendors: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    testConnection().then((connected) => {
      if (connected) {
        seedInitialFirestoreData();
        // 1. Subscribe to real-time campaign changes
        unsubscribeCampaigns = subscribeToFirestoreCampaigns((liveCampaigns) => {
          if (liveCampaigns) {
            setCampaigns(liveCampaigns);
            checkAndExpireCampaignsInFirestore(liveCampaigns);
          }
        });

        // 2. Subscribe to vendor point requests
        unsubscribePointRequests = subscribeToVendorPointRequests((liveRequests) => {
          if (liveRequests) {
            setVendorPointRequests(liveRequests);
          }
        });

        // 3. Subscribe to real-time users collection
        unsubscribeUsers = subscribeToFirestoreUsers((liveUsers) => {
          if (liveUsers && liveUsers.length > 0) {
            setUsers((prev) => {
              const userMap = new Map<string, UserAccount>();
              prev.forEach((u) => userMap.set(u.id, u));
              liveUsers.forEach((lu) => {
                const existing = userMap.get(lu.id);
                userMap.set(lu.id, { ...(existing || {}), ...lu });
              });
              return Array.from(userMap.values());
            });
          }
        });

        // 4. Subscribe to real-time vendors collection
        unsubscribeVendors = subscribeToFirestoreVendors((liveVendors) => {
          if (liveVendors && liveVendors.length > 0) {
            setVendors((prev) => {
              const vendorMap = new Map<string, VendorAccount>();
              prev.forEach((v) => vendorMap.set(v.id, v));
              liveVendors.forEach((lv) => {
                const existing = vendorMap.get(lv.id);
                vendorMap.set(lv.id, { ...(existing || {}), ...lv });
              });
              return Array.from(vendorMap.values());
            });
          }
        });

        // 5. Subscribe to real-time platform settings (including ad banners)
        unsubscribeSettings = subscribeToFirestoreSettings((liveSettings) => {
          if (liveSettings) {
            setSettings((prev) => ({ ...prev, ...liveSettings }));
          }
        });
      }
    });

    // 2. Periodic background check for completed campaigns, 2-day auto-deletion, and expiration every 30s
    const expirationInterval = setInterval(() => {
      setCampaigns((current) => {
        const now = new Date();
        const nowTime = now.getTime();

        // 1. Auto-delete campaigns that have been completed for >= 2 days (48 hours)
        const toDelete = current.filter((c) => {
          const targetMinutes = Number(c.totalTargetWatchMinutes || 0);
          const watchedMinutes = Number(c.totalWatchedMinutes || 0);
          const isCompleted = c.status === 'completed' || (targetMinutes > 0 && watchedMinutes >= targetMinutes);
          if (isCompleted) {
            const completedTime = c.completedAt ? new Date(c.completedAt).getTime() : 0;
            const autoDeleteTime = c.autoDeleteAt ? new Date(c.autoDeleteAt).getTime() : 0;
            return (autoDeleteTime > 0 && autoDeleteTime <= nowTime) ||
                   (completedTime > 0 && (nowTime - completedTime) >= 2 * 24 * 60 * 60 * 1000);
          }
          return false;
        });

        if (toDelete.length > 0) {
          toDelete.forEach((camp) => {
            deleteCampaignInFirestore(camp.id);
            console.log(`Campaign ${camp.id} (${camp.title}) auto-deleted from Firestore after 2 days of completion.`);
          });
        }

        const remaining = current.filter((c) => !toDelete.some((d) => d.id === c.id));

        // 2. Transition newly reached target campaigns to 'completed' and notify vendor
        const updated = remaining.map((c) => {
          const targetMinutes = Number(c.totalTargetWatchMinutes || 0);
          const watchedMinutes = Number(c.totalWatchedMinutes || 0);
          if (targetMinutes > 0 && watchedMinutes >= targetMinutes && c.status !== 'completed') {
            const completedAt = c.completedAt || now.toISOString();
            const autoDeleteAt = c.autoDeleteAt || new Date(nowTime + 2 * 24 * 60 * 60 * 1000).toISOString();

            // Dispatch notification to vendor
            const notifItem: NotificationItem = {
              id: `notif-comp-${c.id}-${Date.now()}`,
              title: 'ক্যাম্পেইন সম্পন্ন হয়েছে (Completed)',
              message: `আপনার ক্যাম্পেইন "${c.title}" এর নির্ধারিত লক্ষ্য (${targetMinutes} মিনিট) পূর্ণ হয়েছে। ভিডিওটির পার্টিসিপেশন বাটন স্বয়ংক্রিয়ভাবে ডিজেবল করা হয়েছে এবং ২ দিন পর এটি ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।`,
              targetRole: 'vendor',
              targetUserId: c.vendorId,
              vendorId: c.vendorId,
              campaignId: c.id,
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              type: 'campaign'
            };
            setNotifications((prevNotifs) => [notifItem, ...prevNotifs]);

            return {
              ...c,
              status: 'completed' as CampaignStatus,
              completedAt,
              autoDeleteAt
            };
          }
          return c;
        });

        // 3. Expiration date check
        const hasExpired = updated.some(
          (c) => (c.status === 'active' || c.status === 'approved') && c.expiresAt && new Date(c.expiresAt) <= now
        );
        if (hasExpired) {
          checkAndExpireCampaignsInFirestore(updated);
          return updated.map((c) => {
            if ((c.status === 'active' || c.status === 'approved') && c.expiresAt && new Date(c.expiresAt) <= now) {
              return { ...c, status: 'expired' as CampaignStatus };
            }
            return c;
          });
        }
        return updated;
      });
    }, 30000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);

      if (user) {
        try {
          const profile = await fetchRoleAndProfile(user.uid, user.email);
          setAuthenticatedRole(profile.role);
          if (profile.role === 'vendor' && profile.vendorDoc) {
            setCurrentVendor((prev) => ({ ...prev, ...profile.vendorDoc }));
          } else if (profile.role === 'user' && profile.userDoc) {
            setCurrentUser((prev) => ({ ...prev, ...profile.userDoc }));
          }
        } catch (err) {
          console.warn('Profile sync note:', err);
        }
      } else {
        setAuthenticatedRole(null);
        setRoleState((prevRole) => (prevRole !== 'public' ? 'public' : prevRole));
      }
    });

    return () => {
      if (unsubscribeCampaigns) unsubscribeCampaigns();
      if (unsubscribePointRequests) unsubscribePointRequests();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeVendors) unsubscribeVendors();
      if (unsubscribeSettings) unsubscribeSettings();
      clearInterval(expirationInterval);
      unsubscribeAuth();
    };
  }, []);

  // Real-time synchronization of current user wallet from Firestore
  useEffect(() => {
    // Only attach listener if Firebase user is authenticated and matches currentUser.id
    if (!firebaseUser || !currentUser?.id || firebaseUser.uid !== currentUser.id) return;
    
    const unsubWallet = subscribeToUserWallet(
      currentUser.id, 
      (walletData) => {
        if (walletData && walletData.points !== undefined) {
          setCurrentUser((prev) => {
            if (prev.points !== walletData.points || prev.totalWatchMinutes !== walletData.totalWatchMinutes) {
              return {
                ...prev,
                points: walletData.points,
                totalEarnedPoints: walletData.totalEarnedPoints ?? prev.totalEarnedPoints,
                totalWatchMinutes: walletData.totalWatchMinutes ?? prev.totalWatchMinutes,
                totalWatchSeconds: walletData.totalWatchSeconds ?? prev.totalWatchSeconds,
                pendingPoints: walletData.pendingPoints ?? prev.pendingPoints,
                redeemedPoints: walletData.redeemedPoints ?? prev.redeemedPoints
              };
            }
            return prev;
          });
        }
      },
      (err) => {
        console.warn('Wallet listener skipped or denied:', err?.message);
      }
    );

    return () => unsubWallet();
  }, [firebaseUser, currentUser?.id]);

  const setRole = (targetRole: UserRole) => {
    if (targetRole === 'public') {
      setRoleState('public');
      return;
    }

    if (!firebaseUser || authenticatedRole !== targetRole) {
      setRoleState('public');
      setPublicPage('login');
      if (targetRole === 'vendor') {
        setLoginRoleTab('vendor');
        showToast('ভেন্ডোর পোর্টালে প্রবেশ করতে প্রথমে আপনার ভেন্ডোর অ্যাকাউন্ট দিয়ে লগইন করুন।', 'info');
      } else if (targetRole === 'user') {
        setLoginRoleTab('user');
        showToast('ইউজার রিওয়ার্ড পোর্টালে প্রবেশ করতে প্রথমে আপনার ইউজার অ্যাকাউন্ট দিয়ে লগইন করুন।', 'info');
      } else {
        setLoginRoleTab('user');
        showToast('অনুগ্রহ করে প্রথমে লগইন করুন।', 'info');
      }
      return;
    }

    setRoleState(targetRole);
  };

  const openCampaignDetail = (id: string) => {
    if (!firebaseUser || authenticatedRole !== 'user') {
      setLoginRoleTab('user');
      setRoleState('public');
      setPublicPage('login');
      showToast('ভিডিও দেখে পয়েন্ট অর্জন করতে প্রথমে আপনার ইউজার অ্যাকাউন্ট দিয়ে লগইন করুন।', 'info');
      return;
    }
    const target = campaigns.find((c) => c.id === id);
    if (target && target.isVisibleToUsers === false) {
      showToast('এই ভিডিওটি বর্তমানে অ্যাডমিন কর্তৃক বন্ধ (OFF) রাখা হয়েছে।', 'error');
      return;
    }
    setActiveCampaignId(id);
    setRoleState('user');
    setUserPage('campaign-detail');
  };

  const getVideoCooldownRemaining = (campaignId: string) => {
    const expiry = videoCooldowns[campaignId];
    if (!expiry) return { isLocked: false, remainingMs: 0, formatted: '' };

    const remainingMs = expiry - Date.now();
    if (remainingMs <= 0) {
      return { isLocked: false, remainingMs: 0, formatted: '' };
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (lang === 'bn') {
      const toBn = (n: number) => n.toLocaleString('bn-BD');
      if (hours > 0) {
        formatted = `${toBn(hours)} ঘণ্টা ${toBn(minutes)} মি.`;
      } else if (minutes > 0) {
        formatted = `${toBn(minutes)} মিনিট ${toBn(seconds)} সে.`;
      } else {
        formatted = `${toBn(seconds)} সেকেন্ড`;
      }
    } else {
      if (hours > 0) {
        formatted = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        formatted = `${minutes}m ${seconds}s`;
      } else {
        formatted = `${seconds}s`;
      }
    }

    return {
      isLocked: true,
      remainingMs,
      formatted
    };
  };

  const setVideoCooldown = (campaignId: string, durationMs: number = 4 * 60 * 60 * 1000) => {
    const cooldownExpiry = Date.now() + durationMs;
    setVideoCooldowns((prev) => {
      const updated = { ...prev, [campaignId]: cooldownExpiry };
      try {
        localStorage.setItem(`promoview_cooldowns_${currentUser.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser?.id) {
      updateUserVideoCooldownInFirestore(currentUser.id, campaignId, cooldownExpiry);
    }
  };

  const clearVideoCooldown = (campaignId: string) => {
    setVideoCooldowns((prev) => {
      const updated = { ...prev };
      delete updated[campaignId];
      try {
        localStorage.setItem(`promoview_cooldowns_${currentUser.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser?.id) {
      updateUserVideoCooldownInFirestore(currentUser.id, campaignId, 0);
    }
  };

  const recordVideoWatchClick = (campaignId: string): boolean => {
    const target = campaigns.find((c) => c.id === campaignId);
    if (target && target.isVisibleToUsers === false) {
      showToast('এই ভিডিওটি বর্তমানে অ্যাডমিন কর্তৃক বন্ধ (OFF) রাখা হয়েছে।', 'error');
      return false;
    }

    const status = getVideoCooldownRemaining(campaignId);
    if (status.isLocked) {
      showToast(
        `এই ভিডিওটি ৪ ঘণ্টার জন্য লক রয়েছে। পুনরায় দেখা যাবে ${status.formatted} পর। অনুগ্রহ করে অন্য ভিডিও দেখুন।`,
        'info'
      );
      return false;
    }

    // Do NOT set cooldown here! The 4-hour cooldown must ONLY be activated after the user finishes 1 full run of the video.
    openCampaignDetail(campaignId);
    return true;
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'currentViews' | 'budgetSpent'>) => {
    const newId = `camp-${Date.now().toString().slice(-4)}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      currentViews: 0,
      budgetSpent: 0
    };
    setCampaigns((prev) => [newCampaign, ...prev]);

    // Save to Firestore (Real-time sync will broadcast)
    createFirestoreCampaign(newCampaign);

    showToast(`ভিডিও ক্যাম্পেইনটি সফলভাবে ফায়ারবেসে সেভ হয়েছে এবং অ্যাডমিনের বিচারাধীন (Pending) রয়েছে!`, 'success');
  };

  const approveCampaign = async (id: string) => {
    // When Admin approves, status becomes 'active' so it immediately appears in User Rewards!
    const nextStatus: CampaignStatus = 'active';

    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c))
    );
    await updateCampaignStatusInFirestore(id, nextStatus);

    showToast(`ক্যাম্পেইন অনুমোদন করা হয়েছে! ভিডিওটি এখন User Rewards-এ লাইভ প্রদর্শিত হচ্ছে এবং ইউজাররা দেখতে পারছে।`, 'success');
  };

  const rejectCampaign = async (id: string, reason?: string) => {
    const target = campaigns.find((c) => c.id === id);

    // 1. Remove permanently from local state
    setCampaigns((prev) => prev.filter((c) => c.id !== id));

    // 2. Permanently delete from Firebase Firestore
    await deleteCampaignInFirestore(id);

    // 3. Refund points to vendor wallet if points were deducted
    if (target && target.requiredTotalPoints && target.requiredTotalPoints > 0 && target.vendorId) {
      const refundPoints = target.requiredTotalPoints;

      if (currentVendor.id === target.vendorId) {
        setCurrentVendor((prev) => ({
          ...prev,
          balance: Math.round((prev.balance || 0) + refundPoints),
          totalSpent: Math.max(0, Math.round((prev.totalSpent || 0) - refundPoints))
        }));
      }

      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === target.vendorId) {
            const newBal = Math.round((v.balance || 0) + refundPoints);
            const newSpent = Math.max(0, Math.round((v.totalSpent || 0) - refundPoints));
            return { ...v, balance: newBal, totalSpent: newSpent };
          }
          return v;
        })
      );

      try {
        const v = vendors.find((vend) => vend.id === target.vendorId);
        const curBal = (v ? v.balance : currentVendor.balance) || 0;
        await updateVendorBalanceInFirestore(
          target.vendorId,
          Math.round(curBal + refundPoints),
          undefined,
          `Refund ${refundPoints} points for rejected video campaign "${target.title}"`
        );
      } catch (err) {
        console.warn('Vendor refund sync note:', err);
      }
    }

    showToast(
      `ক্যাম্পেইনটি বাতিল করা হয়েছে এবং ভিডিওটি সিস্টেম ও ফায়ারবেস থেকে সফলভাবে ডিলিট করা হয়েছে!`,
      'info'
    );
  };

  const pauseCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paused' as CampaignStatus } : c))
    );
    updateCampaignStatusInFirestore(id, 'paused');
    showToast('Campaign paused. Hidden from user discovery.', 'info');
  };

  const activateCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' as CampaignStatus } : c))
    );
    updateCampaignStatusInFirestore(id, 'active');
    showToast('Campaign activated! Now visible on User Discovery.', 'success');
  };

  const toggleCampaignVisibility = (id: string, isVisible?: boolean) => {
    const current = campaigns.find((c) => c.id === id);
    const nextVisible = isVisible !== undefined ? isVisible : current?.isVisibleToUsers === false;

    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVisibleToUsers: nextVisible } : c))
    );
    toggleCampaignVisibilityInFirestore(id, nextVisible);
    showToast(
      nextVisible
        ? 'ভিডিওটি চালু (ON) করা হয়েছে! ইউজাররা এখন এই ভিডিওটি দেখতে পারবে।'
        : 'ভিডিওটি বন্ধ (OFF) করা হয়েছে! ইউজাররা আর এই ভিডিওটি দেখতে পারবে না।',
      nextVisible ? 'success' : 'info'
    );
  };

  const editCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    editCampaignInFirestore(id, updates);
    showToast('Campaign details updated and synchronized.', 'success');
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    deleteCampaignInFirestore(id);
    showToast('Campaign removed from platform.', 'info');
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    showToast(`User status updated to ${status}.`, 'info');
  };

  const adjustUserPoints = async (userId: string, amount: number, reason: string): Promise<boolean> => {
    // 1. Optimistic update in users list
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newPts = Math.max(0, (u.points || 0) + amount);
          const newTotal = amount > 0 ? (u.totalEarnedPoints || u.points) + amount : (u.totalEarnedPoints || u.points);
          return { ...u, points: newPts, totalEarnedPoints: newTotal };
        }
        return u;
      })
    );

    // 2. Synchronize current active viewer if they are this user (Screenshot 27 Wallet Balance)
    setCurrentUser((prev) => {
      if (prev && prev.id === userId) {
        const newPts = Math.max(0, (prev.points || 0) + amount);
        const newTotal = amount > 0 ? (prev.totalEarnedPoints || prev.points) + amount : (prev.totalEarnedPoints || prev.points);
        return { ...prev, points: newPts, totalEarnedPoints: newTotal };
      }
      return prev;
    });

    // 3. Local transaction ledger
    const newTx: PointTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      userId,
      type: 'admin_adjustment',
      points: amount,
      description: `Admin manual adjustment: ${reason}`,
      timestamp: new Date().toLocaleString(),
      status: amount >= 0 ? 'credited' : 'debited'
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 4. Persist to Firestore: user_wallets, users, point_transactions
    try {
      const res = await adjustUserPointsInFirestore(userId, amount, reason);
      if (res.success) {
        showToast(`ইউজার ব্যালেন্সে ${amount > 0 ? '+' : ''}${amount} পয়েন্ট সফলভাবে যোগ হয়েছে (Wallet Balance: ${res.newPoints} pts)।`, 'success');
        return true;
      } else {
        showToast(`পয়েন্ট সফলভাবে সমন্বয় করা হয়েছে।`, 'success');
        return true;
      }
    } catch (e: any) {
      console.warn('adjustUserPoints firestore error:', e);
      showToast(`ব্যালেন্সে পয়েন্ট সমন্বয় সম্পন্ন হয়েছে।`, 'success');
      return true;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    const targetUser = users.find((u) => u.id === userId);
    const userName = targetUser?.name || 'User';

    // 1. Remove permanently from local state
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // 2. Permanently delete from Firebase Firestore
    const ok = await deleteUserInFirestore(userId);
    if (ok) {
      showToast(`ইউজার "${userName}" সফলভাবে ফায়ারবেস ডেটাবেস থেকে স্থায়ীভাবে ডিলিট করা হয়েছে।`, 'success');
    } else {
      showToast(`ইউজার "${userName}" ডিলিট সম্পন্ন হয়েছে।`, 'info');
    }
    return true;
  };

  const updateVendorStatus = (vendorId: string, status: 'verified' | 'suspended' | 'pending') => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status } : v))
    );
    showToast(`Vendor status updated to ${status}.`, 'info');
  };

  const deleteVendor = async (vendorId: string): Promise<boolean> => {
    const targetVendor = vendors.find((v) => v.id === vendorId);
    const vendorName = targetVendor?.companyName || targetVendor?.contactName || 'Vendor';

    // 1. Remove permanently from local state
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));

    // 2. Permanently delete from Firebase Firestore
    const ok = await deleteVendorInFirestore(vendorId);
    if (ok) {
      showToast(`ভেন্ডোর "${vendorName}" সফলভাবে ফায়ারবেস ডেটাবেস থেকে স্থায়ীভাবে ডিলিট করা হয়েছে।`, 'success');
    } else {
      showToast(`ভেন্ডোর "${vendorName}" ডিলিট সম্পন্ন হয়েছে।`, 'info');
    }
    return true;
  };

  const collectVendorPoints = async (amount: number): Promise<boolean> => {
    if (amount <= 0) {
      showToast('অনুগ্রহ করে সঠিক পয়েন্ট পরিমাণ উল্লেখ করুন।', 'error');
      return false;
    }
    const currentBalance = currentVendor.balance || 0;
    // For first time or subsequent collection, new balance is currentBalance + amount
    const newBalance = Math.round(currentBalance + amount);

    setCurrentVendor((prev) => ({
      ...prev,
      balance: newBalance
    }));

    setVendors((prev) =>
      prev.map((v) => (v.id === currentVendor.id ? { ...v, balance: newBalance } : v))
    );

    await updateVendorBalanceInFirestore(
      currentVendor.id,
      newBalance,
      currentVendor.totalSpent,
      `Vendor collected ${amount} points from Admin`
    );

    showToast(`অ্যাডমিনের নিকট থেকে ${amount.toLocaleString()} পয়েন্ট সফলভাবে ওয়ালেটে যোগ হয়েছে! বর্তমান ব্যালেন্স: ${newBalance.toLocaleString()} পয়েন্ট`, 'success');
    return true;
  };

  const deductVendorPoints = async (amount: number, reason?: string): Promise<boolean> => {
    if (amount <= 0) return true;
    const currentBalance = currentVendor.balance || 0;
    if (currentBalance < amount) {
      showToast(
        `অপর্যাপ্ত পয়েন্ট ব্যালেন্স! আপনার ব্যালেন্স আছে মাত্র ${currentBalance.toLocaleString()} পয়েন্ট, কিন্তু প্রয়োজন ${amount.toLocaleString()} পয়েন্ট। অনুগ্রহ করে অ্যাডমিন থেকে পয়েন্ট সংগ্রহ করুন।`,
        'error'
      );
      return false;
    }

    const newBalance = Math.max(0, Math.round(currentBalance - amount));
    const newTotalSpent = Math.round((currentVendor.totalSpent || 0) + amount);

    setCurrentVendor((prev) => ({
      ...prev,
      balance: newBalance,
      totalSpent: newTotalSpent
    }));

    setVendors((prev) =>
      prev.map((v) => (v.id === currentVendor.id ? { ...v, balance: newBalance, totalSpent: newTotalSpent } : v))
    );

    await updateVendorBalanceInFirestore(
      currentVendor.id,
      newBalance,
      newTotalSpent,
      reason || `Vendor spent ${amount} points for campaign`
    );

    return true;
  };

  const adminAdjustVendorPoints = async (vendorId: string, amount: number, mode: 'add' | 'set'): Promise<boolean> => {
    let newBalance = 0;
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          newBalance = mode === 'add' ? Math.max(0, Math.round((v.balance || 0) + amount)) : Math.max(0, Math.round(amount));
          return { ...v, balance: newBalance };
        }
        return v;
      })
    );

    if (currentVendor.id === vendorId) {
      setCurrentVendor((prev) => ({ ...prev, balance: newBalance }));
    }

    await updateVendorBalanceInFirestore(
      vendorId,
      newBalance,
      undefined,
      `Admin adjusted vendor points (${mode === 'add' ? `+${amount}` : `set to ${amount}`})`
    );

    showToast(`ভেন্ডোর পয়েন্ট আপডেট সম্পন্ন হয়েছে! বর্তমান ব্যালেন্স: ${newBalance.toLocaleString()} পয়েন্ট`, 'success');
    return true;
  };

  const requestVendorPoints = async (points: number, whatsappNumber: string): Promise<boolean> => {
    if (points <= 0) {
      showToast('অনুগ্রহ করে সঠিক পয়েন্ট লিখুন।', 'error');
      return false;
    }
    if (!whatsappNumber || whatsappNumber.trim().length < 6) {
      showToast('অনুগ্রহ করে সঠিক WhatsApp নম্বর প্রদান করুন।', 'error');
      return false;
    }

    const newRequest: VendorPointRequest = {
      id: `vpr-${Date.now().toString().slice(-6)}`,
      vendorId: currentVendor.id,
      vendorName: currentVendor.companyName,
      vendorEmail: currentVendor.email,
      pointsRequested: points,
      whatsappNumber: whatsappNumber.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setVendorPointRequests((prev) => [newRequest, ...prev]);

    // Save to Firestore
    await submitVendorPointRequestInFirestore(newRequest);

    showToast(
      `অ্যাডমিনের নিকট পয়েন্ট সংগ্রহের আবেদন সফলভাবে পাঠানো হয়েছে (পয়েন্ট: ${points.toLocaleString()}, WhatsApp: ${whatsappNumber.trim()})! অ্যাডমিন অনুমতি দিলে আপনার ওয়ালেটে পয়েন্ট যুক্ত হবে।`,
      'success'
    );
    return true;
  };

  const adminApproveVendorPointRequest = async (requestId: string): Promise<boolean> => {
    const req = vendorPointRequests.find((r) => r.id === requestId);
    if (!req) return false;

    setVendorPointRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r))
    );

    let targetVendorBalance = 0;
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === req.vendorId) {
          targetVendorBalance = Math.round((v.balance || 0) + req.pointsRequested);
          return { ...v, balance: targetVendorBalance };
        }
        return v;
      })
    );

    if (currentVendor.id === req.vendorId) {
      setCurrentVendor((prev) => ({
        ...prev,
        balance: Math.round((prev.balance || 0) + req.pointsRequested)
      }));
    }

    await updateVendorPointRequestStatusInFirestore(requestId, 'approved');
    await updateVendorBalanceInFirestore(
      req.vendorId,
      targetVendorBalance,
      undefined,
      `Admin approved WhatsApp point request ${requestId} (+${req.pointsRequested} pts)`
    );

    showToast(
      `অনুমোদন সম্পন্ন! ${req.vendorName}-এর ওয়ালেটে ${req.pointsRequested.toLocaleString()} পয়েন্ট সফলভাবে যোগ করা হয়েছে।`,
      'success'
    );
    return true;
  };

  const adminRejectVendorPointRequest = async (requestId: string, reason?: string): Promise<boolean> => {
    const req = vendorPointRequests.find((r) => r.id === requestId);
    if (!req) return false;

    setVendorPointRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString(), adminNote: reason } : r))
    );

    await updateVendorPointRequestStatusInFirestore(requestId, 'rejected', reason);
    showToast(`ভেন্ডোর পয়েন্ট রিকোয়েস্ট বাতিল করা হয়েছে।`, 'info');
    return true;
  };

  const processRedemption = (
    id: string,
    action: 'approve' | 'reject' | 'paid',
    options?: { transactionRef?: string; rejectionReason?: string }
  ) => {
    const target = redemptions.find((r) => r.id === id);
    if (!target) return;

    if (action === 'paid') {
      const trx = (options?.transactionRef || `TRX${Date.now().toString().slice(-8)}`).trim();
      const paidTime = new Date().toLocaleString();
      setRedemptions((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'paid', transactionRef: trx, paidAt: paidTime } : r
        )
      );

      // Automatically update the Transaction in User Rewards Point History
      // so Screenshot 28 TrxID replaces generic tx-8357!
      setTransactions((prev) => {
        let matched = false;
        const updated = prev.map((tx) => {
          const isThisRedemption = 
            tx.redemptionId === id ||
            (tx.type === 'redemption' && tx.userId === target.userId && (tx.points === -target.pointsUsed || tx.status === 'pending'));
          
          if (isThisRedemption && !matched) {
            matched = true;
            return {
              ...tx,
              id: trx, // TrxID from Screenshot 28 replaces tx-8357
              transactionRef: trx,
              redemptionId: id,
              status: 'debited' as const,
              description: `উত্তোলন সম্পন্ন (${target.method.toUpperCase()} TrxID: ${trx}) - ৳${target.cashValueBdt} টাকা`
            };
          }
          return tx;
        });

        // If no matching transaction found, add one with the exact TrxID
        if (!matched) {
          return [
            {
              id: trx,
              userId: target.userId,
              redemptionId: id,
              type: 'redemption',
              points: -target.pointsUsed,
              activityName: `উত্তোলন পরিশোধ (${target.method.toUpperCase()})`,
              description: `উত্তোলন সম্পন্ন (${target.method.toUpperCase()} TrxID: ${trx}) - ৳${target.cashValueBdt} টাকা`,
              timestamp: paidTime,
              status: 'debited' as const,
              transactionRef: trx
            },
            ...updated
          ];
        }
        return updated;
      });

      // Move points from pending to redeemed in user wallet
      setCurrentUser((prev) => ({
        ...prev,
        pendingPoints: Math.max(0, (prev.pendingPoints || 0) - target.pointsUsed),
        redeemedPoints: (prev.redeemedPoints || 0) + target.pointsUsed
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.userId
            ? {
                ...u,
                pendingPoints: Math.max(0, (u.pendingPoints || 0) - target.pointsUsed),
                redeemedPoints: (u.redeemedPoints || 0) + target.pointsUsed
              }
            : u
        )
      );
      adminProcessRedemptionInFirestore(id, 'paid', { transactionRef: trx, redemption: target });
      showToast(`Payout marked as PAID (${target.method.toUpperCase()} TrxID: ${trx}).`, 'success');
    } else if (action === 'approve') {
      setRedemptions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
      );
      adminProcessRedemptionInFirestore(id, 'approve', { redemption: target });
      showToast(`Redemption request ${id} approved for disbursement.`, 'success');
    } else if (action === 'reject') {
      const reason = options?.rejectionReason || 'Failed anti-cheat verification.';
      setRedemptions((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r
        )
      );
      // Refund points back to user's spendable balance
      setCurrentUser((prev) => ({
        ...prev,
        points: prev.points + target.pointsUsed,
        pendingPoints: Math.max(0, (prev.pendingPoints || 0) - target.pointsUsed)
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.userId
            ? {
                ...u,
                points: u.points + target.pointsUsed,
                pendingPoints: Math.max(0, (u.pendingPoints || 0) - target.pointsUsed)
              }
            : u
        )
      );
      // Add refund transaction to point history
      const refundTx: PointTransaction = {
        id: `tx-ref-${Date.now().toString().slice(-4)}`,
        userId: target.userId,
        type: 'redemption_refund',
        points: target.pointsUsed,
        description: `Refund: Rejected ${target.method.toUpperCase()} payout (${reason})`,
        timestamp: new Date().toLocaleString(),
        status: 'credited'
      };
      setTransactions((prev) => [refundTx, ...prev]);

      adminProcessRedemptionInFirestore(id, 'reject', { rejectionReason: reason, redemption: target });
      showToast(`Redemption rejected. ${target.pointsUsed.toLocaleString()} pts refunded to user wallet.`, 'info');
    }
  };

  const submitRedemption = (
    method: RedemptionRequest['method'],
    points: number,
    payoutAddress: string,
    accountType: 'personal' | 'agent' = 'personal',
    whatsappNumber?: string
  ): boolean => {
    const minRequired = Math.max(1, settings.minimumRedemptionPoints ?? 5000);
    if ((currentUser.points || 0) < minRequired) {
      showToast(
        `সর্বনিম্ন ${minRequired.toLocaleString()} পয়েন্ট না হওয়া পর্যন্ত উত্তোলন করা যাবে না।`,
        'error'
      );
      return false;
    }

    if (currentUser.points < points) {
      showToast('Insufficient points balance for this redemption.', 'error');
      return false;
    }

    const cashValueUsd = Number((points / settings.pointsToUsdRate).toFixed(2));
    const cashValueBdt = Math.round((points / 1000) * (settings.pointsToBdtRate || 120));

    const newRedemption: RedemptionRequest = {
      id: `red-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      method,
      pointsUsed: points,
      cashValueUsd,
      cashValueBdt,
      payoutAddress,
      whatsappNumber,
      accountType,
      requestedAt: new Date().toLocaleString(),
      status: 'pending'
    };

    setRedemptions((prev) => [newRedemption, ...prev]);

    // Save to Firestore
    submitFirestoreRedemption(newRedemption);

    // Reserve points in state (available -> pending)
    setCurrentUser((prev) => ({
      ...prev,
      points: prev.points - points,
      pendingPoints: (prev.pendingPoints || 0) + points
    }));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              points: u.points - points,
              pendingPoints: (u.pendingPoints || 0) + points
            }
          : u
      )
    );

    // Record transaction
    const newTx: PointTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      redemptionId: newRedemption.id,
      userId: currentUser.id,
      type: 'redemption',
      points: -points,
      activityName: `উত্তোলন আবেদন (${method.toUpperCase()})`,
      description: `Redeemed ${cashValueBdt} BDT via ${method.toUpperCase()} (${payoutAddress})`,
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(
      `Redemption request for ${cashValueBdt} BDT via ${method.toUpperCase()} submitted! Processing in 1-24h.`,
      'success'
    );
    return true;
  };

  const submitActivityReward = async (
    campaignId: string,
    activityType: 'feedback' | 'quiz' | 'survey' | 'review',
    payload?: any
  ): Promise<boolean> => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      showToast('Campaign not found.', 'error');
      return false;
    }

    // 1. Client-side duplicate check
    const alreadyDone = activities.some(
      (a) => a.userId === currentUser.id && a.campaignId === campaignId && a.activityType === activityType
    );
    if (alreadyDone) {
      showToast(`You have already completed this ${activityType} activity for this campaign. Duplicate rewards are prohibited.`, 'error');
      return false;
    }

    // Determine activity points and labels
    const pointsToAward = settings.activityPoints?.[activityType] || (
      activityType === 'quiz' ? 20 : activityType === 'feedback' ? 10 : activityType === 'survey' ? 15 : 25
    );

    const activityNames: Record<string, string> = {
      feedback: 'Campaign Feedback Completion',
      quiz: 'Comprehension Quiz Verification',
      survey: 'Audience Preference Survey',
      review: 'Verified Campaign Review'
    };
    const activityName = activityNames[activityType] || 'User Engagement Activity';

    // 2. Submit to Firestore with server validation
    const result = await submitUserActivityInFirestore({
      userId: currentUser.id,
      userName: currentUser.name,
      campaign,
      activityType,
      activityName,
      pointsToAward,
      rating: payload?.rating,
      reviewComment: payload?.reviewComment,
      feedbackResponses: payload?.feedbackResponses,
      surveyAnswers: payload?.surveyAnswers
    });

    if (!result.success) {
      showToast(result.message, 'error');
      return false;
    }

    // 3. Update local state
    const newAct: UserActivity = {
      id: `act-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      activityType,
      activityName,
      platform: campaign.platform,
      watchedAt: new Date().toLocaleString(),
      durationWatched: 0,
      pointsEarned: pointsToAward,
      status: 'completed',
      rating: payload?.rating,
      reviewComment: payload?.reviewComment,
      feedbackResponses: payload?.feedbackResponses,
      surveyAnswers: payload?.surveyAnswers
    };
    setActivities((prev) => [newAct, ...prev]);

    // Update User Wallet in state
    setCurrentUser((prev) => ({
      ...prev,
      points: prev.points + pointsToAward,
      totalEarnedPoints: prev.totalEarnedPoints + pointsToAward
    }));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              points: u.points + pointsToAward,
              totalEarnedPoints: u.totalEarnedPoints + pointsToAward
            }
          : u
      )
    );

    // Record Transaction
    const newTx: PointTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      type: `${activityType}_reward` as any,
      activityName,
      points: pointsToAward,
      description: `${activityName}: ${campaign.title.slice(0, 32)}...`,
      timestamp: new Date().toLocaleString(),
      status: 'credited'
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(result.message, 'success');
    return true;
  };

  const claimVideoReward = (campaignId: string) => {
    submitActivityReward(campaignId, 'feedback', { rating: 5 });
  };

  const trackVideoWatchTime = async (
    campaignId: string,
    campaignTitle: string,
    minutes: number,
    points: number,
    seconds: number
  ): Promise<boolean> => {
    // 1. Optimistic state update
    setCurrentUser((prev) => ({
      ...prev,
      points: prev.points + points,
      totalEarnedPoints: prev.totalEarnedPoints + points,
      totalWatchMinutes: (prev.totalWatchMinutes || 0) + minutes,
      totalWatchSeconds: (prev.totalWatchSeconds || 0) + seconds
    }));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              points: u.points + points,
              totalEarnedPoints: u.totalEarnedPoints + points,
              totalWatchMinutes: (u.totalWatchMinutes || 0) + minutes,
              totalWatchSeconds: (u.totalWatchSeconds || 0) + seconds
            }
          : u
      )
    );

    // 2. Add to transaction history
    const newTx: PointTransaction = {
      id: `tx-watch-${Date.now()}`,
      userId: currentUser.id,
      type: 'watch_reward',
      activityName: 'Video Watch Duration',
      points,
      description: `Watched ${minutes} min on "${campaignTitle.slice(0, 32)}" (+${points} pts)`,
      timestamp: new Date().toLocaleString(),
      status: 'credited'
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Update Campaign Total Watched Minutes across all users and handle Auto-Completion
    setCampaigns((prev) => {
      return prev.map((c) => {
        if (c.id === campaignId) {
          const newWatched = Number(c.totalWatchedMinutes || 0) + minutes;
          const targetMinutes = Number(c.totalTargetWatchMinutes || 0);

          if (targetMinutes > 0 && newWatched >= targetMinutes) {
            // Target minutes reached! Do NOT delete immediately.
            // Mark as 'completed' and schedule 2-day (48-hour) auto-deletion.
            const now = new Date();
            const completedAt = c.completedAt || now.toISOString();
            const autoDeleteAt = c.autoDeleteAt || new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

            // Send notification message to the vendor if not already sent
            if (c.status !== 'completed') {
              const vendorMsg = `আপনার ক্যাম্পেইন "${c.title}" এর নির্ধারিত লক্ষ্য (${targetMinutes} মিনিট) পূর্ণ হয়েছে। ভিডিওটির পার্টিসিপেশন বাটন স্বয়ংক্রিয়ভাবে ডিজেবল করা হয়েছে এবং ২ দিন পর এটি ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।`;
              const vendorNotif: NotificationItem = {
                id: `notif-comp-${campaignId}-${Date.now()}`,
                title: 'ক্যাম্পেইন সম্পন্ন হয়েছে (Completed)',
                message: vendorMsg,
                targetRole: 'vendor',
                targetUserId: c.vendorId,
                vendorId: c.vendorId,
                campaignId,
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type: 'campaign'
              };
              setNotifications((prevNotifs) => [vendorNotif, ...prevNotifs]);

              showToast(
                `ভিডিওটির লক্ষ্যমাত্রা (${targetMinutes} মিনিট) পূর্ণ হয়েছে! ক্যাম্পেইনটি Completed হয়েছে এবং পার্টিসিপেশন বন্ধ হয়েছে। ২ দিন পর ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।`,
                'info'
              );
            }

            return {
              ...c,
              status: 'completed' as CampaignStatus,
              totalWatchedMinutes: newWatched,
              currentViews: (c.currentViews || 0) + 1,
              completedAt,
              autoDeleteAt
            };
          }

          return {
            ...c,
            totalWatchedMinutes: newWatched,
            currentViews: (c.currentViews || 0) + 1
          };
        }
        return c;
      });
    });

    // 4. Persist to Firestore by User ID and update campaign in Firestore
    try {
      await recordVideoWatchTimeAndPoints(
        currentUser.id,
        campaignId,
        campaignTitle,
        minutes,
        points,
        seconds
      );
    } catch (err) {
      console.warn('Persist watch points note:', err);
    }

    return true;
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      createdAt: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast('Broadcast notification sent to platform users.', 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    updatePlatformSettingsInFirestore(newSettings);
    showToast('Platform configuration saved successfully.', 'success');
  };

  // Firebase Auth Handlers
  const handleFirebaseRegisterUser = async (name: string, email: string, pass: string, country = 'United States'): Promise<boolean> => {
    try {
      const bonus = settings.signupBonus || 0;
      const user = await registerViewerUser(name, email, pass, country, bonus);
      const newViewerUser: UserAccount = {
        id: user.uid,
        name,
        email,
        avatar: '/flower_avatar.jpg',
        role: 'user',
        points: bonus,
        totalEarnedPoints: bonus,
        totalWatchMinutes: 0,
        totalWatchSeconds: 0,
        pendingPoints: 0,
        redeemedPoints: 0,
        watchStreak: 1,
        tier: 'Bronze',
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        totalVideosWatched: 0,
        country
      };
      setCurrentUser(newViewerUser);
      setUsers((prev) => [newViewerUser, ...prev.filter((u) => u.id !== newViewerUser.id && u.email !== newViewerUser.email)]);
      setAuthenticatedRole('user');
      setRoleState('user');
      setUserPage('overview');
      if (bonus > 0) {
        showToast(`Welcome ${name}! Account registered with Firebase. +${bonus} Welcome Bonus Points credited.`, 'success');
      } else {
        showToast(`Welcome ${name}! Account registered with Firebase. Start watching videos to earn points!`, 'success');
      }
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Firebase Registration Failed.', 'error');
      return false;
    }
  };

  const handleFirebaseRegisterVendor = async (
    company: string, 
    contact: string, 
    email: string, 
    pass: string,
    country = 'United States'
  ): Promise<boolean> => {
    try {
      const user = await registerVendorAccount(company, contact, email, pass, country);
      const finalCompanyName = company && company.trim() ? company.trim() : `${contact} Media`;
      const newVendorAccount: VendorAccount = {
        id: user.uid,
        companyName: finalCompanyName,
        contactName: contact,
        email,
        avatar: '/src/assets/images/avatar_creator_vendor_1793714105004.jpg',
        country: country || 'United States',
        balance: 0.00,
        totalSpent: 0.00,
        activeCampaignsCount: 0,
        totalCampaignsCount: 0,
        status: 'pending',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setCurrentVendor(newVendorAccount);
      setVendors((prev) => [newVendorAccount, ...prev.filter((v) => v.id !== newVendorAccount.id && v.email !== newVendorAccount.email)]);
      setAuthenticatedRole('vendor');
      setRoleState('vendor');
      setVendorPage('overview');
      showToast(`Welcome ${finalCompanyName}! Vendor registered in Firebase. Pending verification.`, 'success');
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Vendor Registration Failed.', 'error');
      return false;
    }
  };

  const handleFirebaseLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await loginWithEmail(email, pass);
      setAuthenticatedRole(result.role);
      setRoleState(result.role);
      if (result.role === 'admin') setAdminPage('overview');
      if (result.role === 'vendor') setVendorPage('overview');
      if (result.role === 'user') setUserPage('overview');
      showToast(
        result.role === 'admin'
          ? `অ্যাডমিন হিসেবে লগইন সফল হয়েছে! (${normalizedEmail})`
          : `Signed in successfully as ${result.role.toUpperCase()}.`,
        'success'
      );
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Authentication Failed.', 'error');
      return false;
    }
  };

  const handleFirebaseGoogleLogin = async (): Promise<boolean> => {
    try {
      const result = await loginWithGoogle();
      setAuthenticatedRole(result.role);
      setRoleState(result.role);
      if (result.role === 'admin') setAdminPage('overview');
      if (result.role === 'vendor') setVendorPage('overview');
      if (result.role === 'user') setUserPage('overview');
      showToast(`Google Sign-In successful. Welcome!`, 'success');
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Google Sign-In failed.', 'error');
      return false;
    }
  };

  const handleFirebaseLogout = async (targetPage: PublicPage = 'login') => {
    try {
      await logoutFirebaseUser();
    } catch (err: any) {
      console.warn('Firebase signout note:', err);
    } finally {
      setFirebaseUser(null);
      setAuthenticatedRole(null);
      setRoleState('public');
      setPublicPage(targetPage);
      showToast('লগআউট সম্পন্ন হয়েছে। আপনি এখন পুনরায় লগইন করতে পারেন।', 'info');
    }
  };

  const handleFirebaseResetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordReset(email);
      showToast(`Password reset link sent to ${email} via Firebase Auth.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Could not send reset email.', 'error');
      return false;
    }
  };

  const handleFirebaseInitAdmin = async (name: string): Promise<boolean> => {
    try {
      const success = await initializeAdminAccount(name);
      if (success) {
        setAuthenticatedRole('admin');
        setRoleState('admin');
        setAdminPage('overview');
        showToast('Admin account successfully initialized in Firebase Firestore!', 'success');
        return true;
      } else {
        showToast('Unauthorized: Admin bootstrap is restricted to verified owner.', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Admin initialization failed.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        publicPage,
        setPublicPage,
        adminPage,
        setAdminPage,
        vendorPage,
        setVendorPage,
        userPage,
        setUserPage,
        activeCampaignId,
        openCampaignDetail,
        campaigns,
        users,
        vendors,
        activities,
        transactions,
        redemptions,
        notifications,
        settings,
        vendorPointRequests,
        currentUser,
        currentVendor,
        firebaseUser,
        authenticatedRole,
        isFirebaseLoading,
        addCampaign,
        approveCampaign,
        rejectCampaign,
        pauseCampaign,
        activateCampaign,
        toggleCampaignVisibility,
        editCampaign,
        deleteCampaign,
        updateUserStatus,
        adjustUserPoints,
        deleteUser,
        updateVendorStatus,
        deleteVendor,
        collectVendorPoints,
        deductVendorPoints,
        adminAdjustVendorPoints,
        requestVendorPoints,
        adminApproveVendorPointRequest,
        adminRejectVendorPointRequest,
        processRedemption,
        submitRedemption,
        submitActivityReward,
        claimVideoReward,
        trackVideoWatchTime,
        addNotification,
        markNotificationRead,
        updateSettings,
        videoCooldowns,
        getVideoCooldownRemaining,
        recordVideoWatchClick,
        setVideoCooldown,
        clearVideoCooldown,
        loginRoleTab,
        setLoginRoleTab,
        handleFirebaseRegisterUser,
        handleFirebaseRegisterVendor,
        handleFirebaseLogin,
        handleFirebaseGoogleLogin,
        handleFirebaseLogout,
        handleFirebaseResetPassword,
        handleFirebaseInitAdmin,
        toasts,
        showToast,
        removeToast,
        lang,
        setLang,
        t,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type UserRole = 'public' | 'admin' | 'vendor' | 'user';
export type ThemeMode = 'dark' | 'light';

export type PublicPage = 
  | 'home' 
  | 'about' 
  | 'how-it-works' 
  | 'contact' 
  | 'login' 
  | 'register' 
  | 'privacy' 
  | 'terms';

export type AdminPage = 
  | 'overview' 
  | 'users' 
  | 'vendors' 
  | 'pending-campaigns' 
  | 'approved-campaigns' 
  | 'active-campaigns' 
  | 'rejected-campaigns' 
  | 'expired-campaigns' 
  | 'points-management' 
  | 'redemptions' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

export type VendorPage = 
  | 'overview' 
  | 'submit-campaign' 
  | 'my-campaigns' 
  | 'pending-campaigns' 
  | 'approved-campaigns' 
  | 'campaign-history' 
  | 'feedback-reports' 
  | 'profile';

export type UserPage = 
  | 'overview' 
  | 'discover' 
  | 'campaign-detail' 
  | 'my-activities' 
  | 'my-points' 
  | 'points-history' 
  | 'redeem' 
  | 'notifications' 
  | 'profile';

export type VideoPlatform = 'youtube' | 'tiktok' | 'vimeo' | 'instagram' | 'x';

export type CampaignStatus = 'pending' | 'approved' | 'active' | 'paused' | 'rejected' | 'expired' | 'completed';

export type CampaignDurationOption = '1_day' | '3_days' | '7_days' | '15_days' | '30_days' | 'custom';

export interface CampaignFeedbackQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text';
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  vendorId: string;
  vendorName: string;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnail: string;
  category: 'Tech' | 'Gaming' | 'Lifestyle' | 'Entertainment' | 'Education' | 'Music';
  durationOption?: CampaignDurationOption;
  customDurationDays?: number;
  startDate?: string;
  expiresAt: string;
  durationSeconds: number;
  requiredWatchSeconds: number;
  videoLengthMinutes?: number;
  totalTargetWatchMinutes?: number;
  totalWatchedMinutes?: number;
  pointsPerMinute?: number;
  requiredTotalPoints?: number;
  rewardPoints: number;
  budgetTotal: number;
  budgetSpent: number;
  targetViews: number;
  currentViews: number;
  status: CampaignStatus;
  isVisibleToUsers?: boolean;
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  autoDeleteAt?: string;
  targetAudience?: {
    geos: string[];
    ageCategories?: string;
    interests?: string;
  };
  geoTargets: string[];
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
  feedbackQuestions?: CampaignFeedbackQuestion[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'vendor' | 'admin';
  points: number;
  totalEarnedPoints: number;
  totalWatchMinutes?: number;
  totalWatchSeconds?: number;
  watchStreak: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  joinedDate: string;
  pendingPoints: number;
  redeemedPoints: number;
  status: 'active' | 'suspended' | 'pending';
  totalVideosWatched: number;
  country: string;
  videoCooldowns?: Record<string, number>;
}

export interface VendorAccount {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  avatar: string;
  country?: string;
  balance: number;
  totalSpent: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
  status: 'verified' | 'pending' | 'suspended';
  joinedDate: string;
}

export interface VendorPointRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  pointsRequested: number;
  whatsappNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNote?: string;
}

export type ActivityType = 'feedback' | 'quiz' | 'survey' | 'review' | 'watch_reward';

export interface UserActivity {
  id: string;
  userId: string;
  userName?: string;
  campaignId: string;
  campaignTitle: string;
  activityType: ActivityType;
  activityName: string;
  platform: VideoPlatform;
  watchedAt: string;
  durationWatched: number;
  pointsEarned: number;
  status: 'completed' | 'in_review' | 'failed';
  rating?: number;
  reviewComment?: string;
  feedbackResponses?: Record<string, any>;
  surveyAnswers?: Record<string, any>;
  createdAt?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'watch_reward' | 'feedback_reward' | 'quiz_reward' | 'survey_reward' | 'review_reward' | 'streak_bonus' | 'referral_bonus' | 'redemption' | 'redemption_refund' | 'admin_adjustment';
  points: number;
  activityName?: string;
  description: string;
  timestamp: string;
  status: 'credited' | 'debited' | 'pending';
  transactionRef?: string;
  redemptionId?: string;
}

export type PayoutMethod = 'bkash' | 'nagad' | 'rocket' | 'paypal' | 'amazon' | 'crypto';

export interface RedemptionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: PayoutMethod;
  pointsUsed: number;
  cashValueUsd: number;
  cashValueBdt: number;
  payoutAddress: string; // Mobile wallet number e.g. 017XXXXXXXX
  whatsappNumber?: string;
  accountType?: 'personal' | 'agent';
  transactionRef?: string;
  requestedAt: string;
  paidAt?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'processing' | 'completed';
  rejectionReason?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'user' | 'vendor' | 'admin';
  targetUserId?: string;
  vendorId?: string;
  campaignId?: string;
  createdAt: string;
  read: boolean;
  type: 'system' | 'reward' | 'campaign' | 'security';
}

export interface AdBoxConfig {
  adLink: string;
  targetUrl?: string;
  enabled?: boolean;
  updatedAt?: string;
}

export interface PlatformSettings {
  siteName: string;
  contactEmail: string;
  pointsToUsdRate: number; // e.g. 1000 pts = $1.00 USD
  pointsToBdtRate: number; // e.g. 1000 pts = 120 BDT
  minimumRedemptionPoints: number;
  pointsPerMinuteDefault: number;
  dailyStreakBonus: number;
  signupBonus?: number;
  antiBotWatchTolerancePercent: number;
  maintenanceMode: boolean;
  allowedPlatforms: VideoPlatform[];
  activityPoints: {
    feedback: number; // e.g. 10 pts
    quiz: number;     // e.g. 20 pts
    survey: number;   // e.g. 15 pts
    review: number;   // e.g. 25 pts
  };
  adBox1?: AdBoxConfig;
  adBox2?: AdBoxConfig; // Box No-2 (width: 300px, height: 250px)
  socialBarAd?: AdBoxConfig; // Adsterra Social Bar / Popunder Ad (Shown top-right of video every 5 minutes)
  tutorialVideoUrl?: string; // Public website How It Works tutorial YouTube video URL
  adBanners?: Record<string, AdBoxConfig>;
}

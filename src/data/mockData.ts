import { 
  Campaign, 
  UserAccount, 
  VendorAccount, 
  UserActivity, 
  PointTransaction, 
  RedemptionRequest, 
  NotificationItem, 
  PlatformSettings 
} from '../types';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-101',
    title: 'Lumin X Flagship Foldable Smartphone & Leica Optic Review',
    description: 'In-depth camera breakdown, durability hinge testing, and display battery performance review of the all-new Lumin X foldable flagship.',
    vendorId: 'ven-01',
    vendorName: 'Apex Mobile Technologies',
    platform: 'youtube',
    videoUrl: 'https://youtube.com/watch?v=sample-tech-1',
    thumbnail: '/src/assets/images/campaign_tech_video_1793714103229.jpg',
    category: 'Tech',
    durationOption: '30_days',
    startDate: '2026-10-24',
    durationSeconds: 180,
    requiredWatchSeconds: 45,
    rewardPoints: 250,
    budgetTotal: 1500,
    budgetSpent: 875,
    targetViews: 6000,
    currentViews: 3500,
    status: 'active',
    createdAt: '2026-10-24',
    expiresAt: '2026-11-20',
    geoTargets: ['US', 'CA', 'UK', 'DE'],
    targetAudience: {
      geos: ['US', 'CA', 'UK', 'DE'],
      ageCategories: '18-45',
      interests: 'Smartphones, Photography, High-tech'
    },
    feedbackQuestions: [
      { id: 'fb-1', question: 'How likely are you to recommend the Lumin X based on camera specs?', type: 'rating' },
      { id: 'fb-2', question: 'Which hinge design element impressed you most?', type: 'text' }
    ],
    quizQuestion: {
      question: 'What optical lens system is integrated into the Lumin X?',
      options: ['Carl Zeiss T*', 'Leica Optics', 'Hasselblad Pro', 'Sony G Master'],
      correctIndex: 1
    }
  },
  {
    id: 'camp-102',
    title: 'Aegis Corp: Night Market Mech Action Official Gameplay Reveal',
    description: 'Exclusive first-look at the next-gen Unreal Engine 5 mech shooter set in a bustling futuristic neon district.',
    vendorId: 'ven-02',
    vendorName: 'Vortex Interactive Studios',
    platform: 'youtube',
    videoUrl: 'https://youtube.com/watch?v=sample-game-2',
    thumbnail: '/src/assets/images/campaign_gaming_video_1793714104326.jpg',
    category: 'Gaming',
    durationOption: '30_days',
    startDate: '2026-10-28',
    durationSeconds: 120,
    requiredWatchSeconds: 30,
    rewardPoints: 300,
    budgetTotal: 3000,
    budgetSpent: 2100,
    targetViews: 10000,
    currentViews: 7000,
    status: 'active',
    createdAt: '2026-10-28',
    expiresAt: '2026-11-30',
    geoTargets: ['US', 'JP', 'KR', 'EU'],
    targetAudience: {
      geos: ['US', 'JP', 'KR', 'EU'],
      ageCategories: '16-35',
      interests: 'Sci-Fi Games, Mecha, PC & Console Gaming'
    },
    feedbackQuestions: [
      { id: 'fb-1', question: 'Rate the combat animation responsiveness and visual fidelity.', type: 'rating' }
    ],
    quizQuestion: {
      question: 'In what urban district does the primary mech combat sequence occur?',
      options: ['Neo Tokyo Bay', 'Night Market Zone', 'Sector 9 Harbor', 'Skyline Station'],
      correctIndex: 1
    }
  },
  {
    id: 'camp-103',
    title: 'Aethelion GT: 0-100 km/h in 1.8s Hyper-EV Midnight Road Test',
    description: 'Track testing the dual-motor 1,400hp all-electric supercar on the winding mountain roads of Switzerland.',
    vendorId: 'ven-03',
    vendorName: 'Aethelion Automotive',
    platform: 'vimeo',
    videoUrl: 'https://vimeo.com/sample-car-3',
    thumbnail: '/src/assets/images/campaign_ev_video_1793714105477.jpg',
    category: 'Lifestyle',
    durationOption: '30_days',
    startDate: '2026-10-29',
    durationSeconds: 150,
    requiredWatchSeconds: 40,
    rewardPoints: 350,
    budgetTotal: 2500,
    budgetSpent: 980,
    targetViews: 5000,
    currentViews: 1960,
    status: 'active',
    createdAt: '2026-10-29',
    expiresAt: '2026-11-25',
    geoTargets: ['US', 'UK', 'AE', 'SG'],
    targetAudience: {
      geos: ['US', 'UK', 'AE', 'SG'],
      ageCategories: '25-55',
      interests: 'Electric Vehicles, Supercars, Luxury Lifestyle'
    },
    quizQuestion: {
      question: 'What is the claimed 0-100 km/h acceleration of the Aethelion GT?',
      options: ['2.4 seconds', '2.1 seconds', '1.8 seconds', '1.5 seconds'],
      correctIndex: 2
    }
  },
  {
    id: 'camp-104',
    title: 'Studio A: Creative Suite Workflow & Color Grading Masterclass',
    description: 'Learn Hollywood-grade LUT creation, HDR curves calibration, and accelerated editing shortcuts in DaVinci and Premiere.',
    vendorId: 'ven-01',
    vendorName: 'Apex Mobile Technologies',
    platform: 'youtube',
    videoUrl: 'https://youtube.com/watch?v=sample-prod-4',
    thumbnail: '/src/assets/images/hero_video_platform_1793714103286.jpg',
    category: 'Education',
    durationOption: '30_days',
    startDate: '2026-11-02',
    durationSeconds: 240,
    requiredWatchSeconds: 60,
    rewardPoints: 400,
    budgetTotal: 1200,
    budgetSpent: 0,
    targetViews: 3000,
    currentViews: 0,
    status: 'pending',
    createdAt: '2026-11-02',
    expiresAt: '2026-12-01',
    geoTargets: ['Global'],
    targetAudience: {
      geos: ['Global'],
      ageCategories: '18-50',
      interests: 'Video Editing, Cinematography, Content Creation'
    },
    quizQuestion: {
      question: 'Which studio facility was featured in the color grading workflow demo?',
      options: ['Studio A', 'Soundstage 4', 'Apex Lab 2', 'Prism Suite'],
      correctIndex: 0
    }
  },
  {
    id: 'camp-105',
    title: 'Quantum Audio Pro: Spatial Active Noise Cancellation Teaser',
    description: 'High-definition sound engineering preview featuring 48kHz lossless streaming and custom acoustic chambers.',
    vendorId: 'ven-04',
    vendorName: 'Sonic Labs Inc.',
    platform: 'tiktok',
    videoUrl: 'https://tiktok.com/@soniclabs/video/1',
    thumbnail: '/src/assets/images/campaign_tech_video_1793714103229.jpg',
    category: 'Tech',
    durationOption: '15_days',
    startDate: '2026-11-03',
    durationSeconds: 60,
    requiredWatchSeconds: 25,
    rewardPoints: 180,
    budgetTotal: 900,
    budgetSpent: 0,
    targetViews: 5000,
    currentViews: 0,
    status: 'pending',
    createdAt: '2026-11-03',
    expiresAt: '2026-12-15',
    geoTargets: ['US', 'CA'],
    targetAudience: {
      geos: ['US', 'CA'],
      ageCategories: '16-40',
      interests: 'Audiophile, Wireless Audio, Music'
    },
    quizQuestion: {
      question: 'What core audio technology is demonstrated?',
      options: ['Spatial ANC', 'Bone Conduction', 'Analog Amp', 'Open Ear'],
      correctIndex: 0
    }
  },
  {
    id: 'camp-106',
    title: 'Cyberpunk RPG Alpha Playtest Highlight Reel',
    description: 'Community multiplayer highlights from the limited weekend playtest tournament.',
    vendorId: 'ven-02',
    vendorName: 'Vortex Interactive Studios',
    platform: 'youtube',
    videoUrl: 'https://youtube.com/watch?v=sample-game-alpha',
    thumbnail: '/src/assets/images/campaign_gaming_video_1793714104326.jpg',
    category: 'Gaming',
    durationOption: '30_days',
    startDate: '2026-09-15',
    durationSeconds: 180,
    requiredWatchSeconds: 45,
    rewardPoints: 260,
    budgetTotal: 1800,
    budgetSpent: 1800,
    targetViews: 6500,
    currentViews: 6500,
    status: 'expired',
    createdAt: '2026-09-15',
    expiresAt: '2026-10-15',
    geoTargets: ['Global']
  },
  {
    id: 'camp-107',
    title: 'Unverified Automated Bot Farm Video Promotion Test',
    description: 'Suspicious campaign attempt attempting to bypass active audience verification.',
    vendorId: 'ven-99',
    vendorName: 'Unknown Promo Entity',
    platform: 'youtube',
    videoUrl: 'https://youtube.com/watch?v=suspicious-link',
    thumbnail: '/src/assets/images/campaign_tech_video_1793714103229.jpg',
    category: 'Entertainment',
    durationOption: '15_days',
    startDate: '2026-10-18',
    durationSeconds: 90,
    requiredWatchSeconds: 30,
    rewardPoints: 500,
    budgetTotal: 500,
    budgetSpent: 0,
    targetViews: 1000,
    currentViews: 0,
    status: 'rejected',
    rejectionReason: 'Violates content guideline: automated clicks and misleading thumbnail metadata detected.',
    createdAt: '2026-10-18',
    expiresAt: '2026-11-01',
    geoTargets: ['US']
  },
  {
    id: 'camp-108',
    title: 'Aethelion Autonomous Fleet Showcase in Zurich',
    description: 'Autonomous taxi fleet testing in central Zurich featuring real-time collision prevention AI.',
    vendorId: 'ven-03',
    vendorName: 'Aethelion Automotive',
    platform: 'vimeo',
    videoUrl: 'https://vimeo.com/sample-car-zurich',
    thumbnail: '/src/assets/images/campaign_ev_video_1793714105477.jpg',
    category: 'Lifestyle',
    durationOption: '30_days',
    startDate: '2026-11-01',
    durationSeconds: 210,
    requiredWatchSeconds: 50,
    rewardPoints: 320,
    budgetTotal: 2200,
    budgetSpent: 0,
    targetViews: 4500,
    currentViews: 0,
    status: 'approved',
    createdAt: '2026-11-01',
    expiresAt: '2026-12-10',
    geoTargets: ['CH', 'DE', 'AT', 'FR']
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    avatar: '/flower_avatar.jpg',
    role: 'user',
    points: 0,
    totalEarnedPoints: 0,
    totalWatchMinutes: 0,
    totalWatchSeconds: 0,
    pendingPoints: 0,
    redeemedPoints: 0,
    watchStreak: 1,
    tier: 'Bronze',
    joinedDate: '2026-11-01',
    status: 'active',
    totalVideosWatched: 0,
    country: 'United States'
  },
  {
    id: 'usr-002',
    name: 'Marcus Vance',
    email: 'm.vance@techmail.io',
    avatar: '/flower_avatar.jpg',
    role: 'user',
    points: 8200,
    totalEarnedPoints: 21400,
    pendingPoints: 0,
    redeemedPoints: 13200,
    watchStreak: 3,
    tier: 'Silver',
    joinedDate: '2026-08-04',
    status: 'active',
    totalVideosWatched: 68,
    country: 'Canada'
  },
  {
    id: 'usr-003',
    name: 'Kai Chen',
    email: 'kai.chen@streamlabs.dev',
    avatar: '/flower_avatar.jpg',
    role: 'user',
    points: 32400,
    totalEarnedPoints: 95000,
    pendingPoints: 25000,
    redeemedPoints: 37600,
    watchStreak: 21,
    tier: 'Diamond',
    joinedDate: '2026-03-10',
    status: 'active',
    totalVideosWatched: 310,
    country: 'Singapore'
  },
  {
    id: 'usr-004',
    name: 'Sarah Lindqvist',
    email: 'sarah.lind@nordicreach.se',
    avatar: '/flower_avatar.jpg',
    role: 'user',
    points: 1450,
    totalEarnedPoints: 1450,
    pendingPoints: 0,
    redeemedPoints: 0,
    watchStreak: 1,
    tier: 'Bronze',
    joinedDate: '2026-10-29',
    status: 'active',
    totalVideosWatched: 6,
    country: 'Sweden'
  },
  {
    id: 'usr-005',
    name: 'Bot_Tester_9921',
    email: 'proxy991@tempmail.in',
    avatar: '/flower_avatar.jpg',
    role: 'user',
    points: 0,
    totalEarnedPoints: 600,
    pendingPoints: 0,
    redeemedPoints: 0,
    watchStreak: 0,
    tier: 'Bronze',
    joinedDate: '2026-10-15',
    status: 'suspended',
    totalVideosWatched: 3,
    country: 'Unknown'
  }
];

export const INITIAL_VENDORS: VendorAccount[] = [
  {
    id: 'ven-01',
    companyName: 'Apex Mobile Technologies',
    contactName: 'Diana Prince',
    email: 'campaigns@apexmobile.tech',
    avatar: '/flower_avatar.jpg',
    balance: 4250.00,
    totalSpent: 12850.00,
    activeCampaignsCount: 2,
    totalCampaignsCount: 8,
    status: 'verified',
    joinedDate: '2026-01-15'
  },
  {
    id: 'ven-02',
    companyName: 'Vortex Interactive Studios',
    contactName: 'Leon Richter',
    email: 'marketing@vortexgames.com',
    avatar: '/flower_avatar.jpg',
    balance: 5900.00,
    totalSpent: 28400.00,
    activeCampaignsCount: 1,
    totalCampaignsCount: 14,
    status: 'verified',
    joinedDate: '2026-02-20'
  },
  {
    id: 'ven-03',
    companyName: 'Aethelion Automotive',
    contactName: 'Julian Meyer',
    email: 'media@aethelion-motors.de',
    avatar: '/flower_avatar.jpg',
    balance: 1820.00,
    totalSpent: 9400.00,
    activeCampaignsCount: 1,
    totalCampaignsCount: 5,
    status: 'verified',
    joinedDate: '2026-05-18'
  },
  {
    id: 'ven-04',
    companyName: 'Sonic Labs Inc.',
    contactName: 'Chloe Dupont',
    email: 'partners@soniclabs.io',
    avatar: '/flower_avatar.jpg',
    balance: 900.00,
    totalSpent: 1800.00,
    activeCampaignsCount: 0,
    totalCampaignsCount: 2,
    status: 'pending',
    joinedDate: '2026-10-31'
  }
];

export const INITIAL_USER_ACTIVITIES: UserActivity[] = [
  {
    id: 'act-301',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    campaignId: 'camp-101',
    campaignTitle: 'Lumin X Flagship Foldable Smartphone & Leica Optic Review',
    activityType: 'feedback',
    activityName: 'Campaign Feedback Completion',
    platform: 'youtube',
    watchedAt: '2026-11-03 09:24 AM',
    durationWatched: 48,
    pointsEarned: 10,
    status: 'completed',
    rating: 5,
    feedbackResponses: {
      recommendation: 5,
      favoriteFeature: 'Leica Summilux lens sharpness'
    }
  },
  {
    id: 'act-302',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    campaignId: 'camp-101',
    campaignTitle: 'Lumin X Flagship Foldable Smartphone & Leica Optic Review',
    activityType: 'quiz',
    activityName: 'Comprehension Quiz Verification',
    platform: 'youtube',
    watchedAt: '2026-11-03 09:28 AM',
    durationWatched: 30,
    pointsEarned: 20,
    status: 'completed'
  },
  {
    id: 'act-303',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    campaignId: 'camp-102',
    campaignTitle: 'Aegis Corp: Night Market Mech Action Official Gameplay Reveal',
    activityType: 'survey',
    activityName: 'Audience Preference Survey',
    platform: 'youtube',
    watchedAt: '2026-11-02 08:15 PM',
    durationWatched: 32,
    pointsEarned: 15,
    status: 'completed'
  },
  {
    id: 'act-304',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    campaignId: 'camp-102',
    campaignTitle: 'Aegis Corp: Night Market Mech Action Official Gameplay Reveal',
    activityType: 'review',
    activityName: 'Verified Campaign Review',
    platform: 'youtube',
    watchedAt: '2026-11-02 08:22 PM',
    durationWatched: 45,
    pointsEarned: 25,
    status: 'completed',
    reviewComment: 'Outstanding graphics and combat responsiveness. Looking forward to release.'
  }
];

export const INITIAL_TRANSACTIONS: PointTransaction[] = [
  {
    id: 'tx-501',
    userId: 'usr-001',
    type: 'feedback_reward',
    activityName: 'Campaign Feedback Completion',
    points: 10,
    description: 'Completed Feedback on Lumin X Review',
    timestamp: '2026-11-03 09:25 AM',
    status: 'credited'
  },
  {
    id: 'tx-502',
    userId: 'usr-001',
    type: 'quiz_reward',
    activityName: 'Comprehension Quiz Verification',
    points: 20,
    description: 'Passed Anti-Bot Quiz on Lumin X Review',
    timestamp: '2026-11-03 09:28 AM',
    status: 'credited'
  },
  {
    id: 'tx-503',
    userId: 'usr-001',
    type: 'survey_reward',
    activityName: 'Audience Preference Survey',
    points: 15,
    description: 'Completed Demographic Survey on Aegis Corp',
    timestamp: '2026-11-02 08:16 PM',
    status: 'credited'
  },
  {
    id: 'tx-504',
    userId: 'usr-001',
    type: 'review_reward',
    activityName: 'Verified Campaign Review',
    points: 25,
    description: 'Submitted Verified Review on Aegis Corp',
    timestamp: '2026-11-02 08:23 PM',
    status: 'credited'
  },
  {
    id: 'tx-505',
    userId: 'usr-001',
    type: 'redemption',
    redemptionId: 'red-901',
    activityName: 'Payout Request (bKash)',
    points: -10000,
    description: 'Requested Payout: 1,200 BDT via bKash',
    timestamp: '2026-10-25 03:45 PM',
    status: 'pending'
  }
];

export const INITIAL_REDEMPTIONS: RedemptionRequest[] = [
  {
    id: 'red-901',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@example.com',
    method: 'bkash',
    pointsUsed: 10000,
    cashValueUsd: 10.00,
    cashValueBdt: 1200,
    payoutAddress: '01712-345678',
    accountType: 'personal',
    requestedAt: '2026-11-03 07:15 AM',
    status: 'pending'
  },
  {
    id: 'red-902',
    userId: 'usr-003',
    userName: 'Kai Chen',
    userEmail: 'kai.chen@streamlabs.dev',
    method: 'nagad',
    pointsUsed: 25000,
    cashValueUsd: 25.00,
    cashValueBdt: 3000,
    payoutAddress: '01898-765432',
    accountType: 'personal',
    requestedAt: '2026-11-02 11:50 PM',
    status: 'pending'
  },
  {
    id: 'red-903',
    userId: 'usr-002',
    userName: 'Marcus Vance',
    userEmail: 'm.vance@techmail.io',
    method: 'rocket',
    pointsUsed: 10000,
    cashValueUsd: 10.00,
    cashValueBdt: 1200,
    payoutAddress: '01911-223344-9',
    accountType: 'personal',
    transactionRef: 'RKT99248A10',
    requestedAt: '2026-10-31 02:20 PM',
    paidAt: '2026-10-31 03:00 PM',
    status: 'paid'
  },
  {
    id: 'red-904',
    userId: 'usr-005',
    userName: 'Bot_Tester_9921',
    userEmail: 'proxy991@tempmail.in',
    method: 'bkash',
    pointsUsed: 5000,
    cashValueUsd: 5.00,
    cashValueBdt: 600,
    payoutAddress: '01300-000000',
    accountType: 'personal',
    requestedAt: '2026-10-16 09:10 AM',
    status: 'rejected',
    rejectionReason: 'Suspicious proxy IP and failed anti-bot biometric check.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High-Reward Campaign Launched',
    message: 'Aethelion Automotive launched an exclusive Hyper-EV review. Earn activity points for verified engagement.',
    targetRole: 'user',
    createdAt: '2 hours ago',
    read: false,
    type: 'reward'
  },
  {
    id: 'notif-2',
    title: 'Campaign Review Pending',
    message: 'Apex Mobile submitted "Studio A: Creative Suite Masterclass" for compliance review.',
    targetRole: 'admin',
    createdAt: '1 day ago',
    read: false,
    type: 'campaign'
  },
  {
    id: 'notif-3',
    title: 'Platform Maintenance Notice',
    message: 'Scheduled edge node server maintenance on Sunday 02:00 UTC (Estimated downtime: 10 mins).',
    targetRole: 'all',
    createdAt: '2 days ago',
    read: true,
    type: 'system'
  }
];

export const INITIAL_SETTINGS: PlatformSettings = {
  siteName: 'Promoview Media',
  contactEmail: 'support@promoview.io',
  pointsToUsdRate: 1000, // 1000 pts = $1.00 USD
  pointsToBdtRate: 120, // 1000 pts = 120 BDT
  minimumRedemptionPoints: 5000, // 5000 pts min
  pointsPerMinuteDefault: 1, // 1 minute = 1 point
  dailyStreakBonus: 50,
  signupBonus: 0, // Default 0 points for new users (Admin can configure bonus)
  antiBotWatchTolerancePercent: 85,
  maintenanceMode: false,
  allowedPlatforms: ['youtube', 'tiktok', 'vimeo', 'instagram', 'x'],
  activityPoints: {
    feedback: 10,
    quiz: 20,
    survey: 15,
    review: 25
  },
  adBox1: {
    adLink: '',
    targetUrl: '',
    enabled: true
  },
  adBox2: {
    adLink: '',
    targetUrl: '',
    enabled: true
  },
  socialBarAd: {
    adLink: '',
    targetUrl: '',
    enabled: true
  }
};

export const ROOT_ADMIN_CREDENTIALS = {
  email: 'alaminalom358@gmail.com',
  password: 'alamin2alom',
  name: 'Al Amin (Root Admin)',
  role: 'admin' as const
};

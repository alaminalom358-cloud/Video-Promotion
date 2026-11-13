import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  Campaign, 
  UserAccount, 
  VendorAccount, 
  UserActivity, 
  PointTransaction, 
  RedemptionRequest, 
  NotificationItem, 
  PlatformSettings, 
  CampaignStatus,
  VendorPointRequest 
} from '../types';
import { 
  INITIAL_CAMPAIGNS, 
  INITIAL_SETTINGS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

// Collection references
export const COLLECTIONS = {
  USERS: 'users',
  VENDORS: 'vendors',
  ADMINS: 'admins',
  CAMPAIGNS: 'campaigns',
  CAMPAIGN_FEEDBACK: 'campaign_feedback',
  CAMPAIGN_QUIZZES: 'campaign_quizzes',
  USER_TASKS: 'user_tasks',
  USER_WALLETS: 'user_wallets',
  POINT_TRANSACTIONS: 'point_transactions',
  REDEMPTION_REQUESTS: 'redemption_requests',
  VENDOR_POINT_REQUESTS: 'vendor_point_requests',
  NOTIFICATIONS: 'notifications',
  PLATFORM_SETTINGS: 'platform_settings',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

// 1. Log Activity
export async function logActivity(action: string, details: string, userId?: string, userName?: string) {
  try {
    const logData = {
      action,
      details,
      userId: userId || auth.currentUser?.uid || 'anonymous',
      userName: userName || auth.currentUser?.displayName || 'User',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), logData);
  } catch (err) {
    // Non-blocking for logs
    console.warn('Could not write activity log to Firestore:', err);
  }
}

// 2. Seed Initial Database Collections if empty
export async function seedInitialFirestoreData() {
  try {
    // Check if platform_settings exists
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'current'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'current'), {
        ...INITIAL_SETTINGS,
        updatedAt: new Date().toISOString()
      });

      // Seed initial campaigns
      for (const camp of INITIAL_CAMPAIGNS) {
        await setDoc(doc(db, COLLECTIONS.CAMPAIGNS, camp.id), {
          ...camp,
          updatedAt: new Date().toISOString()
        });

        if (camp.quizQuestion) {
          await setDoc(doc(db, COLLECTIONS.CAMPAIGN_QUIZZES, `quiz_${camp.id}`), {
            id: `quiz_${camp.id}`,
            campaignId: camp.id,
            ...camp.quizQuestion,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Seed initial notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif);
      }

      // Bootstrap admin record for system owner
      await setDoc(doc(db, COLLECTIONS.ADMINS, 'admin_system_root'), {
        id: 'admin_system_root',
        email: 'alaminalom358@gmail.com',
        name: 'System Root Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      console.log('Initial Firestore collections seeded successfully.');
    }
  } catch (err) {
    console.warn('Initial seeding note (rules or network):', err);
  }
}

// 3. User Wallet Operations
export async function getUserWallet(userId: string) {
  const path = `${COLLECTIONS.USER_WALLETS}/${userId}`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USER_WALLETS, userId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserWallet(userId: string, initialPoints = 0) {
  const path = `${COLLECTIONS.USER_WALLETS}/${userId}`;
  try {
    const walletData = {
      userId,
      points: initialPoints,
      totalEarnedPoints: initialPoints,
      totalWatchMinutes: 0,
      totalWatchSeconds: 0,
      pendingPoints: 0,
      redeemedPoints: 0,
      cashValueUsd: initialPoints / 1000,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, COLLECTIONS.USER_WALLETS, userId), walletData);
    return walletData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToUserWallet(
  userId: string,
  onUpdate: (walletData: any) => void,
  onError?: (error: any) => void
) {
  try {
    const docRef = doc(db, COLLECTIONS.USER_WALLETS, userId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data());
        }
      },
      (error) => {
        console.warn('Wallet snapshot listener notice:', error?.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Wallet snapshot listener error:', err);
    return () => {};
  }
}

export async function recordVideoWatchTimeAndPoints(
  userId: string,
  campaignId: string,
  campaignTitle: string,
  minutesWatched: number,
  pointsEarned: number,
  totalSeconds: number
) {
  const path = `${COLLECTIONS.USER_WALLETS}/${userId}`;
  try {
    // 1. Update User Wallet
    const walletRef = doc(db, COLLECTIONS.USER_WALLETS, userId);
    const walletSnap = await getDoc(walletRef);
    let newPoints = pointsEarned;
    let newTotalEarned = pointsEarned;
    let newMinutes = minutesWatched;
    let newSeconds = totalSeconds;

    if (walletSnap.exists()) {
      const wData = walletSnap.data();
      newPoints = (wData.points || 0) + pointsEarned;
      newTotalEarned = (wData.totalEarnedPoints || 0) + pointsEarned;
      newMinutes = (wData.totalWatchMinutes || 0) + minutesWatched;
      newSeconds = (wData.totalWatchSeconds || 0) + totalSeconds;
      await updateDoc(walletRef, {
        points: newPoints,
        totalEarnedPoints: newTotalEarned,
        totalWatchMinutes: newMinutes,
        totalWatchSeconds: newSeconds,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(walletRef, {
        userId,
        points: pointsEarned,
        totalEarnedPoints: pointsEarned,
        totalWatchMinutes: minutesWatched,
        totalWatchSeconds: totalSeconds,
        pendingPoints: 0,
        redeemedPoints: 0,
        cashValueUsd: pointsEarned / 1000,
        updatedAt: new Date().toISOString()
      });
    }

    // 2. Sync to USERS document for persistence by User ID
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          points: newPoints,
          totalEarnedPoints: newTotalEarned,
          totalWatchMinutes: newMinutes,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('User doc points update note:', e);
    }

    // 3. Record Point Transaction
    const txId = `tx_watch_${Date.now()}`;
    await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
      id: txId,
      userId,
      type: 'watch_reward',
      activityName: 'Video Watch Duration',
      points: pointsEarned,
      description: `Watched ${minutesWatched} min on "${campaignTitle.slice(0, 32)}" (+${pointsEarned} pts)`,
      timestamp: new Date().toLocaleString(),
      status: 'credited',
      createdAt: new Date().toISOString()
    });

    // 4. Record task in USER_TASKS
    const taskId = `task_watch_${Date.now()}`;
    await setDoc(doc(db, COLLECTIONS.USER_TASKS, taskId), {
      id: taskId,
      userId,
      campaignId,
      campaignTitle,
      activityType: 'watch_reward',
      activityName: 'Video Watch Duration',
      durationWatched: totalSeconds,
      pointsEarned,
      status: 'completed',
      watchedAt: new Date().toLocaleString(),
      createdAt: new Date().toISOString()
    });

    await logActivity('WATCH_POINTS_CREDITED', `User watched ${minutesWatched}m (+${pointsEarned} pts) on "${campaignTitle.slice(0, 24)}"`, userId);

    // 5. Update Campaign Total Watch Minutes and Auto-Complete / Auto-Delete lifecycle
    let campaignAutoDeleted = false;
    let campaignCompleted = false;
    if (campaignId) {
      try {
        const campRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
        const campSnap = await getDoc(campRef);
        if (campSnap.exists()) {
          const campData = campSnap.data() as Campaign;
          const currentWatched = Number(campData.totalWatchedMinutes || 0) + minutesWatched;
          const targetMinutes = Number(campData.totalTargetWatchMinutes || 0);

          if (targetMinutes > 0 && currentWatched >= targetMinutes) {
            // Target minutes reached! Check if 2 days (48 hours) have elapsed
            const now = new Date();
            const completedAt = campData.completedAt || now.toISOString();
            const autoDeleteAt = campData.autoDeleteAt || new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

            const completedTime = new Date(completedAt).getTime();
            const isTwoDaysPassed = (Date.now() - completedTime) >= 2 * 24 * 60 * 60 * 1000;

            if (isTwoDaysPassed) {
              // 2 days have passed: delete permanently from Firestore
              await deleteDoc(campRef);
              campaignAutoDeleted = true;
              await logActivity(
                'CAMPAIGN_AUTO_DELETED',
                `ক্যাম্পেইন "${campData.title}" সম্পন্ন হওয়ার ২ দিন পার হওয়ায় ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়েছে।`,
                campData.vendorId,
                campData.vendorName
              );
            } else {
              // Mark as 'completed' and schedule 2-day deletion
              campaignCompleted = true;
              await updateDoc(campRef, {
                status: 'completed',
                totalWatchedMinutes: currentWatched,
                currentViews: (campData.currentViews || 0) + 1,
                completedAt,
                autoDeleteAt,
                updatedAt: new Date().toISOString()
              });

              // Send completion message/notification to Vendor if not already sent
              if (campData.status !== 'completed') {
                const notifId = `notif_comp_${campaignId}_${Date.now()}`;
                await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), {
                  id: notifId,
                  title: 'ক্যাম্পেইন সম্পন্ন হয়েছে (Completed)',
                  message: `আপনার ক্যাম্পেইন "${campData.title}" এর নির্ধারিত লক্ষ্য (${targetMinutes} মিনিট) পূর্ণ হয়েছে। ভিডিওটির পার্টিসিপেশন বাটন স্বয়ংক্রিয়ভাবে ডিজেবল করা হয়েছে এবং ২ দিন পর এটি ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।`,
                  targetRole: 'vendor',
                  targetUserId: campData.vendorId,
                  vendorId: campData.vendorId,
                  campaignId,
                  createdAt: new Date().toLocaleString(),
                  read: false,
                  type: 'campaign'
                });

                await logActivity(
                  'CAMPAIGN_COMPLETED',
                  `ক্যাম্পেইন "${campData.title}" লক্ষ্যমাত্রা (${currentWatched}/${targetMinutes} মিনিট) পূর্ণ হওয়ায় সম্পন্ন (Completed) হয়েছে। ভেন্ডোরকে মেসেজ পাঠানো হয়েছে। ২ দিন পর স্বয়ংক্রিয়ভাবে মুছে যাবে।`,
                  campData.vendorId,
                  campData.vendorName
                );
              }
            }
          } else {
            await updateDoc(campRef, {
              totalWatchedMinutes: currentWatched,
              currentViews: (campData.currentViews || 0) + 1,
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (campErr) {
        console.warn('Campaign watch time update note:', campErr);
      }
    }

    return {
      success: true,
      newPoints,
      newTotalEarned,
      newMinutes,
      campaignAutoDeleted
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return {
      success: false,
      newPoints: 0,
      newTotalEarned: 0,
      newMinutes: 0
    };
  }
}

// 4. Campaign Operations
export async function getFirestoreCampaigns(): Promise<Campaign[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CAMPAIGNS));
    if (snap.empty) return [];
    return snap.docs.map((d) => d.data() as Campaign);
  } catch (error) {
    console.warn('Error fetching campaigns from Firestore, using cached/mock fallback:', error);
    return [];
  }
}

export function subscribeToFirestoreCampaigns(
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (error: any) => void
) {
  try {
    const campaignsCol = collection(db, COLLECTIONS.CAMPAIGNS);
    return onSnapshot(
      campaignsCol,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => docSnap.data() as Campaign);
        onUpdate(list);
      },
      (err) => {
        console.warn('Real-time campaigns snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('Could not attach snapshot listener:', error);
    return () => {};
  }
}

export function subscribeToFirestoreUsers(
  onUpdate: (users: UserAccount[]) => void,
  onError?: (error: any) => void
) {
  try {
    const usersCol = collection(db, COLLECTIONS.USERS);
    return onSnapshot(
      usersCol,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || 'User',
            email: d.email || '',
            avatar: d.avatar || '/flower_avatar.jpg',
            role: d.role || 'user',
            points: Number(d.points || 0),
            totalEarnedPoints: Number(d.totalEarnedPoints || d.points || 0),
            totalWatchMinutes: Number(d.totalWatchMinutes || 0),
            totalWatchSeconds: Number(d.totalWatchSeconds || 0),
            pendingPoints: Number(d.pendingPoints || 0),
            redeemedPoints: Number(d.redeemedPoints || 0),
            watchStreak: Number(d.watchStreak || 1),
            tier: d.tier || 'Bronze',
            joinedDate: d.createdAt ? d.createdAt.split('T')[0] : (d.joinedDate || new Date().toISOString().split('T')[0]),
            status: d.status || 'active',
            totalVideosWatched: Number(d.totalVideosWatched || 0),
            country: d.country || 'United States',
            videoCooldowns: d.videoCooldowns || {}
          } as UserAccount;
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Real-time users snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('Could not attach users snapshot listener:', error);
    return () => {};
  }
}

export function subscribeToFirestoreVendors(
  onUpdate: (vendors: VendorAccount[]) => void,
  onError?: (error: any) => void
) {
  try {
    const vendorsCol = collection(db, COLLECTIONS.VENDORS);
    return onSnapshot(
      vendorsCol,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            companyName: d.companyName || d.name || 'Vendor Company',
            contactName: d.contactName || d.name || 'Contact',
            email: d.email || '',
            avatar: d.avatar || '/src/assets/images/avatar_creator_vendor_1793714105004.jpg',
            balance: Number(d.balance || 0),
            totalSpent: Number(d.totalSpent || 0),
            activeCampaignsCount: Number(d.activeCampaignsCount || 0),
            totalCampaignsCount: Number(d.totalCampaignsCount || 0),
            status: d.status || 'verified',
            country: d.country || 'United States',
            joinedDate: d.createdAt ? d.createdAt.split('T')[0] : (d.joinedDate || new Date().toISOString().split('T')[0])
          } as VendorAccount;
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Real-time vendors snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('Could not attach vendors snapshot listener:', error);
    return () => {};
  }
}

export async function createFirestoreCampaign(campaignData: Campaign) {
  const path = `${COLLECTIONS.CAMPAIGNS}/${campaignData.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignData.id), {
      ...campaignData,
      createdAt: campaignData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Also persist feedback questions in CAMPAIGN_FEEDBACK if present
    if (campaignData.feedbackQuestions && campaignData.feedbackQuestions.length > 0) {
      await setDoc(doc(db, COLLECTIONS.CAMPAIGN_FEEDBACK, `fb_${campaignData.id}`), {
        campaignId: campaignData.id,
        questions: campaignData.feedbackQuestions,
        createdAt: new Date().toISOString()
      });
    }

    // Also persist quiz in CAMPAIGN_QUIZZES if present
    if (campaignData.quizQuestion) {
      await setDoc(doc(db, COLLECTIONS.CAMPAIGN_QUIZZES, `quiz_${campaignData.id}`), {
        id: `quiz_${campaignData.id}`,
        campaignId: campaignData.id,
        ...campaignData.quizQuestion,
        createdAt: new Date().toISOString()
      });
    }

    await logActivity('CAMPAIGN_CREATED', `Vendor created campaign "${campaignData.title}"`, campaignData.vendorId, campaignData.vendorName);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCampaignStatusInFirestore(campaignId: string, status: CampaignStatus, rejectionReason?: string) {
  const path = `${COLLECTIONS.CAMPAIGNS}/${campaignId}`;
  try {
    const updatePayload: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (rejectionReason !== undefined) {
      updatePayload.rejectionReason = rejectionReason;
    }
    await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId), updatePayload);
    await logActivity('CAMPAIGN_STATUS_UPDATED', `Campaign ${campaignId} status changed to ${status}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function editCampaignInFirestore(campaignId: string, updates: Partial<Campaign>) {
  const path = `${COLLECTIONS.CAMPAIGNS}/${campaignId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    await logActivity('CAMPAIGN_EDITED', `Campaign ${campaignId} edited by Admin`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleCampaignVisibilityInFirestore(campaignId: string, isVisibleToUsers: boolean) {
  const path = `${COLLECTIONS.CAMPAIGNS}/${campaignId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId), {
      isVisibleToUsers,
      updatedAt: new Date().toISOString()
    });
    await logActivity(
      'CAMPAIGN_VISIBILITY_TOGGLED',
      `Campaign ${campaignId} user visibility set to ${isVisibleToUsers ? 'ON' : 'OFF'} by Admin`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaignInFirestore(campaignId: string) {
  const path = `${COLLECTIONS.CAMPAIGNS}/${campaignId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId));
    await logActivity('CAMPAIGN_DELETED', `Campaign ${campaignId} removed by Admin`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function adjustUserPointsInFirestore(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newPoints: number }> {
  const walletPath = `${COLLECTIONS.USER_WALLETS}/${userId}`;
  try {
    const walletRef = doc(db, COLLECTIONS.USER_WALLETS, userId);
    const walletSnap = await getDoc(walletRef);
    let newPoints = 0;
    let newTotalEarned = 0;

    if (walletSnap.exists()) {
      const wData = walletSnap.data();
      const currentPoints = Number(wData.points || 0);
      newPoints = Math.max(0, currentPoints + amount);
      const currentEarned = Number(wData.totalEarnedPoints || currentPoints);
      newTotalEarned = amount > 0 ? currentEarned + amount : currentEarned;

      await setDoc(walletRef, {
        points: newPoints,
        totalEarnedPoints: newTotalEarned,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      newPoints = Math.max(0, amount);
      newTotalEarned = newPoints;
      await setDoc(walletRef, {
        userId,
        points: newPoints,
        totalEarnedPoints: newTotalEarned,
        totalWatchMinutes: 0,
        totalWatchSeconds: 0,
        pendingPoints: 0,
        redeemedPoints: 0,
        cashValueUsd: 0,
        updatedAt: new Date().toISOString()
      });
    }

    // Also sync to USERS collection document
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const currentPoints = Number(uData.points || 0);
        const calcPoints = Math.max(0, currentPoints + amount);
        const currentEarned = Number(uData.totalEarnedPoints || currentPoints);
        const calcEarned = amount > 0 ? currentEarned + amount : currentEarned;
        await setDoc(userRef, {
          points: calcPoints,
          totalEarnedPoints: calcEarned,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        newPoints = calcPoints;
      }
    } catch (e) {
      console.warn('User doc points adjustment sync note:', e);
    }

    // Record transaction in point_transactions
    const txId = `tx_adj_${Date.now()}`;
    await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
      id: txId,
      userId,
      type: 'admin_adjustment',
      activityName: 'Admin Manual Adjustment',
      points: amount,
      description: `অ্যাডমিন সমন্বয়: ${reason || 'Point balance adjusted'} (${amount > 0 ? '+' : ''}${amount} pts)`,
      timestamp: new Date().toLocaleString(),
      status: amount >= 0 ? 'credited' : 'debited',
      createdAt: new Date().toISOString()
    });

    await logActivity('POINTS_ADJUSTED', `Admin adjusted ${amount > 0 ? '+' : ''}${amount} pts for user ${userId}. Note: ${reason}`, userId);
    return { success: true, newPoints };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, walletPath);
    return { success: false, newPoints: 0 };
  }
}

export async function deleteUserInFirestore(userId: string): Promise<boolean> {
  const path = `${COLLECTIONS.USERS}/${userId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    try {
      await deleteDoc(doc(db, COLLECTIONS.USER_WALLETS, userId));
    } catch (e) {
      // Non-fatal if wallet didn't exist
    }
    await logActivity('USER_DELETED', `User ${userId} permanently removed by Admin`, userId);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

export async function deleteVendorInFirestore(vendorId: string): Promise<boolean> {
  const path = `${COLLECTIONS.VENDORS}/${vendorId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.VENDORS, vendorId));
    await logActivity('VENDOR_DELETED', `Vendor ${vendorId} permanently removed by Admin`, vendorId);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

export async function checkAndExpireCampaignsInFirestore(campaigns: Campaign[]) {
  const now = new Date();
  const nowTime = now.getTime();

  for (const c of campaigns) {
    const targetMinutes = Number(c.totalTargetWatchMinutes || 0);
    const watchedMinutes = Number(c.totalWatchedMinutes || 0);

    // 1. Check if target minutes are reached and campaign should be marked completed
    if (targetMinutes > 0 && watchedMinutes >= targetMinutes && c.status !== 'completed') {
      try {
        const completedAt = c.completedAt || now.toISOString();
        const autoDeleteAt = c.autoDeleteAt || new Date(nowTime + 2 * 24 * 60 * 60 * 1000).toISOString();

        await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, c.id), {
          status: 'completed',
          completedAt,
          autoDeleteAt,
          updatedAt: now.toISOString()
        });

        // Send vendor completed notification
        const notifId = `notif_comp_${c.id}_${Date.now()}`;
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), {
          id: notifId,
          title: 'ক্যাম্পেইন সম্পন্ন হয়েছে (Completed)',
          message: `আপনার ক্যাম্পেইন "${c.title}" এর নির্ধারিত লক্ষ্য (${targetMinutes} মিনিট) পূর্ণ হয়েছে। ভিডিওটির পার্টিসিপেশন বাটন স্বয়ংক্রিয়ভাবে ডিজেবল করা হয়েছে এবং ২ দিন পর এটি ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।`,
          targetRole: 'vendor',
          targetUserId: c.vendorId,
          vendorId: c.vendorId,
          campaignId: c.id,
          createdAt: new Date().toLocaleString(),
          read: false,
          type: 'campaign'
        });

        await logActivity(
          'CAMPAIGN_COMPLETED',
          `ক্যাম্পেইন "${c.title}" সম্পন্ন হয়েছে। ২ দিন পর স্বয়ংক্রিয়ভাবে ফায়ারবেস থেকে মুছে যাবে।`,
          c.vendorId,
          c.vendorName
        );
      } catch (err) {
        console.warn(`Could not mark campaign ${c.id} as completed:`, err);
      }
    }

    // 2. Check 2-day auto-deletion for completed campaigns
    if (c.status === 'completed' || (targetMinutes > 0 && watchedMinutes >= targetMinutes)) {
      const completedTime = c.completedAt ? new Date(c.completedAt).getTime() : 0;
      const autoDeleteTime = c.autoDeleteAt ? new Date(c.autoDeleteAt).getTime() : 0;

      const isExpired2Days = (autoDeleteTime > 0 && autoDeleteTime <= nowTime) ||
                             (completedTime > 0 && (nowTime - completedTime) >= 2 * 24 * 60 * 60 * 1000);

      if (isExpired2Days) {
        try {
          await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, c.id));
          await logActivity(
            'CAMPAIGN_AUTO_DELETED',
            `ক্যাম্পেইন "${c.title}" সম্পন্ন হওয়ার ২ দিন পূর্ণ হওয়ায় ফায়ারবেস থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
            c.vendorId,
            c.vendorName
          );
        } catch (err) {
          console.warn(`Could not auto-delete completed campaign ${c.id}:`, err);
        }
      }
    }

    // 3. Expiration date check
    if ((c.status === 'active' || c.status === 'approved') && c.expiresAt) {
      const expDate = new Date(c.expiresAt);
      if (expDate <= now) {
        try {
          await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, c.id), {
            status: 'expired',
            updatedAt: new Date().toISOString()
          });
          await logActivity('CAMPAIGN_EXPIRED', `Campaign "${c.title}" automatically reached expiration date ${c.expiresAt}`);
        } catch (err) {
          console.warn(`Could not auto-expire campaign ${c.id}:`, err);
        }
      }
    }
  }
}

// 5. Redemption Operations (bKash, Nagad, Rocket, etc.)
export async function submitFirestoreRedemption(redemption: RedemptionRequest) {
  const path = `${COLLECTIONS.REDEMPTION_REQUESTS}/${redemption.id}`;
  try {
    // 1. Create redemption request document
    await setDoc(doc(db, COLLECTIONS.REDEMPTION_REQUESTS, redemption.id), {
      ...redemption,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 2. Atomically reserve points in user wallet (move from available to pending)
    const walletRef = doc(db, COLLECTIONS.USER_WALLETS, redemption.userId);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      const currentPts = walletSnap.data().points || 0;
      const currentPending = walletSnap.data().pendingPoints || 0;
      await updateDoc(walletRef, {
        points: Math.max(0, currentPts - redemption.pointsUsed),
        pendingPoints: currentPending + redemption.pointsUsed,
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Log ledger transaction
    const txId = `tx_red_${redemption.id}`;
    await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
      id: txId,
      userId: redemption.userId,
      redemptionId: redemption.id,
      type: 'redemption',
      points: -redemption.pointsUsed,
      activityName: `উত্তোলন আবেদন (${redemption.method.toUpperCase()})`,
      description: `Redemption requested via ${redemption.method.toUpperCase()} (${redemption.cashValueBdt} BDT)`,
      timestamp: new Date().toLocaleString(),
      status: 'pending',
      transactionRef: '',
      createdAt: new Date().toISOString()
    });

    await logActivity('REDEMPTION_SUBMITTED', `User ${redemption.userName} requested ${redemption.cashValueBdt} BDT payout via ${redemption.method}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function adminProcessRedemptionInFirestore(
  requestId: string,
  action: 'approve' | 'reject' | 'paid',
  options?: { transactionRef?: string; rejectionReason?: string; redemption?: RedemptionRequest }
) {
  const path = `${COLLECTIONS.REDEMPTION_REQUESTS}/${requestId}`;
  try {
    const redDocRef = doc(db, COLLECTIONS.REDEMPTION_REQUESTS, requestId);
    const redSnap = await getDoc(redDocRef);
    const redData = redSnap.exists() ? (redSnap.data() as RedemptionRequest) : options?.redemption;

    if (!redData) {
      throw new Error(`Redemption ${requestId} not found.`);
    }

    const payload: any = {
      updatedAt: new Date().toISOString()
    };

    const walletRef = doc(db, COLLECTIONS.USER_WALLETS, redData.userId);
    const walletSnap = await getDoc(walletRef);
    const currentPending = walletSnap.exists() ? (walletSnap.data().pendingPoints || 0) : 0;
    const currentPoints = walletSnap.exists() ? (walletSnap.data().points || 0) : 0;
    const currentRedeemed = walletSnap.exists() ? (walletSnap.data().redeemedPoints || 0) : 0;

    if (action === 'approve') {
      payload.status = 'approved';
      await updateDoc(redDocRef, payload);
      await logActivity('REDEMPTION_APPROVED', `Admin approved redemption request ${requestId}`);
    } else if (action === 'paid') {
      payload.status = 'paid';
      payload.paidAt = new Date().toLocaleString();
      payload.transactionRef = options?.transactionRef || `TRX${Date.now().toString().slice(-8)}`;
      await updateDoc(redDocRef, payload);

      // Move from pending to redeemed points
      if (walletSnap.exists()) {
        await updateDoc(walletRef, {
          pendingPoints: Math.max(0, currentPending - redData.pointsUsed),
          redeemedPoints: currentRedeemed + redData.pointsUsed,
          updatedAt: new Date().toISOString()
        });
      }

      // Automatically sync and replace transaction ID with official TrxID (Screenshot 28)
      const officialTrxId = payload.transactionRef;
      try {
        const txDocRef = doc(db, COLLECTIONS.POINT_TRANSACTIONS, `tx_red_${requestId}`);
        const txSnap = await getDoc(txDocRef);
        if (txSnap.exists()) {
          await updateDoc(txDocRef, {
            id: officialTrxId,
            transactionRef: officialTrxId,
            status: 'debited',
            description: `উত্তোলন সম্পন্ন (${redData.method.toUpperCase()} TrxID: ${officialTrxId}) - ${redData.cashValueBdt} BDT`,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Check query by userId and redemption
          const q = query(
            collection(db, COLLECTIONS.POINT_TRANSACTIONS),
            where('userId', '==', redData.userId),
            where('type', '==', 'redemption')
          );
          const qSnap = await getDocs(q);
          let found = false;
          for (const d of qSnap.docs) {
            const data = d.data();
            if (data.redemptionId === requestId || data.points === -redData.pointsUsed) {
              found = true;
              await updateDoc(d.ref, {
                id: officialTrxId,
                transactionRef: officialTrxId,
                status: 'debited',
                description: `উত্তোলন সম্পন্ন (${redData.method.toUpperCase()} TrxID: ${officialTrxId}) - ${redData.cashValueBdt} BDT`,
                updatedAt: new Date().toISOString()
              });
              break;
            }
          }
          if (!found) {
            await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, `tx_paid_${officialTrxId}`), {
              id: officialTrxId,
              transactionRef: officialTrxId,
              redemptionId: requestId,
              userId: redData.userId,
              type: 'redemption',
              points: -redData.pointsUsed,
              activityName: `উত্তোলন পরিশোধ (${redData.method.toUpperCase()})`,
              description: `উত্তোলন সম্পন্ন (${redData.method.toUpperCase()} TrxID: ${officialTrxId}) - ${redData.cashValueBdt} BDT`,
              timestamp: new Date().toLocaleString(),
              status: 'debited',
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('Point transaction update in Firestore note:', err);
      }

      await logActivity('REDEMPTION_PAID', `Admin marked redemption ${requestId} as paid (Ref: ${payload.transactionRef})`);
    } else if (action === 'reject') {
      payload.status = 'rejected';
      payload.rejectionReason = options?.rejectionReason || 'Verification requirements not satisfied.';
      await updateDoc(redDocRef, payload);

      // Refund points back to available balance
      if (walletSnap.exists()) {
        await updateDoc(walletRef, {
          points: currentPoints + redData.pointsUsed,
          pendingPoints: Math.max(0, currentPending - redData.pointsUsed),
          updatedAt: new Date().toISOString()
        });
      }

      // Record refund transaction
      const txId = `tx_ref_${Date.now()}`;
      await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
        id: txId,
        userId: redData.userId,
        type: 'redemption_refund',
        points: redData.pointsUsed,
        description: `Refund for rejected ${redData.method.toUpperCase()} request: ${payload.rejectionReason}`,
        timestamp: new Date().toLocaleString(),
        status: 'credited',
        createdAt: new Date().toISOString()
      });

      await logActivity('REDEMPTION_REJECTED', `Admin rejected redemption ${requestId}: ${payload.rejectionReason}`);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 6. User Activities & Points Validation (Server-Validated Activity System)
export async function checkActivityAlreadyCompleted(
  userId: string,
  campaignId: string,
  activityType: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_TASKS),
      where('userId', '==', userId),
      where('campaignId', '==', campaignId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;
    return snap.docs.some((d) => d.data().activityType === activityType);
  } catch (err) {
    console.warn('Check activity duplicate note:', err);
    return false;
  }
}

export async function submitUserActivityInFirestore(activityData: {
  userId: string;
  userName: string;
  campaign: Campaign;
  activityType: 'feedback' | 'quiz' | 'survey' | 'review';
  activityName: string;
  pointsToAward: number;
  rating?: number;
  reviewComment?: string;
  feedbackResponses?: Record<string, any>;
  surveyAnswers?: Record<string, any>;
}): Promise<{ success: boolean; pointsAwarded: number; message: string }> {
  const { userId, userName, campaign, activityType, activityName, pointsToAward } = activityData;

  // 1. Prevent duplicate rewards for the same activity on the same campaign
  const isDuplicate = await checkActivityAlreadyCompleted(userId, campaign.id, activityType);
  if (isDuplicate) {
    return {
      success: false,
      pointsAwarded: 0,
      message: `You have already earned points for completing this ${activityName} on this campaign.`
    };
  }

  try {
    const taskId = `task_${Date.now()}`;
    const taskRecord: any = {
      id: taskId,
      userId,
      userName,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      activityType,
      activityName,
      platform: campaign.platform,
      durationWatched: 0,
      pointsEarned: pointsToAward,
      status: 'completed',
      watchedAt: new Date().toLocaleString(),
      createdAt: new Date().toISOString()
    };

    if (activityData.rating) taskRecord.rating = activityData.rating;
    if (activityData.reviewComment) taskRecord.reviewComment = activityData.reviewComment;
    if (activityData.feedbackResponses) taskRecord.feedbackResponses = activityData.feedbackResponses;
    if (activityData.surveyAnswers) taskRecord.surveyAnswers = activityData.surveyAnswers;

    // Record in user_tasks
    await setDoc(doc(db, COLLECTIONS.USER_TASKS, taskId), taskRecord);

    // If feedback or review, record in campaign_feedback
    if (activityType === 'feedback' || activityType === 'review') {
      const fbId = `fb_${Date.now()}`;
      await setDoc(doc(db, COLLECTIONS.CAMPAIGN_FEEDBACK, fbId), {
        id: fbId,
        campaignId: campaign.id,
        userId,
        userName,
        rating: activityData.rating || 5,
        comment: activityData.reviewComment || 'Completed feedback questionnaire',
        createdAt: new Date().toISOString()
      });
    }

    // Record point transaction
    const txId = `tx_${Date.now()}`;
    await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
      id: txId,
      userId,
      type: `${activityType}_reward`,
      activityName,
      points: pointsToAward,
      description: `${activityName}: ${campaign.title.slice(0, 28)}...`,
      timestamp: new Date().toLocaleString(),
      status: 'credited',
      createdAt: new Date().toISOString()
    });

    // Update User Wallet
    const walletRef = doc(db, COLLECTIONS.USER_WALLETS, userId);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      const curPts = walletSnap.data().points || 0;
      const curTotal = walletSnap.data().totalEarnedPoints || 0;
      await updateDoc(walletRef, {
        points: curPts + pointsToAward,
        totalEarnedPoints: curTotal + pointsToAward,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(walletRef, {
        userId,
        points: pointsToAward,
        totalEarnedPoints: pointsToAward,
        pendingPoints: 0,
        redeemedPoints: 0,
        updatedAt: new Date().toISOString()
      });
    }

    // Increment Campaign views/engagements count
    try {
      const campRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
      const campSnap = await getDoc(campRef);
      if (campSnap.exists()) {
        const curViews = campSnap.data().currentViews || 0;
        await updateDoc(campRef, {
          currentViews: curViews + 1,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Campaign stats update note:', e);
    }

    await logActivity('ACTIVITY_REWARD_CLAIMED', `User earned ${pointsToAward} pts for ${activityName} on ${campaign.title}`, userId, userName);

    return {
      success: true,
      pointsAwarded: pointsToAward,
      message: `Verified! +${pointsToAward} points added to your wallet for completing ${activityName}.`
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USER_TASKS}/${activityType}`);
    return {
      success: false,
      pointsAwarded: 0,
      message: 'Failed to record activity in Firestore.'
    };
  }
}

// 7. Update Platform Settings
export async function updatePlatformSettingsInFirestore(newSettings: Partial<PlatformSettings>) {
  const path = `${COLLECTIONS.PLATFORM_SETTINGS}/current`;
  try {
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'current');
    await setDoc(docRef, {
      ...newSettings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await logActivity('SETTINGS_UPDATED', 'Admin modified platform configuration & ad banner settings');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToFirestoreSettings(
  onUpdate: (settings: Partial<PlatformSettings>) => void,
  onError?: (err: any) => void
) {
  try {
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'current');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as PlatformSettings);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

// 8. Update Vendor Balance and Point Log in Firestore
export async function updateVendorBalanceInFirestore(
  vendorId: string, 
  newBalance: number, 
  newTotalSpent?: number,
  changeNote?: string
) {
  const path = `${COLLECTIONS.VENDORS}/${vendorId}`;
  try {
    const updates: Record<string, any> = {
      balance: newBalance,
      points: newBalance,
      updatedAt: new Date().toISOString()
    };
    if (newTotalSpent !== undefined) {
      updates.totalSpent = newTotalSpent;
    }
    await updateDoc(doc(db, COLLECTIONS.VENDORS, vendorId), updates);
    if (changeNote) {
      await logActivity('VENDOR_POINTS_UPDATED', `${changeNote} (New Balance: ${newBalance} pts)`, vendorId);
    }
  } catch (error) {
    try {
      await setDoc(doc(db, COLLECTIONS.VENDORS, vendorId), {
        id: vendorId,
        balance: newBalance,
        points: newBalance,
        totalSpent: newTotalSpent || 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (innerErr) {
      handleFirestoreError(innerErr, OperationType.UPDATE, path);
    }
  }
}

// 9. Vendor Point Requests (WhatsApp Point Top-up Request with Admin Approval)
export async function submitVendorPointRequestInFirestore(req: VendorPointRequest): Promise<boolean> {
  const path = `${COLLECTIONS.VENDOR_POINT_REQUESTS}/${req.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.VENDOR_POINT_REQUESTS, req.id), {
      ...req,
      createdAt: req.createdAt || new Date().toISOString()
    });

    // Also notify admin
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      type: 'system',
      title: 'নতুন ভেন্ডোর পয়েন্ট রিকোয়েস্ট',
      message: `${req.vendorName} (WhatsApp: ${req.whatsappNumber}) অ্যাডমিনের নিকট থেকে ${req.pointsRequested.toLocaleString()} পয়েন্ট সংগ্রহের আবেদন পাঠিয়েছেন। অনুমোদন দিন।`,
      read: false,
      createdAt: new Date().toISOString()
    });

    await logActivity(
      'VENDOR_POINT_REQUEST',
      `Vendor ${req.vendorName} (ID: ${req.vendorId}, WhatsApp: ${req.whatsappNumber}) requested ${req.pointsRequested} points`,
      req.vendorId,
      req.vendorName
    );

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export function subscribeToVendorPointRequests(
  onUpdate: (requests: VendorPointRequest[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(
      collection(db, COLLECTIONS.VENDOR_POINT_REQUESTS),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list: VendorPointRequest[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as VendorPointRequest[];
        onUpdate(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

export async function updateVendorPointRequestStatusInFirestore(
  requestId: string,
  status: 'approved' | 'rejected',
  adminNote?: string
) {
  const path = `${COLLECTIONS.VENDOR_POINT_REQUESTS}/${requestId}`;
  try {
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === 'approved') {
      updates.approvedAt = new Date().toISOString();
    } else {
      updates.rejectedAt = new Date().toISOString();
    }
    if (adminNote) {
      updates.adminNote = adminNote;
    }
    await updateDoc(doc(db, COLLECTIONS.VENDOR_POINT_REQUESTS, requestId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserVideoCooldownInFirestore(
  userId: string,
  campaignId: string,
  cooldownUntil: number
) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      [`videoCooldowns.${campaignId}`]: cooldownUntil,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not save video cooldown to Firestore:', err);
  }
}



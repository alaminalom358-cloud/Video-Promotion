import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

const ROOT_ADMIN_EMAIL = 'alaminalom358@gmail.com';

/**
 * Validates whether the calling user is an authorized admin
 */
async function verifyIsAdmin(context: functions.https.CallableContext): Promise<boolean> {
  if (!context.auth) return false;
  if (context.auth.token.email === ROOT_ADMIN_EMAIL) return true;
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
  return adminDoc.exists;
}

/**
 * 1. SUBMIT ACTIVITY REWARD (Cloud Function)
 * Enforces server-side validation:
 * - User authentication required
 * - Anti-duplicate verification: check if user has already completed this activity type on this campaign
 * - Atomically increments user wallet points
 * - Generates immutable transaction ledger entry
 */
export const submitActivityReward = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to claim rewards.');
  }

  const userId = context.auth.uid;
  const { campaignId, activityType, payload } = data;

  if (!campaignId || !activityType) {
    throw new functions.https.HttpsError('invalid-argument', 'Campaign ID and activity type are required.');
  }

  const allowedTypes = ['feedback', 'quiz', 'survey', 'review'];
  if (!allowedTypes.includes(activityType)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid activity type. Allowed: ${allowedTypes.join(', ')}`);
  }

  // 1. Check if campaign exists and is active/approved
  const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
  if (!campaignDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Target campaign does not exist.');
  }
  const campaignData = campaignDoc.data();
  if (campaignData?.status !== 'approved' && campaignData?.status !== 'active') {
    throw new functions.https.HttpsError('failed-precondition', 'Campaign is not currently active for rewards.');
  }

  // 2. Anti-Duplicate Check: Query existing user tasks
  const existingTaskQuery = await db.collection('user_tasks')
    .where('userId', '==', userId)
    .where('campaignId', '==', campaignId)
    .where('activityType', '==', activityType)
    .limit(1)
    .get();

  if (!existingTaskQuery.empty) {
    throw new functions.https.HttpsError('already-exists', `You have already completed the ${activityType} activity for this campaign.`);
  }

  // 3. Read configured activity points from platform_settings/global
  const settingsDoc = await db.collection('platform_settings').doc('global').get();
  const settingsData = settingsDoc.data();
  const defaultPointsMap: Record<string, number> = {
    feedback: 10,
    quiz: 20,
    survey: 15,
    review: 25,
  };
  const pointsAwarded = settingsData?.activityPoints?.[activityType] ?? defaultPointsMap[activityType] ?? 10;

  const now = new Date().toISOString();
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const txId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // 4. Atomic Transaction for wallet and transaction ledger
  const result = await db.runTransaction(async (t) => {
    // Read wallet
    const walletRef = db.collection('user_wallets').doc(userId);
    const walletDoc = await t.get(walletRef);

    const currentPoints = walletDoc.exists ? (walletDoc.data()?.points || 0) : 0;
    const currentTotalEarned = walletDoc.exists ? (walletDoc.data()?.totalEarnedPoints || 0) : 0;
    const currentPending = walletDoc.exists ? (walletDoc.data()?.pendingPoints || 0) : 0;
    const currentRedeemed = walletDoc.exists ? (walletDoc.data()?.redeemedPoints || 0) : 0;

    const newPoints = currentPoints + pointsAwarded;
    const newTotalEarned = currentTotalEarned + pointsAwarded;

    // Save or update wallet
    t.set(walletRef, {
      userId,
      points: newPoints,
      totalEarnedPoints: newTotalEarned,
      pendingPoints: currentPending,
      redeemedPoints: currentRedeemed,
      cashValueUsd: Number((newPoints / (settingsData?.pointsToUsdRate || 1000)).toFixed(2)),
      updatedAt: now,
    }, { merge: true });

    // Update user profile record if exists
    const userRef = db.collection('users').doc(userId);
    t.update(userRef, {
      points: newPoints,
      totalEarnedPoints: newTotalEarned,
      updatedAt: now,
    });

    // Create user_tasks record
    const taskRef = db.collection('user_tasks').doc(taskId);
    t.set(taskRef, {
      id: taskId,
      userId,
      campaignId,
      campaignTitle: campaignData?.title || 'Video Campaign',
      platform: campaignData?.platform || 'youtube',
      activityType,
      activityName: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Submission`,
      pointsEarned: pointsAwarded,
      watchedAt: now,
      status: 'completed',
      createdAt: now,
      ...payload,
    });

    // Create point_transactions ledger entry
    const txRef = db.collection('point_transactions').doc(txId);
    t.set(txRef, {
      id: txId,
      userId,
      type: 'watch_reward',
      activityName: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Completion (+${pointsAwarded} pts)`,
      points: pointsAwarded,
      description: `Reward for ${activityType} on "${campaignData?.title}"`,
      timestamp: now,
      status: 'credited',
      createdAt: now,
    });

    return {
      pointsAwarded,
      newBalance: newPoints,
      taskId,
      txId,
    };
  });

  return {
    success: true,
    ...result,
  };
});

/**
 * 2. REQUEST REDEMPTION (Cloud Function)
 * Enforces server-side balance reservation:
 * - Validates payout method (bKash, Nagad, Rocket, PayPal, etc.)
 * - Validates minimum points threshold
 * - Atomically moves requested points from available points to pendingPoints
 */
export const requestRedemption = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  const { method, pointsUsed, payoutAddress, accountType } = data;

  if (!method || !pointsUsed || !payoutAddress) {
    throw new functions.https.HttpsError('invalid-argument', 'Method, points, and payout address are required.');
  }

  const allowedMethods = ['bkash', 'nagad', 'rocket', 'paypal', 'amazon', 'crypto'];
  if (!allowedMethods.includes(method)) {
    throw new functions.https.HttpsError('invalid-argument', 'Unsupported payment method.');
  }

  const settingsDoc = await db.collection('platform_settings').doc('global').get();
  const settingsData = settingsDoc.data();
  const minPoints = settingsData?.minimumRedemptionPoints || 5000;
  const bdtRate = settingsData?.pointsToBdtRate || 120;
  const usdRate = settingsData?.pointsToUsdRate || 1000;

  if (pointsUsed < minPoints) {
    throw new functions.https.HttpsError('failed-precondition', `Minimum redemption is ${minPoints} points.`);
  }

  const now = new Date().toISOString();
  const reqId = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const txId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const cashValueBdt = Math.round((pointsUsed / 1000) * bdtRate);
  const cashValueUsd = Number((pointsUsed / usdRate).toFixed(2));

  const result = await db.runTransaction(async (t) => {
    const walletRef = db.collection('user_wallets').doc(userId);
    const walletDoc = await t.get(walletRef);

    if (!walletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User wallet record not found.');
    }

    const currentPoints = walletDoc.data()?.points || 0;
    const currentPending = walletDoc.data()?.pendingPoints || 0;

    if (currentPoints < pointsUsed) {
      throw new functions.https.HttpsError('failed-precondition', `Insufficient available points. You have ${currentPoints} pts, requested ${pointsUsed} pts.`);
    }

    const newAvailable = currentPoints - pointsUsed;
    const newPending = currentPending + pointsUsed;

    // Atomically reserve points
    t.update(walletRef, {
      points: newAvailable,
      pendingPoints: newPending,
      updatedAt: now,
    });

    // Update user document
    const userRef = db.collection('users').doc(userId);
    t.update(userRef, {
      points: newAvailable,
      pendingPoints: newPending,
      updatedAt: now,
    });

    // Create redemption request
    const userDoc = await t.get(userRef);
    const userData = userDoc.data();

    const reqRef = db.collection('redemption_requests').doc(reqId);
    t.set(reqRef, {
      id: reqId,
      userId,
      userName: userData?.name || 'Viewer',
      userEmail: userData?.email || '',
      method,
      pointsUsed,
      cashValueBdt,
      cashValueUsd,
      payoutAddress,
      accountType: accountType || 'Personal',
      requestedAt: now,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    // Create debit transaction record in pending state
    const txRef = db.collection('point_transactions').doc(txId);
    t.set(txRef, {
      id: txId,
      userId,
      type: 'redemption',
      activityName: `${method.toUpperCase()} Cashout Request (-${pointsUsed} pts)`,
      points: -pointsUsed,
      description: `Redemption of ৳${cashValueBdt} BDT ($${cashValueUsd} USD) via ${method.toUpperCase()} (${payoutAddress})`,
      timestamp: now,
      status: 'pending',
      createdAt: now,
    });

    return {
      reqId,
      newAvailable,
      newPending,
      cashValueBdt,
    };
  });

  return {
    success: true,
    ...result,
  };
});

/**
 * 3. PROCESS ADMIN REDEMPTION (Cloud Function)
 * Admin action to:
 * - 'approve': sets status to 'approved'
 * - 'reject': atomically refunds reserved pending points back to available balance
 * - 'paid': marks status as 'paid' with MFS TrxID and moves pendingPoints to redeemedPoints
 */
export const processAdminRedemption = functions.https.onCall(async (data, context) => {
  const isAdmin = await verifyIsAdmin(context);
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can process redemptions.');
  }

  const { requestId, action, transactionRef, reason } = data;
  if (!requestId || !action) {
    throw new functions.https.HttpsError('invalid-argument', 'Request ID and action are required.');
  }

  const reqRef = db.collection('redemption_requests').doc(requestId);
  const reqDoc = await reqRef.get();
  if (!reqDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Redemption request not found.');
  }

  const reqData = reqDoc.data();
  const userId = reqData?.userId;
  const pointsUsed = reqData?.pointsUsed || 0;
  const now = new Date().toISOString();

  await db.runTransaction(async (t) => {
    const walletRef = db.collection('user_wallets').doc(userId);
    const walletDoc = await t.get(walletRef);
    const walletData = walletDoc.exists ? walletDoc.data() : { points: 0, pendingPoints: 0, redeemedPoints: 0 };

    if (action === 'approve') {
      t.update(reqRef, {
        status: 'approved',
        updatedAt: now,
      });
    } else if (action === 'reject') {
      // Refund reserved pending points back to available
      const newAvailable = (walletData?.points || 0) + pointsUsed;
      const newPending = Math.max(0, (walletData?.pendingPoints || 0) - pointsUsed);

      t.update(walletRef, {
        points: newAvailable,
        pendingPoints: newPending,
        updatedAt: now,
      });

      const userRef = db.collection('users').doc(userId);
      t.update(userRef, {
        points: newAvailable,
        pendingPoints: newPending,
        updatedAt: now,
      });

      t.update(reqRef, {
        status: 'rejected',
        rejectionReason: reason || 'Information does not match account records.',
        updatedAt: now,
      });

      // Add refund transaction log
      const refundTxId = `TX_RF_${Date.now()}`;
      const refundTxRef = db.collection('point_transactions').doc(refundTxId);
      t.set(refundTxRef, {
        id: refundTxId,
        userId,
        type: 'admin_adjustment',
        activityName: `Redemption Rejected & Refunded (+${pointsUsed} pts)`,
        points: pointsUsed,
        description: `Refund for rejected cashout #${requestId}: ${reason || 'Account mismatch'}`,
        timestamp: now,
        status: 'credited',
        createdAt: now,
      });
    } else if (action === 'paid') {
      // Mark as paid: deduct from pending and add to redeemedPoints
      const newPending = Math.max(0, (walletData?.pendingPoints || 0) - pointsUsed);
      const newRedeemed = (walletData?.redeemedPoints || 0) + pointsUsed;

      t.update(walletRef, {
        pendingPoints: newPending,
        redeemedPoints: newRedeemed,
        updatedAt: now,
      });

      const userRef = db.collection('users').doc(userId);
      t.update(userRef, {
        pendingPoints: newPending,
        redeemedPoints: newRedeemed,
        updatedAt: now,
      });

      t.update(reqRef, {
        status: 'paid',
        transactionRef: transactionRef || `MFS_${Date.now()}`,
        paidAt: now,
        updatedAt: now,
      });

      // Update related pending point transactions to debited
      const pendingTxs = await db.collection('point_transactions')
        .where('userId', '==', userId)
        .where('type', '==', 'redemption')
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!pendingTxs.empty) {
        t.update(pendingTxs.docs[0].ref, {
          status: 'debited',
          description: `${pendingTxs.docs[0].data().description} - TrxID: ${transactionRef || 'CONFIRMED'}`,
        });
      }
    }
  });

  return { success: true, action, requestId };
});

/**
 * 4. SERVER-SIDE CAMPAIGN EXPIRATION (Scheduled Cron / Callable)
 * Automatically transitions campaigns whose expirationDate has passed to EXPIRED.
 */
export const checkExpiredCampaigns = functions.pubsub.schedule('every 60 minutes').onRun(async () => {
  const nowStr = new Date().toISOString();
  
  const snapshot = await db.collection('campaigns')
    .where('status', 'in', ['approved', 'active'])
    .get();

  let expiredCount = 0;
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.expirationDate && data.expirationDate <= nowStr) {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: nowStr,
      });
      expiredCount++;
    }
  });

  if (expiredCount > 0) {
    await batch.commit();
    console.log(`[Expiration Daemon] Successfully transitioned ${expiredCount} expired campaigns to EXPIRED status.`);
  }

  return { expiredCount };
});

/**
 * Callable version of expiration check for instant admin invocation
 */
export const triggerCampaignExpirationCheck = functions.https.onCall(async (data, context) => {
  const isAdmin = await verifyIsAdmin(context);
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can trigger campaign maintenance.');
  }

  const nowStr = new Date().toISOString();
  const snapshot = await db.collection('campaigns')
    .where('status', 'in', ['approved', 'active'])
    .get();

  let expiredCount = 0;
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.expirationDate && data.expirationDate <= nowStr) {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: nowStr,
      });
      expiredCount++;
    }
  });

  if (expiredCount > 0) {
    await batch.commit();
  }

  return { success: true, expiredCount };
});

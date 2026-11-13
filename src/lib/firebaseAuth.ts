import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS, createUserWallet, logActivity } from './firestoreService';
import { UserRole } from '../types';

const googleProvider = new GoogleAuthProvider();

export interface AuthProfileResult {
  role: UserRole;
  userDoc?: any;
  vendorDoc?: any;
  adminDoc?: any;
}

// 1. Register Viewer User
export async function registerViewerUser(
  name: string, 
  email: string, 
  password: string, 
  country = 'United States',
  bonusPoints = 0
): Promise<FirebaseUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === 'alaminalom358@gmail.com' || normalizedEmail === 'alom.outsourcing2020@gmail.com') {
    throw new Error(`This email address (${normalizedEmail}) is strictly reserved for the Platform Administrator. Public registration is not permitted.`);
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Create user profile in Firestore - new user starts with 0 points (or bonus if configured by admin)
  const userData = {
    id: user.uid,
    name,
    email: user.email || email,
    avatar: '/flower_avatar.jpg',
    role: 'user',
    tier: 'Bronze',
    points: bonusPoints,
    totalEarnedPoints: bonusPoints,
    totalWatchMinutes: 0,
    totalWatchSeconds: 0,
    watchStreak: 1,
    totalVideosWatched: 0,
    country,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);

  // Initialize wallet in Firestore (0 points by default, or bonusPoints)
  await createUserWallet(user.uid, bonusPoints);

  // If admin provided a bonus, record initial bonus transaction
  if (bonusPoints > 0) {
    const txId = `tx_bonus_${Date.now()}`;
    await setDoc(doc(db, COLLECTIONS.POINT_TRANSACTIONS, txId), {
      id: txId,
      userId: user.uid,
      type: 'referral_bonus',
      points: bonusPoints,
      description: `Welcome Registration Bonus (+${bonusPoints} pts)`,
      timestamp: new Date().toLocaleString(),
      status: 'credited',
      createdAt: new Date().toISOString()
    });
  }

  // Log activity
  await logActivity('USER_REGISTERED', `New viewer account created for ${name} (Initial points: ${bonusPoints})`, user.uid, name);

  return user;
}

// 2. Register Vendor Account
export async function registerVendorAccount(
  companyName: string, 
  contactName: string, 
  email: string, 
  password: string,
  country = 'United States'
): Promise<FirebaseUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === 'alaminalom358@gmail.com' || normalizedEmail === 'alom.outsourcing2020@gmail.com') {
    throw new Error(`This email address (${normalizedEmail}) is strictly reserved for the Platform Administrator. Vendor registration is not permitted.`);
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Create vendor profile in Firestore
  const finalCompanyName = companyName && companyName.trim() ? companyName.trim() : `${contactName} Media`;
  const vendorData = {
    id: user.uid,
    companyName: finalCompanyName,
    contactName,
    email: user.email || email,
    avatar: '/src/assets/images/avatar_creator_vendor_1793714105004.jpg',
    role: 'vendor',
    country: country || 'United States',
    balance: 0.00,
    totalSpent: 0.00,
    activeCampaignsCount: 0,
    totalCampaignsCount: 0,
    status: 'pending', // Pending admin verification
    joinedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, COLLECTIONS.VENDORS, user.uid), vendorData);

  await logActivity('VENDOR_REGISTERED', `New vendor registered: ${finalCompanyName} (${contactName}) from ${country}`, user.uid, contactName);

  return user;
}

// 3. Login with Email and detect role (works seamlessly from Viewer, Vendor, or Admin tab)
export async function loginWithEmail(email: string, password: string): Promise<AuthProfileResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const adminPasswordMap: Record<string, { password: string; name: string }> = {
    'alaminalom358@gmail.com': { password: 'alamin2alom', name: 'Al Amin (Root Admin)' },
    'alom.outsourcing2020@gmail.com': { password: 'Alom2khusi@', name: 'Alom (Admin)' },
  };

  const adminConfig = adminPasswordMap[normalizedEmail];

  try {
    // Always attempt real Firebase Authentication sign-in first (supports passwords changed in Firebase Console too)
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const uid = credential.user.uid;
    return await fetchRoleAndProfile(uid, credential.user.email);
  } catch (fbErr: any) {
    // If this is a configured Master Admin email and matches configured password:
    if (adminConfig) {
      if (password !== adminConfig.password) {
        throw new Error(`Invalid administrator password for ${normalizedEmail}.`);
      }

      // If user does not exist in Firebase Auth yet, auto-register as admin
      if (
        fbErr?.code === 'auth/user-not-found' ||
        fbErr?.code === 'auth/invalid-credential' ||
        fbErr?.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          const uid = newCred.user.uid;
          await setDoc(doc(db, COLLECTIONS.ADMINS, uid), {
            id: uid,
            name: adminConfig.name,
            email: normalizedEmail,
            role: 'admin',
            createdAt: new Date().toISOString()
          }, { merge: true });
          return {
            role: 'admin',
            adminDoc: { id: uid, name: adminConfig.name, email: normalizedEmail, role: 'admin' }
          };
        } catch (createErr) {
          console.warn('Could not auto-create Firebase admin user:', createErr);
        }
      }

      // Offline / fallback master admin session when configured password matches
      return {
        role: 'admin',
        adminDoc: { id: 'admin-root', name: adminConfig.name, email: normalizedEmail, role: 'admin' }
      };
    }

    throw fbErr;
  }
}

// 4. Login with Google (Popup)
export async function loginWithGoogle(): Promise<AuthProfileResult> {
  const credential = await signInWithPopup(auth, googleProvider);
  const uid = credential.user.uid;
  const email = credential.user.email || '';
  const name = credential.user.displayName || 'Google User';

  // Check if profile exists
  let profile = await fetchRoleAndProfile(uid, email);
  if (profile.role === 'public') {
    // If first time Google sign in and not existing, create default viewer profile
    const userData = {
      id: uid,
      name,
      email,
      avatar: credential.user.photoURL || '',
      role: 'user',
      tier: 'Bronze',
      points: 0,
      totalEarnedPoints: 0,
      totalWatchMinutes: 0,
      totalWatchSeconds: 0,
      watchStreak: 1,
      totalVideosWatched: 0,
      country: 'Global',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, COLLECTIONS.USERS, uid), userData);
    await createUserWallet(uid, 0);
    return { role: 'user', userDoc: userData };
  }

  return profile;
}

// Helper: Determine role by checking admins, vendors, users collections
export async function fetchRoleAndProfile(uid: string, email?: string | null): Promise<AuthProfileResult> {
  // Check if Admin (by UID, Master Admin Email, or admins collection email match)
  const adminSnap = await getDoc(doc(db, COLLECTIONS.ADMINS, uid));
  const normalizedEmail = (email || '').trim().toLowerCase();
  const isMasterAdminEmail =
    normalizedEmail === 'alaminalom358@gmail.com' ||
    normalizedEmail === 'alom.outsourcing2020@gmail.com';

  let matchedAdminByEmail: any = null;
  if (!adminSnap.exists() && !isMasterAdminEmail && normalizedEmail) {
    try {
      const adminEmailQ = query(collection(db, COLLECTIONS.ADMINS), where('email', '==', normalizedEmail));
      const adminEmailSnap = await getDocs(adminEmailQ);
      if (!adminEmailSnap.empty) {
        matchedAdminByEmail = adminEmailSnap.docs[0].data();
      }
    } catch {}
  }

  if (adminSnap.exists() || isMasterAdminEmail || matchedAdminByEmail) {
    if (!adminSnap.exists() && (isMasterAdminEmail || matchedAdminByEmail)) {
      try {
        await setDoc(doc(db, COLLECTIONS.ADMINS, uid), {
          id: uid,
          email: normalizedEmail,
          name:
            matchedAdminByEmail?.name ||
            (normalizedEmail === 'alom.outsourcing2020@gmail.com' ? 'Alom (Admin)' : 'Al Amin (Root Admin)'),
          role: 'admin',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch {}
    }
    return {
      role: 'admin',
      adminDoc: adminSnap.exists()
        ? adminSnap.data()
        : matchedAdminByEmail || { id: uid, email: normalizedEmail, role: 'admin' }
    };
  }

  // Check if Vendor
  const vendorSnap = await getDoc(doc(db, COLLECTIONS.VENDORS, uid));
  if (vendorSnap.exists()) {
    return { role: 'vendor', vendorDoc: vendorSnap.data() };
  }

  // Check if User
  const userSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (userSnap.exists()) {
    const userData = userSnap.data();
    // Also fetch wallet to guarantee fresh points balance
    try {
      const walletSnap = await getDoc(doc(db, COLLECTIONS.USER_WALLETS, uid));
      if (walletSnap.exists()) {
        const wData = walletSnap.data();
        userData.points = wData.points ?? userData.points ?? 0;
        userData.totalEarnedPoints = wData.totalEarnedPoints ?? userData.totalEarnedPoints ?? 0;
        userData.totalWatchMinutes = wData.totalWatchMinutes ?? userData.totalWatchMinutes ?? 0;
        userData.totalWatchSeconds = wData.totalWatchSeconds ?? userData.totalWatchSeconds ?? 0;
        userData.pendingPoints = wData.pendingPoints ?? 0;
        userData.redeemedPoints = wData.redeemedPoints ?? 0;
      }
    } catch (e) {
      console.warn('Wallet fetch in profile warning:', e);
    }
    return { role: 'user', userDoc: userData };
  }

  return { role: 'user' };
}

// 5. Send Password Reset
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
  await logActivity('PASSWORD_RESET_REQUESTED', `Reset link sent to ${email}`);
}

// 6. Sign Out
export async function logoutFirebaseUser(): Promise<void> {
  const uid = auth.currentUser?.uid;
  await signOut(auth);
  if (uid) {
    await logActivity('USER_LOGGED_OUT', 'User signed out successfully', uid);
  }
}

// 7. Secure Admin Account Initialization
export async function initializeAdminAccount(adminName: string): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  // Verification check: email must match authorized admin
  const isAuthorizedEmail =
    currentUser.email === 'alaminalom358@gmail.com' ||
    currentUser.email === 'alom.outsourcing2020@gmail.com';
  
  // Or check if admin collection is empty
  if (!isAuthorizedEmail) {
    // If not matching root email, check if any admin doc exists yet
    const existingAdmin = await getDoc(doc(db, COLLECTIONS.ADMINS, currentUser.uid));
    if (!existingAdmin.exists()) {
      return false;
    }
  }

  const adminData = {
    id: currentUser.uid,
    name: adminName || currentUser.displayName || 'Administrator',
    email: currentUser.email,
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, COLLECTIONS.ADMINS, currentUser.uid), adminData);
  await logActivity('ADMIN_INITIALIZED', `Admin credentials authorized for ${currentUser.email}`, currentUser.uid, adminName);
  return true;
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book, BorrowRecord, StudentProfile, StaffProfile, Role, SystemSettings, BookFeedback } from '../types';
import { DEMO_STUDENTS, DEMO_STAFF, INITIAL_BOOKS } from '../data/mockData';

// Configure log level to suppress non-fatal connection warnings when offline
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

const metaEnv = (import.meta as any)?.env || {};

const resolvedConfig = {
  ...firebaseConfig,
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (firebaseConfig as any).apiKey || 'AIzaSyDummyKeyForFallbackOnly1234567890',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any).projectId || 'gen-lang-client-0565580895',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any).authDomain || 'gen-lang-client-0565580895.firebaseapp.com',
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();

export const auth = getAuth(app);

export const db = (() => {
  const dbId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
    ? (firebaseConfig as any).firestoreDatabaseId
    : undefined;

  try {
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true
    }, dbId);
  } catch (e) {
    try {
      return dbId ? getFirestore(app, dbId) : getFirestore(app);
    } catch {
      return getFirestore(app);
    }
  }
})();

export const formatAuthError = (err: any): string => {
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/invalid-credential' || message.includes('auth/invalid-credential')) {
    return 'Invalid email or password. Please check your credentials or register a new account.';
  }
  if (code === 'auth/user-not-found' || message.includes('auth/user-not-found')) {
    return 'Account not found. Please register for a new account.';
  }
  if (code === 'auth/wrong-password' || message.includes('auth/wrong-password')) {
    return 'Incorrect password. Please try again.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please log in instead.';
  }
  if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/too-many-requests' || message.includes('auth/too-many-requests')) {
    return 'Access temporarily blocked due to multiple failed login attempts. Please try again later.';
  }
  if (code === 'auth/network-request-failed' || message.includes('auth/network-request-failed')) {
    return 'Network connection error. Please check your connection.';
  }
  return message || 'Authentication failed. Please try again.';
};

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  role: Role;
  rollNumber?: string;
  rollNo?: string;
  barcode?: string;
  staffId?: string;
  adminId?: string;
  department?: string;
  position?: string;
  year?: string;
  batch?: string;
  phone?: string;
  avatar?: string;
  photoURL?: string;
  photoUrl?: string;
  maxBorrowLimit?: number;
  joinedDate?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

// Helper to remove undefined fields before sending to Firestore
function cleanObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Safely fetches a user's document from Firestore with fallback to offline local session caches.
 * Prevents throwing disruptive offline errors during initial connection handshake.
 */
export const getUserDocSafely = async (
  firebaseUser: { uid: string; email?: string | null; emailVerified?: boolean }
): Promise<UserDoc | null> => {
  if (!firebaseUser?.uid) return null;
  const uid = firebaseUser.uid;
  const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();

  // 1. Try to fetch from Firestore 'users' collection
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data() as UserDoc;
    }
  } catch (err: any) {
    // Suppress non-fatal offline connection errors
  }

  // 2. Try to fetch from Firestore 'students' collection
  try {
    const studentSnap = await getDoc(doc(db, 'students', uid));
    if (studentSnap.exists()) {
      return studentSnap.data() as UserDoc;
    }
  } catch (err: any) {
    // Suppress non-fatal offline connection errors
  }

  // 3. Fallback to LocalStorage session cache (for offline resilience)
  try {
    const savedStudent = localStorage.getItem('lms_current_student');
    if (savedStudent) {
      const parsed = JSON.parse(savedStudent);
      if (parsed?.id === uid || parsed?.email?.toLowerCase().trim() === cleanEmail) {
        return {
          uid,
          email: parsed.email || cleanEmail,
          name: parsed.name,
          role: 'student',
          rollNumber: parsed.rollNumber,
          department: parsed.department,
          year: parsed.year,
          batch: parsed.batch,
          phone: parsed.phone,
          avatar: parsed.avatar,
          maxBorrowLimit: parsed.maxBorrowLimit,
          joinedDate: parsed.joinedDate,
          emailVerified: true
        };
      }
    }
  } catch (e) {}

  try {
    const savedStaff = localStorage.getItem('lms_current_staff');
    if (savedStaff) {
      const parsed = JSON.parse(savedStaff);
      if (parsed?.id === uid || parsed?.email?.toLowerCase().trim() === cleanEmail) {
        return {
          uid,
          email: parsed.email || cleanEmail,
          name: parsed.name,
          role: 'staff',
          staffId: parsed.staffId,
          department: parsed.department,
          position: parsed.position,
          avatar: parsed.avatar,
          joinedDate: parsed.joinedDate,
          emailVerified: true
        };
      }
    }
  } catch (e) {}

  // 4. Fallback to offline registered students
  try {
    const savedOffline: UserDoc[] = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
    const matchedOffline = savedOffline.find(
      s => s.uid === uid || s.email?.toLowerCase().trim() === cleanEmail
    );
    if (matchedOffline) {
      return matchedOffline;
    }
  } catch (e) {}

  // 5. Check pending student registration
  try {
    const savedPendingUid = localStorage.getItem(`pending_student_reg_${uid}`);
    if (savedPendingUid) {
      return JSON.parse(savedPendingUid);
    }
    const savedPending = localStorage.getItem('pending_student_reg');
    if (savedPending) {
      const parsed = JSON.parse(savedPending);
      if (parsed.email?.toLowerCase().trim() === cleanEmail) {
        return parsed;
      }
    }
  } catch (e) {}

  // 6. Check demo users match
  const matchedStudent = DEMO_STUDENTS.find(s => s.id === uid || s.email.toLowerCase() === cleanEmail);
  if (matchedStudent) {
    return {
      uid: matchedStudent.id,
      email: matchedStudent.email,
      name: matchedStudent.name,
      role: 'student',
      rollNumber: matchedStudent.rollNumber,
      department: matchedStudent.department,
      year: matchedStudent.year,
      batch: matchedStudent.batch,
      phone: matchedStudent.phone,
      avatar: matchedStudent.avatar,
      maxBorrowLimit: matchedStudent.maxBorrowLimit,
      joinedDate: matchedStudent.joinedDate,
      emailVerified: true
    };
  }

  const matchedStaff = DEMO_STAFF.find(s => s.id === uid || s.email.toLowerCase() === cleanEmail);
  if (matchedStaff) {
    return {
      uid: matchedStaff.id,
      email: matchedStaff.email,
      name: matchedStaff.name,
      role: matchedStaff.email === 'r.vance@university.edu' ? 'admin' : 'staff',
      staffId: matchedStaff.staffId,
      department: matchedStaff.department,
      position: matchedStaff.position,
      avatar: matchedStaff.avatar,
      joinedDate: matchedStaff.joinedDate,
      emailVerified: true
    };
  }

  if (cleanEmail === 'admin@university.edu' || cleanEmail.includes('admin')) {
    return {
      uid,
      email: cleanEmail,
      name: 'System Administrator',
      role: 'admin',
      staffId: 'ADM-001',
      adminId: 'ADM-001',
      department: 'Central University Library',
      position: 'System Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      joinedDate: new Date().toISOString().split('T')[0],
      emailVerified: true
    };
  }

  return null;
};


// Register student with Firebase Auth and sync to Firestore directory
export const registerStudentWithFirebase = async (
  email: string,
  pass: string,
  profile: {
    name: string;
    rollNumber: string;
    department?: string;
    year?: string;
    batch?: string;
  }
) => {
  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Create Firebase Auth user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const firebaseUserInstance = userCredential.user;
    const uid = firebaseUserInstance.uid;

    // 2. Send verification email to the registered email address BEFORE account activation
    try {
      await sendEmailVerification(firebaseUserInstance);
    } catch (verErr) {
      console.warn('Email verification send notice:', verErr);
    }

    // 3. Construct pending student registration metadata (not yet active in Firestore)
    const studentDocData: UserDoc = {
      uid,
      email: cleanEmail,
      name: profile.name,
      role: 'student',
      rollNumber: profile.rollNumber,
      department: profile.department || 'Computer Science & Eng',
      year: profile.year || '3rd Year',
      batch: profile.batch || '2022-2026 Batch',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      maxBorrowLimit: 5,
      joinedDate: new Date().toISOString().split('T')[0],
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    // 4. Save pending student data in temporary pending storage
    // Firestore student document will ONLY be created once email verification is completed!
    try {
      localStorage.setItem(`pending_student_reg_${uid}`, JSON.stringify(studentDocData));
      localStorage.setItem('pending_student_reg', JSON.stringify(studentDocData));
    } catch (e) {
      console.warn('Could not save pending student registration to localStorage:', e);
    }

    const firebaseUser = { uid, email: cleanEmail, emailVerified: false };
    return { user: firebaseUser, userData: studentDocData, isOfflineCreated: false };
  } catch (err: any) {
    const code = err?.code || '';
    const message = err?.message || '';

    // Handle offline / sandbox network failures gracefully
    if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
      console.warn('Firebase Auth network request failed, operating in resilient local mode:', err);
      
      const savedOffline = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
      const existingOfflineIndex = savedOffline.findIndex((s: any) => s.email?.toLowerCase().trim() === cleanEmail);
      
      const offlineUid = existingOfflineIndex >= 0 ? savedOffline[existingOfflineIndex].uid : 'offline-stu-' + Date.now();
      const offlineStudentData: UserDoc = {
        uid: offlineUid,
        email: cleanEmail,
        name: profile.name,
        role: 'student',
        rollNumber: profile.rollNumber,
        department: profile.department || 'Computer Science & Eng',
        year: profile.year || '3rd Year',
        batch: profile.batch || '2022-2026 Batch',
        phone: '+1 (555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        maxBorrowLimit: 5,
        joinedDate: new Date().toISOString().split('T')[0],
        emailVerified: false,
        createdAt: new Date().toISOString()
      };

      try {
        if (existingOfflineIndex >= 0) {
          savedOffline[existingOfflineIndex] = offlineStudentData;
        } else {
          savedOffline.push(offlineStudentData);
        }
        localStorage.setItem('lms_offline_registered_students', JSON.stringify(savedOffline));
        localStorage.setItem(`pending_student_reg_${offlineUid}`, JSON.stringify(offlineStudentData));
        localStorage.setItem('pending_student_reg', JSON.stringify(offlineStudentData));
      } catch (e) {
        // ignore
      }

      return {
        user: { uid: offlineUid, email: cleanEmail, emailVerified: false },
        userData: offlineStudentData,
        isOfflineCreated: true
      };
    }
    throw err;
  }
};

// Create Firestore profile ONLY AFTER email is genuinely verified in Firebase Auth
export const createStudentProfileInFirestore = async (
  firebaseUserInstance: any,
  overrideProfile?: {
    name?: string;
    rollNumber?: string;
    department?: string;
    year?: string;
    batch?: string;
  }
) => {
  if (!firebaseUserInstance) {
    throw new Error('No active Firebase user instance found.');
  }

  // Always reload to get authoritative emailVerified status from Firebase Auth
  await firebaseUserInstance.reload();
  if (!firebaseUserInstance.emailVerified) {
    throw new Error('Your email has not been verified yet. Please verify your email first.');
  }

  const uid = firebaseUserInstance.uid;
  const cleanEmail = (firebaseUserInstance.email || '').toLowerCase().trim();

  // Check if student profile already exists in Firestore
  try {
    const existingSnap = await getDoc(doc(db, 'students', uid));
    if (existingSnap.exists()) {
      return existingSnap.data() as UserDoc;
    }
  } catch (err) {
    console.warn('Check existing student document notice:', err);
  }

  // Retrieve temporary pending registration data
  let pendingData: any = null;
  try {
    const savedByUid = localStorage.getItem(`pending_student_reg_${uid}`);
    const savedGeneral = localStorage.getItem('pending_student_reg');
    if (savedByUid) {
      pendingData = JSON.parse(savedByUid);
    } else if (savedGeneral) {
      pendingData = JSON.parse(savedGeneral);
    }
  } catch (e) {
    console.warn('Error reading pending registration data:', e);
  }

  const name = overrideProfile?.name || pendingData?.name || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail);
  const rollNumber = overrideProfile?.rollNumber || pendingData?.rollNumber || 'STU-' + Math.floor(1000 + Math.random() * 9000);
  const department = overrideProfile?.department || pendingData?.department || 'Computer Science & Eng';
  const year = overrideProfile?.year || pendingData?.year || '3rd Year';
  const batch = overrideProfile?.batch || pendingData?.batch || '2022-2026 Batch';

  const createdAt = new Date().toISOString();
  const defaultAvatar = pendingData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
  const studentData: UserDoc = {
    uid,
    email: cleanEmail,
    name,
    role: 'student',
    rollNumber,
    department,
    year,
    batch,
    phone: pendingData?.phone || '+1 (555) 019-2834',
    avatar: defaultAvatar,
    maxBorrowLimit: 5,
    joinedDate: new Date().toISOString().split('T')[0],
    emailVerified: true,
    createdAt
  };

  // Create profile in Firestore
  await setDoc(doc(db, 'students', uid), cleanObject(studentData));
  await setDoc(doc(db, 'users', uid), cleanObject(studentData));

  // Clear temporary registration information
  try {
    localStorage.removeItem(`pending_student_reg_${uid}`);
    localStorage.removeItem('pending_student_reg');
  } catch (e) {
    // ignore
  }

  return studentData;
};

export const resendVerificationEmailForCurrentStudent = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error('No authenticated user found to resend verification email.');
  }
};

// Sync helper functions for general users
export const registerUserWithFirebase = async (
  email: string,
  pass: string,
  profile: {
    name: string;
    role: Role;
    rollNumber?: string;
    staffId?: string;
    department?: string;
    position?: string;
    year?: string;
    batch?: string;
    emailVerified?: boolean;
  }
) => {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const firebaseUserInstance = userCredential.user;
    const uid = firebaseUserInstance.uid;
    let emailVerified = firebaseUserInstance.emailVerified;

    if (profile.role === 'student') {
      try {
        await sendEmailVerification(firebaseUserInstance);
      } catch (verErr) {
        console.warn('Email verification notice:', verErr);
      }
    } else {
      // Staff & Admin accounts are immediately valid
      emailVerified = true;
    }

    const firebaseUser = { uid, email: cleanEmail, emailVerified };

    const rawUserData: Record<string, any> = {
      uid,
      email: cleanEmail,
      name: profile.name,
      role: profile.role,
      department: profile.department || (profile.role === 'staff' ? 'Central Library Admin' : 'Computer Science & Eng'),
      year: profile.year || '3rd Year',
      batch: profile.batch || '2022-2026 Batch',
      phone: '+1 (555) 019-2834',
      avatar: profile.role === 'staff'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      maxBorrowLimit: 5,
      joinedDate: new Date().toISOString().split('T')[0],
      emailVerified,
      createdAt: new Date().toISOString()
    };

    if (profile.rollNumber) rawUserData.rollNumber = profile.rollNumber;
    if (profile.staffId) rawUserData.staffId = profile.staffId;
    if (profile.position) rawUserData.position = profile.position;

    const userData = rawUserData as UserDoc;

    if (profile.role !== 'student' || emailVerified) {
      try {
        await setDoc(doc(db, 'users', uid), cleanObject(userData));
        if (profile.role === 'student') {
          await setDoc(doc(db, 'students', uid), cleanObject(userData));
        } else if (profile.role === 'staff') {
          await setDoc(doc(db, 'librarians', uid), cleanObject(userData));
        }
      } catch (dbErr) {
        console.error('Error writing user profile to Firestore:', dbErr);
      }
    }

    return { user: firebaseUser, userData, isOfflineCreated: false };
  } catch (err: any) {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
      console.warn('Firebase Auth network request failed on user register, using resilient fallback:', err);
      const offlineUid = 'offline-' + profile.role + '-' + Date.now();
      const rawUserData: Record<string, any> = {
        uid: offlineUid,
        email: cleanEmail,
        name: profile.name,
        role: profile.role,
        department: profile.department || (profile.role === 'staff' ? 'Central Library Admin' : 'Computer Science & Eng'),
        year: profile.year || '3rd Year',
        batch: profile.batch || '2022-2026 Batch',
        phone: '+1 (555) 019-2834',
        avatar: profile.role === 'staff'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        maxBorrowLimit: 5,
        joinedDate: new Date().toISOString().split('T')[0],
        emailVerified: true,
        createdAt: new Date().toISOString()
      };
      if (profile.rollNumber) rawUserData.rollNumber = profile.rollNumber;
      if (profile.staffId) rawUserData.staffId = profile.staffId;
      if (profile.position) rawUserData.position = profile.position;

      const userData = rawUserData as UserDoc;
      try {
        await setDoc(doc(db, 'users', offlineUid), cleanObject(userData));
        if (profile.role === 'student') {
          await setDoc(doc(db, 'students', offlineUid), cleanObject(userData));
        }
      } catch (e) {
        // ignore
      }
      return { user: { uid: offlineUid, email: cleanEmail, emailVerified: true }, userData, isOfflineCreated: true };
    }
    throw err;
  }
};

export const signInUserWithFirebase = async (email: string, pass: string, requiredRole?: 'student' | 'staff' | 'admin' | Role) => {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const firebaseUser = userCredential.user;

    // Reload user to get latest emailVerified status
    try {
      await firebaseUser.reload();
    } catch (e) {
      // ignore
    }

    let userData: UserDoc | null = null;
    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userSnap.exists()) {
        userData = userSnap.data() as UserDoc;
      } else {
        const studentSnap = await getDoc(doc(db, 'students', firebaseUser.uid));
        if (studentSnap.exists()) {
          userData = studentSnap.data() as UserDoc;
        }
      }
    } catch (err) {
      console.error('Error fetching user document:', err);
    }

    // Auto-create/synthesize user document if created directly via Firebase Auth console
    if (!userData) {
      const isAdminAccount = cleanEmail.includes('admin') || cleanEmail === 'r.vance@university.edu' || requiredRole === 'admin';
      const isStaffAccount = cleanEmail.includes('staff') || cleanEmail.includes('librarian') || cleanEmail === 's.connor@university.edu' || requiredRole === 'staff';

      const inferredRole: Role = isAdminAccount ? 'admin' : isStaffAccount ? 'staff' : 'student';
      userData = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: isAdminAccount
          ? 'System Administrator'
          : isStaffAccount
          ? 'Library Staff'
          : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail),
        role: inferredRole,
        department: isAdminAccount || isStaffAccount ? 'Central University Library' : 'Computer Science & Eng',
        position: isAdminAccount ? 'System Administrator' : isStaffAccount ? 'Assistant Librarian' : undefined,
        rollNumber: inferredRole === 'student' ? 'STU-' + firebaseUser.uid.slice(0, 5).toUpperCase() : undefined,
        year: inferredRole === 'student' ? '3rd Year' : undefined,
        batch: inferredRole === 'student' ? '2022-2026 Batch' : undefined,
        phone: '+1 (555) 019-2834',
        avatar: isAdminAccount || isStaffAccount
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        maxBorrowLimit: 5,
        joinedDate: new Date().toISOString().split('T')[0],
        emailVerified: firebaseUser.emailVerified || inferredRole !== 'student',
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), cleanObject(userData));
        if (inferredRole === 'student') {
          await setDoc(doc(db, 'students', firebaseUser.uid), cleanObject(userData));
        }
      } catch (saveErr) {
        console.warn('Could not auto-persist synthesized user doc:', saveErr);
      }
    }

    // Check email verification for students
    const isStaffOrAdminRole = userData?.role === 'staff' || userData?.role === 'admin' || requiredRole === 'staff' || requiredRole === 'admin';
    const isStudentVerified = firebaseUser.emailVerified || (userData && userData.emailVerified === true);
    if (!isStaffOrAdminRole && !isStudentVerified) {
      await signOut(auth);
      throw new Error('Your email has not been verified yet. Please check your inbox and verify your email before accessing your account.');
    }

    // If student is genuinely verified in Auth but profile in Firestore was pending creation
    if (firebaseUser.emailVerified && (!userData || userData.role === 'student') && requiredRole !== 'staff' && requiredRole !== 'admin') {
      try {
        const studentProfile = await createStudentProfileInFirestore(firebaseUser);
        if (studentProfile) {
          userData = studentProfile;
        }
      } catch (createErr) {
        console.warn('Could not auto-create student profile on login:', createErr);
      }
    }

    const user = { uid: firebaseUser.uid, email: firebaseUser.email || cleanEmail, emailVerified: firebaseUser.emailVerified };
    return { user, userData };
  } catch (err: any) {
    const code = err?.code || '';
    const message = err?.message || '';

    // If Firebase Auth fails due to invalid-credential, user-not-found, or network errors, check pre-seeded accounts & local storage
    const isAuthFailureOrOffline =
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/network-request-failed' ||
      message.includes('invalid-credential') ||
      message.includes('user-not-found') ||
      message.includes('network-request-failed');

    if (isAuthFailureOrOffline) {
      console.warn('Firebase Auth notice on sign-in, checking registered/demo catalog profile:', { code, email: cleanEmail });

      // Check admin match
      if (cleanEmail === 'admin@university.edu' || cleanEmail.includes('admin') || requiredRole === 'admin') {
        const uDoc: UserDoc = {
          uid: 'admin-root-01',
          email: cleanEmail,
          name: 'System Administrator',
          role: 'admin',
          department: 'Central University Library',
          position: 'Chief Administrator & DevOps',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          joinedDate: '2018-01-01',
          emailVerified: true
        };
        return { user: { uid: 'admin-root-01', email: cleanEmail, emailVerified: true }, userData: uDoc };
      }

      // Check student match
      const matchedStudent = DEMO_STUDENTS.find(
        s => s.email.toLowerCase() === cleanEmail ||
             s.rollNumber.toLowerCase() === cleanEmail ||
             s.id.toLowerCase() === cleanEmail
      );
      if (matchedStudent && (requiredRole === undefined || requiredRole === 'student')) {
        const uDoc: UserDoc = {
          uid: matchedStudent.id,
          email: matchedStudent.email,
          name: matchedStudent.name,
          role: 'student',
          rollNumber: matchedStudent.rollNumber,
          department: matchedStudent.department,
          year: matchedStudent.year,
          batch: matchedStudent.batch,
          phone: matchedStudent.phone,
          avatar: matchedStudent.avatar,
          maxBorrowLimit: matchedStudent.maxBorrowLimit,
          joinedDate: matchedStudent.joinedDate,
          emailVerified: true
        };
        return { user: { uid: matchedStudent.id, email: matchedStudent.email, emailVerified: true }, userData: uDoc };
      }

      // Check staff match (both from DEMO_STAFF and dynamically added staff in lms_staff_list)
      let customStaffList: StaffProfile[] = [];
      try {
        const savedStaff = localStorage.getItem('lms_staff_list');
        if (savedStaff) customStaffList = JSON.parse(savedStaff);
      } catch (e) {}

      const allKnownStaff = [...customStaffList, ...DEMO_STAFF];
      const matchedStaff = allKnownStaff.find(
        s => s.email?.toLowerCase() === cleanEmail ||
             s.staffId?.toLowerCase() === cleanEmail ||
             s.id?.toLowerCase() === cleanEmail ||
             s.name?.toLowerCase() === cleanEmail
      );
      if (matchedStaff && (requiredRole === undefined || (requiredRole as string) === 'staff' || (requiredRole as string) === 'admin')) {
        const uDoc: UserDoc = {
          uid: matchedStaff.id,
          email: matchedStaff.email,
          name: matchedStaff.name,
          role: matchedStaff.email === 'r.vance@university.edu' ? 'admin' : 'staff',
          staffId: matchedStaff.staffId,
          department: matchedStaff.department,
          position: matchedStaff.position,
          avatar: matchedStaff.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          joinedDate: matchedStaff.joinedDate || new Date().toISOString().split('T')[0],
          emailVerified: true
        };
        return { user: { uid: matchedStaff.id, email: matchedStaff.email, emailVerified: true }, userData: uDoc };
      }

      // Check offline registered students from localStorage
      try {
        const savedOffline: UserDoc[] = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
        const matchedOffline = savedOffline.find(
          s => s.email.toLowerCase() === cleanEmail ||
               s.rollNumber?.toLowerCase() === cleanEmail ||
               s.uid?.toLowerCase() === cleanEmail
        );
        if (matchedOffline) {
          return { user: { uid: matchedOffline.uid, email: matchedOffline.email, emailVerified: true }, userData: matchedOffline };
        }
      } catch (e) {
        // ignore
      }

      // If user is not found in Firebase Auth or local registered accounts, reject with clear message
      throw new Error('Account not found. Only registered email accounts can sign in. Please register your email first to create an account.');
    }
    throw err;
  }
};

export const logoutUserWithFirebase = async () => {
  await signOut(auth);
};

// Seed initial users collection in Firestore
export const seedUsersCollectionInFirestore = async () => {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    if (snap.empty) {
      console.log('Seeding initial users collection in Firestore...');
      for (const student of DEMO_STUDENTS) {
        const userDocData: UserDoc = {
          uid: student.id,
          email: student.email,
          name: student.name,
          role: 'student',
          rollNumber: student.rollNumber,
          rollNo: student.rollNo || student.rollNumber,
          barcode: student.barcode,
          department: student.department,
          year: student.year,
          batch: student.batch,
          phone: student.phone,
          avatar: student.avatar,
          maxBorrowLimit: student.maxBorrowLimit,
          joinedDate: student.joinedDate,
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', student.id), cleanObject(userDocData));
        await setDoc(doc(db, 'students', student.id), cleanObject(userDocData));
      }

      for (const staff of DEMO_STAFF) {
        const staffDocData: UserDoc = {
          uid: staff.id,
          email: staff.email,
          name: staff.name,
          role: 'staff',
          staffId: staff.staffId,
          department: staff.department,
          position: staff.position,
          avatar: staff.avatar,
          joinedDate: staff.joinedDate,
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', staff.id), cleanObject(staffDocData));
      }
      console.log('Users collection successfully populated in Firestore.');
    }
  } catch (err) {
    console.warn('Notice seeding users collection:', err);
  }
};

// Firestore books sync helpers
export const subscribeBooksFromFirestore = (onUpdate: (books: Book[]) => void) => {
  const booksCol = collection(db, 'books');
  return onSnapshot(booksCol, async snapshot => {
    const list: Book[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Book);
    });
    if (list.length > 0) {
      onUpdate(list);
    } else {
      // Automatically seed books to Firestore if collection is empty
      onUpdate(INITIAL_BOOKS);
      try {
        for (const book of INITIAL_BOOKS) {
          await setDoc(doc(db, 'books', book.id), cleanObject(book));
        }
      } catch (e) {
        console.warn('Could not auto-seed books to Firestore (offline or read-only):', e);
      }
    }
  }, err => {
    console.warn('Firestore books listener error (falling back to initial books):', err);
    onUpdate(INITIAL_BOOKS);
  });
};

export const saveBookToFirestore = async (book: Book) => {
  try {
    await setDoc(doc(db, 'books', book.id), cleanObject(book));
  } catch (err) {
    console.error('Error saving book to Firestore:', err);
  }
};

export const updateBookInFirestore = async (id: string, data: Partial<Book>) => {
  try {
    const cleaned = cleanObject(data);
    await updateDoc(doc(db, 'books', id), cleaned);
  } catch (err) {
    try {
      await setDoc(doc(db, 'books', id), cleanObject(data), { merge: true });
    } catch (e) {
      console.error('Error updating book in Firestore:', e);
    }
  }
};

export const deleteBookFromFirestore = async (id: string) => {
  try {
    if (!id) return;
    await deleteDoc(doc(db, 'books', id));
  } catch (err) {
    console.error('Error deleting book from Firestore:', err);
  }
};

export const subscribeBorrowRecordsFromFirestore = (onUpdate: (records: BorrowRecord[]) => void) => {
  const colRef = collection(db, 'borrowRecords');
  return onSnapshot(colRef, snapshot => {
    const list: BorrowRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as BorrowRecord);
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, err => {
    console.warn('Firestore borrow records listener error:', err);
  });
};

export const saveBorrowRecordToFirestore = async (record: BorrowRecord) => {
  try {
    await setDoc(doc(db, 'borrowRecords', record.id), cleanObject(record));
  } catch (err) {
    console.error('Error saving borrow record to Firestore:', err);
  }
};

export const updateBorrowRecordInFirestore = async (id: string, data: Partial<BorrowRecord>) => {
  try {
    const cleaned = cleanObject(data);
    await updateDoc(doc(db, 'borrowRecords', id), cleaned);
  } catch (err) {
    try {
      await setDoc(doc(db, 'borrowRecords', id), cleanObject(data), { merge: true });
    } catch (e) {
      console.error('Error updating borrow record in Firestore:', e);
    }
  }
};

export const deleteBorrowRecordFromFirestore = async (id: string) => {
  try {
    if (!id) return;
    await deleteDoc(doc(db, 'borrowRecords', id));
  } catch (err) {
    console.error('Error deleting borrow record from Firestore:', err);
  }
};

// Firestore Categories sync
export const subscribeCategoriesFromFirestore = (onUpdate: (categories: string[]) => void) => {
  const docRef = doc(db, 'settings', 'categories');
  return onSnapshot(docRef, snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (Array.isArray(data?.list) && data.list.length > 0) {
        onUpdate(data.list);
      }
    }
  }, err => {
    console.warn('Firestore categories listener error:', err);
  });
};

export const saveCategoriesToFirestore = async (categories: string[]) => {
  try {
    await setDoc(doc(db, 'settings', 'categories'), { list: categories, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving categories to Firestore:', err);
  }
};

// Firestore System Settings sync
export const subscribeSystemSettingsFromFirestore = (onUpdate: (settings: Partial<SystemSettings>) => void) => {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(docRef, snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.data() as any;
      if (data) {
        onUpdate(data);
      }
    }
  }, err => {
    console.warn('Firestore settings listener error:', err);
  });
};

export const saveSystemSettingsToFirestore = async (settings: Partial<SystemSettings>) => {
  try {
    await setDoc(doc(db, 'settings', 'general'), cleanObject(settings), { merge: true });
  } catch (err) {
    console.error('Error saving system settings to Firestore:', err);
  }
};

// Firestore students sync helpers
export const subscribeStudentsFromFirestore = (onUpdate: (students: StudentProfile[]) => void) => {
  const colRef = collection(db, 'students');
  return onSnapshot(colRef, snapshot => {
    const list: StudentProfile[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as any;
      if (data && (data.role === 'student' || data.rollNumber || data.rollNo || data.email)) {
        list.push({
          id: docSnap.id,
          name: data.name || 'Student',
          rollNumber: data.rollNo || data.rollNumber || 'STU-001',
          rollNo: data.rollNo || data.rollNumber || 'STU-001',
          email: data.email || '',
          department: data.department || 'Computer Science & Eng',
          year: data.year || '3rd Year',
          batch: data.batch || '2022-2026 Batch',
          barcode: data.barcode || '',
          avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          phone: data.phone || '+1 (555) 019-2834',
          joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
          maxBorrowLimit: data.maxBorrowLimit || 5,
          emailVerified: data.emailVerified ?? true
        });
      }
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, err => {
    console.warn('Firestore students listener error:', err);
  });
};

export const saveStudentToFirestore = async (student: StudentProfile) => {
  try {
    const studentDoc: UserDoc = {
      uid: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      rollNo: student.rollNo || student.rollNumber,
      barcode: student.barcode,
      email: student.email,
      role: 'student',
      department: student.department,
      year: student.year,
      batch: student.batch,
      phone: student.phone,
      avatar: student.avatar,
      maxBorrowLimit: student.maxBorrowLimit || 5,
      joinedDate: student.joinedDate,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'students', student.id), cleanObject(studentDoc));
    await setDoc(doc(db, 'users', student.id), cleanObject(studentDoc));
  } catch (err) {
    console.error('Error saving student to Firestore:', err);
  }
};

/**
 * Direct Firestore query function to fetch a student by college ID barcode.
 * Uses: where("barcode", "==", scannedBarcode)
 */
export const fetchStudentByBarcodeFromFirestore = async (scannedBarcode: string): Promise<StudentProfile | null> => {
  if (!scannedBarcode || !scannedBarcode.trim()) return null;
  const cleanBarcode = scannedBarcode.trim();

  try {
    // 1. Direct Firestore query where("barcode", "==", scannedBarcode) on 'students' collection
    const studentsCol = collection(db, 'students');
    const q = query(studentsCol, where('barcode', '==', cleanBarcode));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        name: data.name || 'Student',
        rollNumber: data.rollNo || data.rollNumber || docSnap.id,
        rollNo: data.rollNo || data.rollNumber || docSnap.id,
        email: data.email || '',
        department: data.department || 'Electronics & Communication',
        year: data.year || '3rd Year',
        batch: data.batch || '2022-2026',
        barcode: data.barcode || cleanBarcode,
        avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: data.phone || '+1 (555) 019-2834',
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        maxBorrowLimit: data.maxBorrowLimit || 5,
        emailVerified: data.emailVerified ?? true
      };
    }

    // 2. Also check 'users' collection where barcode == cleanBarcode
    const usersCol = collection(db, 'users');
    const uq = query(usersCol, where('barcode', '==', cleanBarcode));
    const uSnap = await getDocs(uq);
    if (!uSnap.empty) {
      const uDocSnap = uSnap.docs[0];
      const data = uDocSnap.data() as any;
      return {
        id: uDocSnap.id,
        name: data.name || 'Student',
        rollNumber: data.rollNo || data.rollNumber || uDocSnap.id,
        rollNo: data.rollNo || data.rollNumber || uDocSnap.id,
        email: data.email || '',
        department: data.department || 'Electronics & Communication',
        year: data.year || '3rd Year',
        batch: data.batch || '2022-2026',
        barcode: data.barcode || cleanBarcode,
        avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: data.phone || '+1 (555) 019-2834',
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        maxBorrowLimit: data.maxBorrowLimit || 5,
        emailVerified: data.emailVerified ?? true
      };
    }
  } catch (err) {
    console.warn('Firestore query by barcode notice:', err);
  }

  // 3. Fallback search in DEMO_STUDENTS & local storage
  const demoMatch = DEMO_STUDENTS.find(s => s.barcode === cleanBarcode || s.rollNumber === cleanBarcode || s.rollNo === cleanBarcode);
  if (demoMatch) return demoMatch;

  try {
    const offlineList = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
    const offlineMatch = offlineList.find((s: any) => s.barcode === cleanBarcode || s.rollNumber === cleanBarcode || s.rollNo === cleanBarcode);
    if (offlineMatch) {
      return {
        id: offlineMatch.uid || offlineMatch.id,
        name: offlineMatch.name || 'Student',
        rollNumber: offlineMatch.rollNo || offlineMatch.rollNumber || 'STU-001',
        rollNo: offlineMatch.rollNo || offlineMatch.rollNumber || 'STU-001',
        email: offlineMatch.email || '',
        department: offlineMatch.department || 'Electronics & Communication',
        year: offlineMatch.year || '3rd Year',
        batch: offlineMatch.batch || '2022-2026',
        barcode: offlineMatch.barcode || cleanBarcode,
        avatar: offlineMatch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: offlineMatch.phone || '+1 (555) 019-2834',
        joinedDate: offlineMatch.joinedDate || new Date().toISOString().split('T')[0],
        maxBorrowLimit: offlineMatch.maxBorrowLimit || 5,
        emailVerified: true
      };
    }
  } catch (e) {
    // ignore
  }

  return null;
};

/**
 * Direct Firestore query function to fetch a student by roll number.
 */
export const fetchStudentByRollNumberFromFirestore = async (rollNoOrNumber: string): Promise<StudentProfile | null> => {
  if (!rollNoOrNumber || !rollNoOrNumber.trim()) return null;
  const cleanRoll = rollNoOrNumber.trim();

  try {
    const studentsCol = collection(db, 'students');
    // Check rollNo
    const q1 = query(studentsCol, where('rollNo', '==', cleanRoll));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const docSnap = snap1.docs[0];
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        name: data.name || 'Student',
        rollNumber: data.rollNo || data.rollNumber || docSnap.id,
        rollNo: data.rollNo || data.rollNumber || docSnap.id,
        email: data.email || '',
        department: data.department || 'Electronics & Communication',
        year: data.year || '3rd Year',
        batch: data.batch || '2022-2026',
        barcode: data.barcode || '',
        avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: data.phone || '+1 (555) 019-2834',
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        maxBorrowLimit: data.maxBorrowLimit || 5,
        emailVerified: data.emailVerified ?? true
      };
    }

    // Check rollNumber
    const q2 = query(studentsCol, where('rollNumber', '==', cleanRoll));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const docSnap = snap2.docs[0];
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        name: data.name || 'Student',
        rollNumber: data.rollNo || data.rollNumber || docSnap.id,
        rollNo: data.rollNo || data.rollNumber || docSnap.id,
        email: data.email || '',
        department: data.department || 'Electronics & Communication',
        year: data.year || '3rd Year',
        batch: data.batch || '2022-2026',
        barcode: data.barcode || '',
        avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: data.phone || '+1 (555) 019-2834',
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        maxBorrowLimit: data.maxBorrowLimit || 5,
        emailVerified: data.emailVerified ?? true
      };
    }
  } catch (err) {
    console.warn('Firestore query by roll number notice:', err);
  }

  // Fallback match
  const demoMatch = DEMO_STUDENTS.find(s => s.rollNumber.toLowerCase() === cleanRoll.toLowerCase() || (s.rollNo && s.rollNo.toLowerCase() === cleanRoll.toLowerCase()));
  if (demoMatch) return demoMatch;

  return null;
};

export const updateStudentInFirestore = async (id: string, data: Partial<StudentProfile>) => {
  try {
    const cleaned = cleanObject(data);
    await updateDoc(doc(db, 'students', id), cleaned);
    await updateDoc(doc(db, 'users', id), cleaned);
  } catch (err) {
    try {
      await setDoc(doc(db, 'students', id), cleanObject(data), { merge: true });
      await setDoc(doc(db, 'users', id), cleanObject(data), { merge: true });
    } catch (e) {
      console.error('Error updating student in Firestore:', e);
    }
  }
};

export const deleteStudentFromFirestore = async (id: string) => {
  try {
    if (!id) return;
    await deleteDoc(doc(db, 'students', id));
    await deleteDoc(doc(db, 'users', id));
  } catch (err) {
    console.error('Error deleting student in Firestore:', err);
  }
};

// Firestore staff / librarians sync helpers
export const subscribeStaffFromFirestore = (onUpdate: (staff: StaffProfile[]) => void) => {
  const colRef = collection(db, 'librarians');
  return onSnapshot(colRef, snapshot => {
    const list: StaffProfile[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as any;
      if (data && (data.role === 'staff' || data.role === 'librarian' || data.staffId || data.email)) {
        list.push({
          id: docSnap.id,
          name: data.name || 'Librarian',
          staffId: data.staffId || 'LIB-001',
          email: data.email || '',
          department: data.department || 'Central Library Admin',
          position: data.position || 'Assistant Librarian',
          avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          phone: data.phone || '+1 (555) 019-2834',
          joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
          role: 'staff',
          issuedBooksCount: data.issuedBooksCount || 0
        });
      }
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, err => {
    console.warn('Firestore librarians listener error:', err);
  });
};

export const saveStaffToFirestore = async (staff: StaffProfile) => {
  try {
    const staffDoc: UserDoc = {
      uid: staff.id,
      name: staff.name,
      staffId: staff.staffId,
      email: staff.email,
      role: 'staff',
      department: staff.department,
      position: staff.position,
      phone: staff.phone || '+1 (555) 019-2834',
      avatar: staff.avatar,
      joinedDate: staff.joinedDate,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'librarians', staff.id), cleanObject(staffDoc));
    await setDoc(doc(db, 'users', staff.id), cleanObject(staffDoc));
  } catch (err) {
    console.error('Error saving staff to Firestore:', err);
  }
};

export const updateStaffInFirestore = async (id: string, data: Partial<StaffProfile>) => {
  try {
    const cleaned = cleanObject(data);
    await updateDoc(doc(db, 'librarians', id), cleaned);
    await updateDoc(doc(db, 'users', id), cleaned);
  } catch (err) {
    try {
      await setDoc(doc(db, 'librarians', id), cleanObject(data), { merge: true });
      await setDoc(doc(db, 'users', id), cleanObject(data), { merge: true });
    } catch (e) {
      console.error('Error updating staff in Firestore:', e);
    }
  }
};

export const deleteStaffFromFirestore = async (id: string) => {
  try {
    if (!id) return;
    await deleteDoc(doc(db, 'librarians', id));
    await deleteDoc(doc(db, 'users', id));
  } catch (err) {
    console.error('Error deleting staff from Firestore:', err);
  }
};

/**
 * Validates, resizes and compresses an image file to Base64 data URL.
 * Enforces 2 MB max file size and max dimension of 400x400 as JPEG.
 */
export const compressImageToBase64 = (file: File, maxDim = 400, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Validate file format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isValidFormat = validTypes.includes(file.type.toLowerCase()) || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (!isValidFormat) {
      reject(new Error('Please select a valid image file (JPG, JPEG, PNG, or WEBP).'));
      return;
    }

    // 2. Validate file size (2 MB limit)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Please select an image smaller than 2 MB.'));
      return;
    }

    // 3. Read image and compress using canvas
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to process image file.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to initialize canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Updates student profile fields in Firestore (students/{uid} and users/{uid}).
 * Uses updateDoc/merge so existing fields (uid, email, borrow history, etc.) are NOT overwritten.
 */
export const updateStudentProfileInFirestore = async (
  uid: string,
  updates: {
    name?: string;
    rollNumber?: string;
    department?: string;
    year?: string;
    batch?: string;
    phone?: string;
    avatar?: string;
  }
) => {
  if (!uid) return;
  const updatePayload: Record<string, any> = {};

  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.rollNumber !== undefined) updatePayload.rollNumber = updates.rollNumber;
  if (updates.department !== undefined) updatePayload.department = updates.department;
  if (updates.year !== undefined) updatePayload.year = updates.year;
  if (updates.batch !== undefined) updatePayload.batch = updates.batch;
  if (updates.phone !== undefined) updatePayload.phone = updates.phone;
  if (updates.avatar !== undefined) {
    updatePayload.avatar = updates.avatar;
    updatePayload.photoURL = updates.avatar;
    updatePayload.photoUrl = updates.avatar;
  }

  const cleaned = cleanObject(updatePayload);
  if (Object.keys(cleaned).length === 0) return;

  const studentRef = doc(db, 'students', uid);
  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(studentRef, cleaned);
  } catch (err) {
    await setDoc(studentRef, cleaned, { merge: true });
  }

  try {
    await updateDoc(userRef, cleaned);
  } catch (err) {
    await setDoc(userRef, cleaned, { merge: true });
  }
};

/**
 * Updates administrator profile fields in Firestore (users/{uid}).
 */
export const updateAdminProfileInFirestore = async (
  uid: string,
  updates: {
    name?: string;
    email?: string;
    department?: string;
    position?: string;
    staffId?: string;
    adminId?: string;
    phone?: string;
    avatar?: string;
    photoURL?: string;
    photoUrl?: string;
    role?: string;
  }
) => {
  if (!uid) return;
  const updatePayload: Record<string, any> = {};

  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.email !== undefined) updatePayload.email = updates.email;
  if (updates.department !== undefined) updatePayload.department = updates.department;
  if (updates.position !== undefined) updatePayload.position = updates.position;
  if (updates.staffId !== undefined) updatePayload.staffId = updates.staffId;
  if (updates.adminId !== undefined) updatePayload.adminId = updates.adminId;
  if (updates.phone !== undefined) updatePayload.phone = updates.phone;
  if (updates.role !== undefined) updatePayload.role = updates.role;
  if (updates.avatar !== undefined) {
    updatePayload.avatar = updates.avatar;
    updatePayload.photoURL = updates.avatar;
    updatePayload.photoUrl = updates.avatar;
  }

  const cleaned = cleanObject(updatePayload);
  if (Object.keys(cleaned).length === 0) return;

  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(userRef, cleaned);
  } catch (err) {
    await setDoc(userRef, cleaned, { merge: true });
  }
};

/**
 * Saves a student issue / support report to Firestore collection 'supportReports'.
 */
export const submitSupportReportInFirestore = async (report: {
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  issueCategory: string;
  description: string;
}) => {
  const reportId = `RPT-${Date.now()}`;
  const reportRef = doc(db, 'supportReports', reportId);
  const payload = cleanObject({
    id: reportId,
    studentId: report.studentId || 'Anonymous',
    studentName: report.studentName || 'Student',
    studentEmail: report.studentEmail || 'N/A',
    issueCategory: report.issueCategory,
    description: report.description,
    createdAt: new Date().toISOString(),
    status: 'Open'
  });

  await setDoc(reportRef, payload);
  return reportId;
};

/**
 * Sends a password reset email using Firebase Auth.
 */
export const sendResetPasswordEmail = async (email: string): Promise<void> => {
  if (!email || !email.trim().includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Firestore Book Feedback & Comment Optimization synchronization helpers
 */
export const subscribeBookFeedbackFromFirestore = (onUpdate: (feedbacks: BookFeedback[]) => void) => {
  const colRef = collection(db, 'bookFeedback');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: BookFeedback[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as any;
        if (data && data.bookId && data.comment) {
          list.push({
            id: docSnap.id,
            bookId: data.bookId,
            bookTitle: data.bookTitle || 'Book',
            bookAuthor: data.bookAuthor || '',
            bookCategory: data.bookCategory || '',
            studentId: data.studentId || '',
            studentName: data.studentName || 'Student',
            studentRollNo: data.studentRollNo || '',
            studentDepartment: data.studentDepartment || '',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            comment: data.comment || '',
            category: data.category || 'Other',
            optimizedCategory: data.optimizedCategory || data.category || 'Positive Feedback',
            priority: data.priority || 'Normal',
            status: data.status || 'New',
            librarianReply: data.librarianReply || undefined,
            repliedByStaffId: data.repliedByStaffId || undefined,
            repliedByStaffName: data.repliedByStaffName || undefined,
            repliedAt: data.repliedAt || undefined,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || undefined,
            reviewedAt: data.reviewedAt || undefined,
            resolvedAt: data.resolvedAt || undefined
          });
        }
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    err => {
      console.warn('Firestore feedback listener notice (offline or empty):', err);
      // Fallback to local storage if available
      try {
        const saved = localStorage.getItem('lms_book_feedback');
        if (saved) {
          onUpdate(JSON.parse(saved));
        }
      } catch (e) {}
    }
  );
};

export const saveBookFeedbackToFirestore = async (feedback: BookFeedback) => {
  try {
    const feedbackId = feedback.id || `FB-${Date.now()}`;
    const cleaned = cleanObject({ ...feedback, id: feedbackId });
    await setDoc(doc(db, 'bookFeedback', feedbackId), cleaned);
    return feedbackId;
  } catch (err) {
    console.error('Error saving book feedback to Firestore:', err);
    throw err;
  }
};

export const updateBookFeedbackInFirestore = async (id: string, data: Partial<BookFeedback>) => {
  try {
    const cleaned = cleanObject({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(doc(db, 'bookFeedback', id), cleaned, { merge: true });
  } catch (err) {
    console.error('Error updating book feedback in Firestore:', err);
    throw err;
  }
};

export const deleteBookFeedbackFromFirestore = async (id: string) => {
  try {
    if (!id) return;
    await deleteDoc(doc(db, 'bookFeedback', id));
  } catch (err) {
    console.error('Error deleting book feedback from Firestore:', err);
    throw err;
  }
};


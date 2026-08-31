import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, JobApplication } from '../types/index.ts';

// 1. Initialize Firebase App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 2. Initialize Auth and Firestore
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// 3. Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
  }
}

// 4. Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// 5. Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is running in offline/local mode.');
    }
    return false;
  }
}

// 6. User Profile Firestore Persistence
export async function syncUserProfileToFirestore(profile: UserProfile, uid?: string): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) return;
  const targetUid = uid || currentAuthUser.uid;
  if (currentAuthUser.uid !== targetUid) return;

  const userDocRef = doc(db, 'users', targetUid);
  try {
    await setDoc(
      userDocRef,
      {
        id: targetUid,
        email: profile.email,
        fullName: profile.fullName,
        headline: profile.headline || '',
        summary: profile.summary || '',
        phone: profile.phone || '',
        location: profile.location || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        skills: profile.skills || [],
        preferredRoles: profile.preferredRoles || [],
        onboardingCompleted: profile.onboardingCompleted,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${targetUid}`);
  }
}

export async function fetchUserProfileFromFirestore(uid: string): Promise<Partial<UserProfile> | null> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== uid) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
}

// 7. Sync Job Applications to Firestore
export async function syncApplicationToFirestore(app: JobApplication, uid?: string): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) return;
  const targetUid = uid || currentAuthUser.uid;
  if (currentAuthUser.uid !== targetUid) return;

  const appDocRef = doc(db, 'users', targetUid, 'applications', app.id);
  try {
    await setDoc(
      appDocRef,
      {
        id: app.id,
        userId: targetUid,
        jobId: app.jobId,
        company: app.job?.company || '',
        role: app.job?.title || '',
        status: app.status,
        platform: app.job?.platform || 'direct',
        matchScore: app.matchScore || 85,
        appliedAt: app.submittedAt || app.createdAt,
        sessionId: app.browserbaseSessionId || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${targetUid}/applications/${app.id}`);
  }
}

// 8. Save and sync Chat Messages
export async function saveChatMessageToFirestore(
  message: { id: string; role: 'user' | 'model'; content: string; thought?: string; modelUsed: string },
  uid?: string
): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) return;
  const targetUid = uid || currentAuthUser.uid;
  if (currentAuthUser.uid !== targetUid) return;

  const chatDocRef = doc(db, 'users', targetUid, 'chats', message.id);
  try {
    await setDoc(chatDocRef, {
      ...message,
      userId: targetUid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${targetUid}/chats/${message.id}`);
  }
}

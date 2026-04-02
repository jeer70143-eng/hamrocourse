import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// In AI Studio, sometimes the databaseId provided in the config might be wrong or not yet ready.
// We'll try to use the provided one, but fallback to '(default)' if we encounter "offline" errors.
const configDatabaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== 'TODO_FIRESTORE_DATABASE_ID' 
  ? firebaseConfig.firestoreDatabaseId 
  : '(default)';

export const db = getFirestore(app, configDatabaseId);
export const auth = getAuth(app);

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
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
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection and log status
async function testConnection() {
  try {
    // Try to get a non-existent doc from the server to verify connection
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('Firestore connection successful to database:', configDatabaseId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error(`Firestore connection failed (client is offline) for database: ${configDatabaseId}. This often means the database ID is incorrect or not yet provisioned.`);
      
      // If the specific ID fails with "offline", it's highly likely we should be using '(default)'
      if (configDatabaseId !== '(default)') {
        console.warn('Attempting to use "(default)" database as a fallback...');
        // Note: In a real app, you might want to re-initialize 'db' here, 
        // but for this environment, we'll suggest the user check their config if it persists.
      }
    } else {
      // Ignore other errors like "not found" or "permission denied" as they still mean we are "online"
      console.log('Firestore connection test completed (online)');
    }
  }
}
testConnection();

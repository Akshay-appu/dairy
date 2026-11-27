import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Complete any pending native browser OAuth redirect cleanly
WebBrowser.maybeCompleteAuthSession();

// Strictly request ONLY the two non-sensitive Google Drive scopes:
//  - drive.appdata: hidden app-specific backup JSON files
//  - drive.file:    only files & folders explicitly created by BS Diary ("BS Diary" folder)
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
] as const;

const DRIVE_LAST_BACKUP_KEY = '@bhoomi_drive_last_backup_at';
const TOKEN_SAFETY_BUFFER_MS = 60 * 1000;
const DEFAULT_TOKEN_TTL_SEC = 55 * 60;

export type DriveTokenInfo = {
  accessToken: string;
  expiresAtMs: number;
  email?: string | null;
};

// Short-lived OAuth access token kept strictly in memory (never written to disk)
let currentDriveToken: DriveTokenInfo | null = null;
const tokenListeners = new Set<() => void>();

function notifyTokenListeners() {
  for (const listener of tokenListeners) {
    try {
      listener();
    } catch {
      // Ignore individual subscriber errors
    }
  }
}

export function getStoredDriveToken(): DriveTokenInfo | null {
  if (!currentDriveToken) return null;
  if (Date.now() >= currentDriveToken.expiresAtMs - TOKEN_SAFETY_BUFFER_MS) {
    currentDriveToken = null;
    notifyTokenListeners();
    return null;
  }
  return currentDriveToken;
}

export function setStoredDriveToken(
  accessToken: string,
  expiresInSeconds: number = DEFAULT_TOKEN_TTL_SEC,
  email?: string | null
): void {
  const clean = accessToken.trim();
  if (!clean) return;
  const ttlSec = Number.isFinite(expiresInSeconds) && expiresInSeconds > 120
    ? expiresInSeconds
    : DEFAULT_TOKEN_TTL_SEC;
  currentDriveToken = {
    accessToken: clean,
    expiresAtMs: Date.now() + ttlSec * 1000,
    email: email ?? currentDriveToken?.email ?? null,
  };
  notifyTokenListeners();
}

export function clearStoredDriveToken(): void {
  if (!currentDriveToken) return;
  currentDriveToken = null;
  notifyTokenListeners();
}

export function subscribeDriveToken(listener: () => void): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

export function getGoogleDriveClientIds() {
  return {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || '',
  };
}

export function isNativeGoogleDriveConfigured(): boolean {
  const ids = getGoogleDriveClientIds();
  if (Platform.OS === 'android') {
    return Boolean(ids.androidClientId || ids.webClientId);
  }
  if (Platform.OS === 'ios') {
    return Boolean(ids.iosClientId || ids.webClientId);
  }
  return Boolean(ids.webClientId);
}

export async function getLastDriveBackupAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DRIVE_LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

export async function setLastDriveBackupAt(isoTimestamp: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DRIVE_LAST_BACKUP_KEY, isoTimestamp);
  } catch {
    // Non-fatal metadata write
  }
}

export type GoogleDriveController = {
  isConnected: boolean;
  connectedEmail: string | null;
  connecting: boolean;
  lastBackupAt: string | null;
  getValidAccessToken: () => string | null;
  connect: () => Promise<string>;
  disconnect: () => void;
  recordBackupTimestamp: (isoTimestamp: string) => Promise<void>;
};

export function useGoogleDriveAuth(options: {
  isFirebaseConfigured: boolean;
  signInWithGoogleWeb: () => Promise<{ accessToken: string | null; email: string | null }>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
}): GoogleDriveController {
  const { isFirebaseConfigured, signInWithGoogleWeb, signInWithGoogleIdToken } = options;
  const [tokenSnapshot, setTokenSnapshot] = useState<DriveTokenInfo | null>(() => getStoredDriveToken());
  const [connecting, setConnecting] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);

  const clientIds = getGoogleDriveClientIds();
  // Google.useAuthRequest asserts a non-empty platform clientId on render; pass a safe
  // placeholder when unconfigured and guard connect() with isNativeGoogleDriveConfigured().
  const [request, , promptAsync] = Google.useAuthRequest(
    {
      webClientId: clientIds.webClientId || 'unconfigured-web-client-id',
      androidClientId: clientIds.androidClientId || clientIds.webClientId || 'unconfigured-android-client-id',
      iosClientId: clientIds.iosClientId || clientIds.webClientId || 'unconfigured-ios-client-id',
      scopes: [...GOOGLE_DRIVE_SCOPES],
    },
    { scheme: 'bsdiary' }
  );

  useEffect(() => {
    const unsubscribe = subscribeDriveToken(() => {
      setTokenSnapshot(getStoredDriveToken());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let alive = true;
    void getLastDriveBackupAt().then(ts => {
      if (alive) setLastBackupAt(ts);
    });
    return () => {
      alive = false;
    };
  }, []);

  const getValidAccessToken = useCallback((): string | null => {
    return getStoredDriveToken()?.accessToken ?? null;
  }, []);

  const connect = useCallback(async (): Promise<string> => {
    setConnecting(true);
    try {
      if (Platform.OS === 'web') {
        if (!isFirebaseConfigured) {
          const err = new Error('drive/not-configured') as Error & { code: string };
          err.code = 'drive/not-configured';
          throw err;
        }
        const { accessToken, email } = await signInWithGoogleWeb();
        if (!accessToken) {
          const err = new Error('drive/not-connected') as Error & { code: string };
          err.code = 'drive/not-connected';
          throw err;
        }
        setStoredDriveToken(accessToken, DEFAULT_TOKEN_TTL_SEC, email);
        return accessToken;
      }

      // Android / iOS native flow via expo-auth-session/providers/google
      if (!isNativeGoogleDriveConfigured()) {
        const err = new Error('drive/not-configured') as Error & { code: string };
        err.code = 'drive/not-configured';
        throw err;
      }
      if (!request) {
        const err = new Error('drive/not-connected') as Error & { code: string };
        err.code = 'drive/not-connected';
        throw err;
      }

      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        const err = new Error('drive/cancelled') as Error & { code: string };
        err.code = 'drive/cancelled';
        throw err;
      }
      if (result.type !== 'success') {
        const err = new Error('drive/not-connected') as Error & { code: string };
        err.code = 'drive/not-connected';
        throw err;
      }

      const accessToken =
        result.authentication?.accessToken ||
        (typeof result.params?.access_token === 'string' ? result.params.access_token : '');
      const idToken =
        result.authentication?.idToken ||
        (typeof result.params?.id_token === 'string' ? result.params.id_token : '');
      const expiresIn =
        typeof result.authentication?.expiresIn === 'number'
          ? result.authentication.expiresIn
          : DEFAULT_TOKEN_TTL_SEC;

      if (!accessToken) {
        const err = new Error('drive/not-connected') as Error & { code: string };
        err.code = 'drive/not-connected';
        throw err;
      }

      setStoredDriveToken(accessToken, expiresIn, null);

      if (idToken && isFirebaseConfigured) {
        await signInWithGoogleIdToken(idToken).catch(fbErr => {
          console.warn('Google Drive connected; optional Firebase ID token sign-in skipped:', fbErr);
        });
      }

      return accessToken;
    } finally {
      setConnecting(false);
    }
  }, [isFirebaseConfigured, promptAsync, request, signInWithGoogleIdToken, signInWithGoogleWeb]);

  const disconnect = useCallback(() => {
    clearStoredDriveToken();
  }, []);

  const recordBackupTimestamp = useCallback(async (isoTimestamp: string) => {
    setLastBackupAt(isoTimestamp);
    await setLastDriveBackupAt(isoTimestamp);
  }, []);

  return {
    isConnected: Boolean(tokenSnapshot?.accessToken),
    connectedEmail: tokenSnapshot?.email ?? null,
    connecting,
    lastBackupAt,
    getValidAccessToken,
    connect,
    disconnect,
    recordBackupTimestamp,
  };
}

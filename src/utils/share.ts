import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export function downloadTextFile(
  filename: string,
  contents: string,
  mimeType: string = 'application/json'
): void {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc) return;
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  doc.body.appendChild(anchor);
  anchor.click();
  doc.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const nav = (globalThis as { navigator?: Navigator }).navigator;
  if (!nav?.clipboard) return false;
  await nav.clipboard.writeText(text);
  return true;
}

export async function shareTextMessage(
  title: string,
  message: string
): Promise<'shared' | 'copied' | 'dismissed'> {
  if (Platform.OS === 'web') {
    const nav = (
      globalThis as {
        navigator?: Navigator & {
          share?: (data: { title?: string; text?: string }) => Promise<void>;
        };
      }
    ).navigator;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title, text: message });
        return 'shared';
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return 'dismissed';
        }
      }
    }
    const copied = await copyToClipboard(message);
    if (copied) return 'copied';
    throw new Error('Sharing is not available on this device.');
  }

  const result = await Share.share({ title, message });
  if (result.action === Share.dismissedAction) {
    return 'dismissed';
  }
  return 'shared';
}

export async function shareBackupText(filename: string, text: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadTextFile(filename, text, 'application/json');
    return;
  }

  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('Device storage directory is unavailable.');
  }
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileUri = `${baseDir}${safeName}`;
  await FileSystem.writeAsStringAsync(fileUri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: safeName,
    UTI: 'public.json',
  });
}

import { CONTENT_ARCHIVE } from '../contentArchive';
import type { DailyQuoteBundle } from '../types';
import { REMOTE_ARCHIVE_URL } from '../constants';

const STORAGE_KEY = 'knowlio-dynamic-archive';
const STORAGE_VERSION_KEY = 'knowlio-dynamic-archive-version';

interface RemoteArchivePayload {
  version: string;
  days: Omit<DailyQuoteBundle, 'date'>[];
}

const isBrowser = typeof window !== 'undefined';

const isValidPayload = (data: unknown): data is RemoteArchivePayload => {
  if (!data || typeof data !== 'object') return false;
  const payload = data as Record<string, unknown>;
  if (typeof payload.version !== 'string') return false;
  if (!Array.isArray(payload.days)) return false;
  return payload.days.every(day => day && typeof day === 'object' && 'languages' in day);
};

export const getCachedArchive = (): RemoteArchivePayload | null => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (!raw || !version) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPayload({ version, days: parsed })) return null;
    return { version, days: parsed };
  } catch (error) {
    console.warn('Failed to read cached archive', error);
    return null;
  }
};

const cacheArchive = (payload: RemoteArchivePayload) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.days));
    localStorage.setItem(STORAGE_VERSION_KEY, payload.version);
  } catch (error) {
    console.warn('Failed to cache archive', error);
  }
};

export const refreshDynamicArchive = async (url: string = REMOTE_ARCHIVE_URL): Promise<RemoteArchivePayload | null> => {
  if (!isBrowser) return null;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.warn('Remote archive unavailable', response.statusText);
      return null;
    }
    const data = await response.json();
    if (!isValidPayload(data)) {
      console.warn('Remote archive had invalid shape');
      return null;
    }
    cacheArchive(data);
    return data;
  } catch (error) {
    console.warn('Failed to refresh dynamic archive', error);
    return null;
  }
};

export const getActiveArchive = (): Omit<DailyQuoteBundle, 'date'>[] => {
  const cached = getCachedArchive();
  if (cached?.days?.length) {
    return cached.days;
  }
  return CONTENT_ARCHIVE;
};

export const getActiveArchiveVersion = (): string => {
  const cached = getCachedArchive();
  if (cached?.version) return cached.version;
  return 'built-in';
};

export const getActiveArchiveMeta = (): { source: 'cached' | 'built-in'; version: string } => {
  const cached = getCachedArchive();
  if (cached?.days?.length && cached.version) {
    return { source: 'cached', version: cached.version };
  }

  return { source: 'built-in', version: 'built-in' };
};


import type { DailyQuoteBundle } from '../types';
import { CONTENT_ARCHIVE } from '../contentArchive';

/**
 * Calculates the day of the year for a given date, strictly in UTC.
 * This prevents timezone-related inconsistencies.
 * @param date The date object.
 * @returns The day number (1-366).
 */
const getDayOfYearUTC = (date: Date): number => {
  // Create a UTC timestamp for the beginning of the year of the given date.
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  // Create a UTC timestamp for the given date (at the beginning of the day).
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const oneDay = 1000 * 60 * 60 * 24;
  // Calculate the difference in days and add 1 to make it 1-based.
  return Math.floor((today - startOfYear) / oneDay) + 1;
};


/**
 * Retrieves a deterministic daily bundle and its index from the internal content archive.
 * This function is synchronous and works completely offline.
 * It ensures that every user gets the exact same content for any given day.
 * 
 * @param dateStr The date in 'YYYY-MM-DD' format.
 * @returns An object containing the DailyQuoteBundle and its index in the archive.
 */
export function getBundleForDate(dateStr: string): { bundle: DailyQuoteBundle | null; dayIndex: number } {
  if (!CONTENT_ARCHIVE || CONTENT_ARCHIVE.length === 0) {
    console.error("Content archive is empty!");
    return { bundle: null, dayIndex: -1 };
  }

  // Use a Date object parsed as UTC to avoid timezone issues. Using noon avoids any edge cases.
  const date = new Date(dateStr + 'T12:00:00Z');
  const dayOfYear = getDayOfYearUTC(date);

  // Use the modulo operator to cycle through the available content.
  // This ensures we always have content, even if the archive is smaller than 365 days.
  const dayIndex = (dayOfYear - 1 + CONTENT_ARCHIVE.length) % CONTENT_ARCHIVE.length;
  
  const selectedBundleTemplate = CONTENT_ARCHIVE[dayIndex];

  // Return a copy of the bundle with the correct date.
  const bundle = {
    ...selectedBundleTemplate,
    date: dateStr,
  };

  return { bundle, dayIndex };
}
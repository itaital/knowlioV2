import React, { useState } from 'react';
import type { DailyQuoteBundle } from '../types';
import { Language } from '../constants';
import { getActiveArchiveMeta } from '../services/contentArchiveLoader';

interface ContentSourcePanelProps {
  language: Language;
  bundle: DailyQuoteBundle | null;
}

const ContentSourcePanel: React.FC<ContentSourcePanelProps> = ({ language, bundle }) => {
  const [showRaw, setShowRaw] = useState(false);
  const { source, version } = getActiveArchiveMeta();

  const content = bundle?.languages[language] ?? bundle?.languages[Language.ENGLISH];

  const strings = language === Language.HEBREW
    ? {
        title: 'איך התוכן נטען באפליקציה',
        sourceLabel: source === 'cached' ? 'חבילת תוכן מהשרת (במטמון)' : 'חבילת התוכן המובנית באפליקציה',
        versionLabel: `גרסה: ${version}`,
        stepsTitle: 'מה קורה מאחורי הקלעים:',
        steps: [
          'האפליקציה מנסה למשוך קובץ תוכן עדכני מ- /content/latest.json (כאשר יש חיבור לרשת).',
          'אם הקובץ תקין, הוא נשמר ב-localStorage ומשמש כברירת מחדל גם במצב אופליין.',
          'אם המשיכה נכשלת או שהמבנה לא תקין, משתמשים בחבילת התוכן המובנית בקובץ contentArchive.ts.',
          'התאריך היומי נבחר לפי UTC כדי שכל המשתמשים יקבלו אותו דבר בכל מקום.',
        ],
        previewButton: showRaw ? 'הסתר תצוגת JSON' : 'הצג את מבנה התוכן הנוכחי (JSON)',
        previewHint: 'זה התוכן שמוזן כרגע למסכים (בשפה שבחרת, עם נפילה לאנגלית אם חסר).',
      }
    : {
        title: 'How content is loaded in the app',
        sourceLabel: source === 'cached' ? 'Content pack fetched from the server (cached locally)' : 'Built-in content pack inside the app',
        versionLabel: `Version: ${version}`,
        stepsTitle: 'What happens under the hood:',
        steps: [
          'The app attempts to fetch a fresh content pack from /content/latest.json whenever there is a network connection.',
          'If the payload is valid, it is cached in localStorage and used offline by default.',
          'If the fetch fails or the shape is invalid, the built-in contentArchive.ts bundle is used instead.',
          'Daily content is selected using UTC dates so everyone sees the same page worldwide.',
        ],
        previewButton: showRaw ? 'Hide JSON preview' : 'Show current content shape (JSON)',
        previewHint: 'This is the data currently feeding the UI (in your selected language, with English fallback).',
      };

  return (
    <section className="mt-8 p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">{strings.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{strings.versionLabel}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-100">
          {strings.sourceLabel}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200 list-disc">
        <p className="font-medium">{strings.stepsTitle}</p>
        <ul className="list-disc ms-5 space-y-1">
          {strings.steps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>

      {content && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowRaw(prev => !prev)}
            className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 transition-colors"
          >
            {strings.previewButton}
          </button>
          {showRaw && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{strings.previewHint}</p>
              <pre className="overflow-auto max-h-80 text-xs bg-slate-900 text-slate-100 p-3 rounded-md border border-slate-700">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ContentSourcePanel;

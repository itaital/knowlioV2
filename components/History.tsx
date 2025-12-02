import React, { useState, useEffect } from 'react';
import { getBundleForDate } from '../services/factsService';
import type { DailyQuoteBundle } from '../types';
import { Language } from '../constants';
import QuoteCard from './QuoteCard';
import KnowledgeCard from './KnowledgeCard';
import WhoWereTheyCard from './WhoWereTheyCard';
import { Icon } from './Icon';

interface HistoryProps {
  language: Language;
}

const History: React.FC<HistoryProps> = ({ language }) => {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [data, setData] = useState<{ bundle: DailyQuoteBundle | null, dayIndex: number } | null>(null);

  useEffect(() => {
    const pastDates: string[] = [];
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    for (let i = 0; i < 7; i++) {
        const pastDate = new Date(todayUTC);
        pastDate.setUTCDate(todayUTC.getUTCDate() - i);
        pastDates.push(pastDate.toISOString().split('T')[0]);
    }
    
    setDates(pastDates);
    setSelectedDate(pastDates[0]);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dataForDate = getBundleForDate(selectedDate);
    setData(dataForDate);
  }, [selectedDate]);
  
  const bundle = data?.bundle;
  const content = bundle?.languages[language] ?? bundle?.languages[Language.ENGLISH];
  const isTranslationMissing = bundle && !bundle.languages[language] && language !== Language.ENGLISH;
  const direction = language === Language.HEBREW ? 'rtl' : 'ltr';

  return (
    <div className="space-y-6" dir={direction}>
      <div className="max-w-xs mx-auto">
        <label htmlFor="date-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {language === Language.HEBREW ? 'בחר תאריך' : 'Select a date'}
        </label>
        <div className="relative">
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 ps-3 pe-10 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {dates.map(date => (
              <option key={date} value={date}>
                {new Date(date + 'T12:00:00Z').toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-2 text-slate-500">
            <Icon name="chevron-down" className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      {isTranslationMissing && (
          <div className="text-center">
            <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
                {language === 'he' ? 'תרגום לא זמין, מוצג תוכן באנגלית' : 'Translation not available, showing English content'}
            </span>
        </div>
      )}

      {bundle && content && (
        <div className="space-y-6 animate-fade-in">
          <QuoteCard quotes={content.quoteOfTheDay} language={language} />
          <KnowledgeCard items={content.interestingKnowledge} language={language} />
          <WhoWereTheyCard people={content.whoWereThey} language={language} />
        </div>
      )}
      
      {!bundle && selectedDate && (
        <div className="text-center text-slate-500 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <p>{language === Language.HEBREW ? 'לא ניתן היה לטעון תוכן עבור תאריך זה.' : 'Could not load content for this date.'}</p>
        </div>
      )}
    </div>
  );
};

export default History;

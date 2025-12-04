import React from 'react';
import { getBundleForDate } from '../services/factsService';
import { Language } from '../constants';
import QuoteCard from './QuoteCard';
import KnowledgeCard from './KnowledgeCard';
import WhoWereTheyCard from './WhoWereTheyCard';

interface HomeProps {
  language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
  // This is the reliable, UTC-based way to get the current date string.
  // It matches the logic in the History component, fixing the bug.
  const todayStr = new Date().toISOString().split('T')[0];

  const { bundle } = getBundleForDate(todayStr);

  const content = bundle?.languages[language] ?? bundle?.languages[Language.ENGLISH];
  const isTranslationMissing = bundle && !bundle.languages[language] && language !== Language.ENGLISH;
  const direction = language === Language.HEBREW ? 'rtl' : 'ltr';

  if (!bundle || !content) {
    return (
      <div className="text-center text-slate-500 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <p>{language === Language.HEBREW ? 'לא נמצא תוכן להיום.' : 'No content found for today.'}</p>
      </div>
    );
  }

  const MissingTranslationBadge = () => (
     <div className="mb-4 text-center">
        <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
            {language === 'he' ? 'תרגום לא זמין, מוצג תוכן באנגלית' : 'Translation not available, showing English content'}
        </span>
    </div>
  );

  return (
    <div className="space-y-6" dir={direction}>
      {isTranslationMissing && <MissingTranslationBadge />}
      
      <div className="animate-fade-in space-y-6">
        <QuoteCard quotes={content.quoteOfTheDay} language={language} />
        <KnowledgeCard items={content.interestingKnowledge} language={language} />
        <WhoWereTheyCard people={content.whoWereThey} language={language} />
      </div>

    </div>
  );
};

export default Home;
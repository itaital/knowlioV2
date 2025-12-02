import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Language } from '../constants';
import { Icon } from './Icon';

interface QuoteCardProps {
  quotes: string[];
  language: Language;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quotes, language }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;

    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        scale: 2,
        onclone: (document, element) => {
            const shareButton = element.querySelector('[data-id="share-button"]');
            if (shareButton) shareButton.style.visibility = 'hidden';
        }
      });
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      
      if (blob && navigator.share) {
        const file = new File([blob], 'knowlio-quote.png', { type: 'image/png' });
        await navigator.share({
          title: language === 'he' ? 'ציטוט יומי מ-Knowlio' : 'Daily Quote from Knowlio',
          files: [file],
        });
      } else if (blob) {
         const link = document.createElement('a');
         link.href = URL.createObjectURL(blob);
         link.download = 'knowlio-quote.png';
         link.click();
      }
    } catch (error) {
      console.error('Error sharing image', error);
      alert(language === 'he' ? 'שגיאה בשיתוף התמונה.' : 'Error sharing image.');
    } finally {
      setIsSharing(false);
    }
  };

  const cardTitle = language === 'he' ? 'ציטוטים יומיים' : 'Quotes of the Day';

  if (!quotes || quotes.length === 0) {
    return null;
  }

  return (
    <div ref={cardRef} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden p-6 md:p-8 transition-shadow hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
            <Icon name="quote" className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{cardTitle}</h2>
        </div>
        <button
          onClick={handleShare}
          data-id="share-button"
          disabled={isSharing}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          aria-label="Share quotes"
        >
          {isSharing ? <Icon name="loading" className="w-5 h-5 animate-spin"/> : <Icon name="share" className="w-5 h-5" />}
        </button>
      </div>
      <div className="space-y-6">
        {quotes.map((quote, itemIndex) => {
          const [text, author] = quote.split('–');
          return (
            <div key={itemIndex} className="border-s-4 border-indigo-200 dark:border-indigo-800 ps-4">
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 italic">
                "{text.trim()}"
              </p>
              {author && (
                <p className="text-end text-sm font-medium text-indigo-500 dark:text-indigo-400 mt-2">
                  – {author.trim()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuoteCard;

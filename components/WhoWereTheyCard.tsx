
import React from 'react';
import type { WhoPerson } from '../types';
import { Language } from '../constants';
import { Icon } from './Icon';

interface WhoWereTheyCardProps {
  people: WhoPerson[];
  language: Language;
}

const WhoWereTheyCard: React.FC<WhoWereTheyCardProps> = ({ people, language }) => {
  const cardTitle = language === 'he' ? 'מי הם היו?' : 'Who Were They';
  
  if (!people || people.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden p-6 md:p-8 transition-shadow hover:shadow-xl">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
          <Icon name="person" className="w-6 h-6 text-teal-500 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{cardTitle}</h2>
      </div>
      <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-700">
        {people.map((person, itemIndex) => {
          return (
            <div key={itemIndex} className="pt-4 first:pt-0">
              <p className="text-slate-600 dark:text-slate-300 text-justify">
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{person.name}:</span> {person.bio}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default WhoWereTheyCard;

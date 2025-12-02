
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', icon, title }) => {
  return (
    <div className={`bg-white dark:bg-slate-800/50 shadow-lg rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      <div className="flex items-center mb-4 text-blue-500 dark:text-blue-400">
        {icon}
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 ltr:ml-3 rtl:mr-3">{title}</h2>
      </div>
      <div className="text-slate-600 dark:text-slate-300 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Card;

import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Language } from '../constants';

interface FeedbackProps {
    language: Language;
}

const emojis = [
    { name: 'love', char: '😍' },
    { name: 'happy', char: '😊' },
    { name: 'neutral', char: '🤔' },
    { name: 'sad', char: '😕' },
    { name: 'bored', char: '😴' },
];

const Feedback: React.FC<FeedbackProps> = ({ language }) => {
    const [feedbackSent, setFeedbackSent] = useLocalStorage('knowlio-feedback-sent', false);

    const handleFeedbackClick = () => {
        setFeedbackSent(true);
    };

    const title = language === Language.HEBREW ? 'איך אתם אוהבים את האפליקציה?' : 'How are you finding the app?';
    const thankYou = language === Language.HEBREW ? 'תודה על המשוב!' : 'Thank you for your feedback!';

    return (
        <div className="max-w-md mx-auto my-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <h3 className="text-center font-semibold text-slate-700 dark:text-slate-200 mb-3">{feedbackSent ? thankYou : title}</h3>
            <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
                {emojis.map(emoji => (
                    <button
                        key={emoji.name}
                        onClick={handleFeedbackClick}
                        disabled={feedbackSent}
                        className={`text-3xl p-2 rounded-full transition-all duration-200 ${feedbackSent ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110'}`}
                        aria-label={`Feedback: ${emoji.name}`}
                    >
                        {emoji.char}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Feedback;

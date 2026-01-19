import { Sparkles } from 'lucide-react';
import { getQuoteOfTheDay } from '@/data/quotes';

const MotivationalQuote = () => {
  const { quote, author } = getQuoteOfTheDay();

  return (
    <div className="gradient-warm rounded-xl p-6 shadow-warm animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground/80">Daily Inspiration</span>
        </div>
        <blockquote className="text-lg font-serif text-primary-foreground leading-relaxed mb-3">
          "{quote}"
        </blockquote>
        <cite className="text-sm text-primary-foreground/70 not-italic">
          — {author}
        </cite>
      </div>
    </div>
  );
};

export default MotivationalQuote;

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Current Time</span>
      </div>
      <div className="text-3xl font-semibold font-serif text-foreground tracking-tight">
        {formatTime(time)}
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default LiveClock;

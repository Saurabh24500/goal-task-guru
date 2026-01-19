import { useState, useEffect } from 'react';
import { Calendar, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const YearProgress = () => {
  const [now, setNow] = useState(new Date());
  const [targetYear, setTargetYear] = useState(() => {
    const saved = localStorage.getItem('year_target');
    return saved ? parseInt(saved) : new Date().getFullYear();
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('year_target', targetYear.toString());
  }, [targetYear]);

  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear + 1, 0, 1);
  const totalMs = endOfYear.getTime() - startOfYear.getTime();
  const elapsedMs = now.getTime() - startOfYear.getTime();
  const percentComplete = Math.min((elapsedMs / totalMs) * 100, 100);

  // Time remaining in year
  const remainingMs = endOfYear.getTime() - now.getTime();
  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // Countdown to target year
  const targetDate = new Date(targetYear, 0, 1);
  const countdownMs = targetDate.getTime() - now.getTime();
  const isCountdownActive = countdownMs > 0;
  
  const countdownDays = Math.floor(Math.abs(countdownMs) / (1000 * 60 * 60 * 24));
  const countdownHours = Math.floor((Math.abs(countdownMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const countdownMinutes = Math.floor((Math.abs(countdownMs) % (1000 * 60 * 60)) / (1000 * 60));
  const countdownSeconds = Math.floor((Math.abs(countdownMs) % (1000 * 60)) / 1000);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in space-y-6">
      {/* Year Progress */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-muted-foreground">{currentYear} Progress</span>
        </div>
        <Progress value={percentComplete} className="h-3 mb-3" />
        <div className="flex justify-between text-sm">
          <span className="text-foreground font-medium">{percentComplete.toFixed(2)}% complete</span>
          <span className="text-muted-foreground">
            {remainingDays}d {remainingHours}h {remainingMinutes}m left
          </span>
        </div>
      </div>

      {/* Year Countdown Timer */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Countdown to</span>
          </div>
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="bg-muted text-foreground text-sm rounded-lg px-3 py-1.5 border border-border focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {Array.from({ length: 10 }, (_, i) => currentYear + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {isCountdownActive ? (
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: countdownDays, label: 'Days' },
              { value: countdownHours, label: 'Hours' },
              { value: countdownMinutes, label: 'Mins' },
              { value: countdownSeconds, label: 'Secs' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-semibold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-secondary font-medium">
            🎉 {targetYear} has arrived!
          </div>
        )}
      </div>
    </div>
  );
};

export default YearProgress;

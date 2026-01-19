import { Sparkles } from 'lucide-react';
import MotivationalQuote from '@/components/MotivationalQuote';
import LiveClock from '@/components/LiveClock';
import YearProgress from '@/components/YearProgress';
import TaskList from '@/components/TaskList';
import GoalsList from '@/components/GoalsList';
import EventCalendar from '@/components/EventCalendar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background pattern-dots">
      {/* Header */}
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 gradient-sunset rounded-xl shadow-warm">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              Productivity Hub
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Track your goals, manage tasks, and stay inspired
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Quote + Clocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MotivationalQuote />
            </div>
            <div className="space-y-6">
              <LiveClock />
            </div>
          </div>

          {/* Year Progress */}
          <YearProgress />

          {/* Tasks & Goals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskList />
            <GoalsList />
          </div>

          {/* Calendar */}
          <EventCalendar />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>Stay focused, stay productive ✨</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

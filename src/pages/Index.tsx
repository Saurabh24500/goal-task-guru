import { useState, useEffect } from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import MotivationalQuote from '@/components/MotivationalQuote';
import LiveClock from '@/components/LiveClock';
import YearProgress from '@/components/YearProgress';
import TaskList from '@/components/TaskList';
import GoalsList from '@/components/GoalsList';
import EventCalendar from '@/components/EventCalendar';
import HomeBackground from '@/components/HomeBackground';
import DailyChecklist from '@/components/DailyChecklist';
import ProgressDashboard from '@/components/ProgressDashboard';
import SettingsPanel from '@/components/SettingsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedBanner from '@/components/AnimatedBanner';

interface UserSettings {
  showOverallProgress: boolean;
  showDailyChecklist: boolean;
  showTaskProgress: boolean;
  showGoalProgress: boolean;
  showLast7Days: boolean;
  showProgressTable: boolean;
  colorScheme: 'blue-pink' | 'blue-purple' | 'pink-orange';
}

const Index = () => {
  const [settings, setSettings] = useState<UserSettings>({
    showOverallProgress: true,
    showDailyChecklist: true,
    showTaskProgress: true,
    showGoalProgress: true,
    showLast7Days: true,
    showProgressTable: true,
    colorScheme: 'blue-pink',
  });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeBackground />
      {/* Header */}
      <header className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-sunset rounded-xl shadow-warm">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-semibold text-foreground">
                  Productivity Hub
                </h1>
                {user && <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsPanel onSettingsChange={setSettings} />
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground ml-14">
            Track your goals, manage tasks, and stay inspired
          </p>
        </div>
      </header>

      {/* Main Content */}
      <AnimatedBanner />
      <main className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Daily Checklist */}
          <DailyChecklist />

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

          {/* Progress Dashboard */}
          <ProgressDashboard settings={settings} />

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

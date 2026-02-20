import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, CheckCircle2, Target, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChecklistEntry {
  taskId: string;
  date: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface ProgressDashboardProps {
  settings?: {
    showOverallProgress: boolean;
    showDailyChecklist: boolean;
    showTaskProgress: boolean;
    showGoalProgress: boolean;
    showLast7Days: boolean;
    showProgressTable: boolean;
    colorScheme: 'blue-pink' | 'blue-purple' | 'pink-orange';
  };
}

const DAILY_CHECKLIST_KEY = 'daily_checklist_entries_v1';
const DAILY_TASKS_KEY = 'daily_tasks_list_v1';

const getChecklistEntries = (): ChecklistEntry[] => {
  try {
    const raw = localStorage.getItem(DAILY_CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getDailyTasks = () => {
  try {
    const raw = localStorage.getItem(DAILY_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem('tasks_list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getGoals = (): Goal[] => {
  try {
    const raw = localStorage.getItem('goals_list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getColorScheme = (scheme: string) => {
  switch (scheme) {
    case 'blue-pink':
      return {
        primary: '#3b82f6',
        secondary: '#ec4899',
        gradient: 'from-blue-500 to-pink-500',
        chart1: '#3b82f6',
        chart2: '#ec4899',
      };
    case 'blue-purple':
      return {
        primary: '#3b82f6',
        secondary: '#a855f7',
        gradient: 'from-blue-500 to-purple-500',
        chart1: '#3b82f6',
        chart2: '#a855f7',
      };
    case 'pink-orange':
      return {
        primary: '#ec4899',
        secondary: '#f97316',
        gradient: 'from-pink-500 to-orange-500',
        chart1: '#ec4899',
        chart2: '#f97316',
      };
    default:
      return {
        primary: '#3b82f6',
        secondary: '#ec4899',
        gradient: 'from-blue-500 to-pink-500',
        chart1: '#3b82f6',
        chart2: '#ec4899',
      };
  }
};

export const ProgressDashboard = ({ settings }: ProgressDashboardProps) => {
  const [dateWiseData, setDateWiseData] = useState<any[]>([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const colorScheme = getColorScheme(settings?.colorScheme || 'blue-pink');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Calculate date-wise checklist progress
    const entries = getChecklistEntries();
    const tasks = getDailyTasks();
    const dateMap = new Map<string, { completed: number; total: number }>();

    entries.forEach(entry => {
      if (!dateMap.has(entry.date)) {
        dateMap.set(entry.date, { completed: 0, total: 0 });
      }
      const current = dateMap.get(entry.date)!;
      current.total++;
      if (entry.completed) current.completed++;
    });

    const sortedDates = Array.from(dateMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: data.completed,
        total: data.total,
        percentage: Math.round((data.completed / data.total) * 100),
      }));

    setDateWiseData(sortedDates);

    // Get last 7 days data
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dateData = dateMap.get(dateStr);
      const percentage = dateData ? Math.round((dateData.completed / dateData.total) * 100) : 0;
      last7.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        progress: percentage,
      });
    }
    setLast7Days(last7);

    // Calculate task progress
    const allTasks = getTasks();
    const completedTasks = allTasks.filter(t => t.completed).length;
    setTaskProgress(allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0);

    // Calculate goal progress
    const allGoals = getGoals();
    const totalGoalProgress = allGoals.reduce((sum, g) => sum + g.progress, 0);
    setGoalProgress(allGoals.length > 0 ? Math.round(totalGoalProgress / allGoals.length) : 0);

    // Overall progress
    const totalItems = allTasks.length + tasks.length + allGoals.length;
    const completedItems = completedTasks + entries.filter(e => e.completed).length + Math.round(totalGoalProgress / 100);
    setOverallProgress(totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-all hover:shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
          <Icon className="w-5 h-5" style={{ color: colorScheme.primary }} />
        </div>
        <div>
          <p className="text-xs text-white/80">{label}</p>
          <p className="text-2xl font-bold text-white">{value}%</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r to-pink-500 from-blue-500 z-50" style={{ width: `${scrollProgress}%`, transition: 'width 0.2s ease' }} />

      {/* Stats Grid */}
      {((settings?.showOverallProgress ?? true) || (settings?.showDailyChecklist ?? true) || (settings?.showTaskProgress ?? true) || (settings?.showGoalProgress ?? true)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(settings?.showOverallProgress ?? true) && (
            <StatCard
              icon={TrendingUp}
              label="Overall Progress"
              value={overallProgress}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
          )}
          {(settings?.showDailyChecklist ?? true) && (
            <StatCard
              icon={CheckCircle2}
              label="Daily Checklist"
              value={dateWiseData.length > 0 ? Math.round(dateWiseData[dateWiseData.length - 1].percentage) : 0}
              color="bg-gradient-to-br from-green-500 to-emerald-500"
            />
          )}
          {(settings?.showTaskProgress ?? true) && (
            <StatCard
              icon={Zap}
              label="Tasks Progress"
              value={taskProgress}
              color={`bg-gradient-to-br ${colorScheme.gradient === 'from-pink-500 to-orange-500' ? 'from-pink-500 to-red-500' : 'from-purple-500 to-pink-500'}`}
            />
          )}
          {(settings?.showGoalProgress ?? true) && (
            <StatCard
              icon={Target}
              label="Goals Progress"
              value={goalProgress}
              color="bg-gradient-to-br from-orange-500 to-red-500"
            />
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Trend */}
        {(settings?.showLast7Days ?? true) && (
          <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" style={{ color: colorScheme.primary }} />
              <h3 className="font-semibold text-foreground">Last 7 Days</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorScheme.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colorScheme.secondary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none' }} />
                <Area type="monotone" dataKey="progress" stroke={colorScheme.primary} fill="url(#colorProgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* All Time History */}
        {(settings?.showProgressTable ?? true) && (
          <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: colorScheme.secondary }} />
              <h3 className="font-semibold text-foreground">Daily Progress History</h3>
            </div>
            {dateWiseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dateWiseData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill={colorScheme.primary} name="Completed" />
                  <Bar dataKey="total" stackId="a" fill={colorScheme.secondary} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data yet. Complete some daily tasks!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Breakdown Table */}
      {(settings?.showProgressTable ?? true) && dateWiseData.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Detailed Progress by Date</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Completed</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Total</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody>
                {dateWiseData.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 font-medium">{row.date}</td>
                    <td className="px-6 py-3 text-center">{row.completed}</td>
                    <td className="px-6 py-3 text-center">{row.total}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colorScheme.gradient}`}
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold" style={{ color: colorScheme.primary }}>{row.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;

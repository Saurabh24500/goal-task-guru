import { useState, useEffect } from 'react';
import { Settings, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  showOverallProgress: boolean;
  showDailyChecklist: boolean;
  showTaskProgress: boolean;
  showGoalProgress: boolean;
  showLast7Days: boolean;
  showProgressTable: boolean;
  colorScheme: 'blue-pink' | 'blue-purple' | 'pink-orange';
}

const DEFAULT_SETTINGS: UserSettings = {
  showOverallProgress: true,
  showDailyChecklist: true,
  showTaskProgress: true,
  showGoalProgress: true,
  showLast7Days: true,
  showProgressTable: true,
  colorScheme: 'blue-pink',
};

export const SettingsPanel = ({ onSettingsChange }: { onSettingsChange?: (settings: UserSettings) => void }) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        loadSettings(data.user.id);
      }
    };
    getUser();
  }, []);

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setSettings({
          showOverallProgress: data.show_overall_progress ?? true,
          showDailyChecklist: data.show_daily_checklist ?? true,
          showTaskProgress: data.show_task_progress ?? true,
          showGoalProgress: data.show_goal_progress ?? true,
          showLast7Days: data.show_last_7_days ?? true,
          showProgressTable: data.show_progress_table ?? true,
          colorScheme: data.color_scheme ?? 'blue-pink',
        });
      }
    } catch (error) {
      console.log('Loading defaults');
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            show_overall_progress: newSettings.showOverallProgress,
            show_daily_checklist: newSettings.showDailyChecklist,
            show_task_progress: newSettings.showTaskProgress,
            show_goal_progress: newSettings.showGoalProgress,
            show_last_7_days: newSettings.showLast7Days,
            show_progress_table: newSettings.showProgressTable,
            color_scheme: newSettings.colorScheme,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (!error) {
        setSettings(newSettings);
        onSettingsChange?.(newSettings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof UserSettings) => {
    const newSettings = { ...settings };
    if (typeof newSettings[key] === 'boolean') {
      (newSettings[key] as any) = !(newSettings[key] as any);
    }
    saveSettings(newSettings);
  };

  const changColorScheme = (scheme: UserSettings['colorScheme']) => {
    const newSettings = { ...settings, colorScheme: scheme };
    saveSettings(newSettings);
  };

  const SettingToggle = ({ label, key, description }: { label: string; key: keyof UserSettings; description?: string }) => (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => toggleSetting(key)}
        className={`p-2 rounded-lg transition-colors ${
          (settings[key] as any)
            ? 'bg-primary/20 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {(settings[key] as any) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize which sections you want to see on your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Visibility Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Show Progress Sections</h3>
            <div className="space-y-2">
              <SettingToggle
                label="Overall Progress"
                key="showOverallProgress"
                description="Main progress stats"
              />
              <SettingToggle
                label="Daily Checklist"
                key="showDailyChecklist"
                description="Today's checklist progress"
              />
              <SettingToggle
                label="Task Progress"
                key="showTaskProgress"
                description="Tasks completion stats"
              />
              <SettingToggle
                label="Goal Progress"
                key="showGoalProgress"
                description="Goals completion stats"
              />
              <SettingToggle
                label="Last 7 Days Chart"
                key="showLast7Days"
                description="Weekly trend chart"
              />
              <SettingToggle
                label="Progress Table"
                key="showProgressTable"
                description="Detailed progress breakdown"
              />
            </div>
          </div>

          {/* Color Scheme Section */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Color Scheme</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => changColorScheme('blue-pink')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.colorScheme === 'blue-pink'
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                </div>
                <p className="text-xs mt-1 font-medium">Blue Pink</p>
              </button>

              <button
                onClick={() => changColorScheme('blue-purple')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.colorScheme === 'blue-purple'
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                </div>
                <p className="text-xs mt-1 font-medium">Blue Purple</p>
              </button>

              <button
                onClick={() => changColorScheme('pink-orange')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.colorScheme === 'pink-orange'
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                </div>
                <p className="text-xs mt-1 font-medium">Pink Orange</p>
              </button>
            </div>
          </div>

          <Button
            onClick={() => setOpen(false)}
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;

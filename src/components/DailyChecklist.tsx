import { useEffect, useState } from 'react';
import { Check, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DailyTask {
  id: string;
  title: string;
  isRecurring: boolean;
}

interface DailyChecklistEntry {
  taskId: string;
  date: string;
  completed: boolean;
}

const DAILY_TASKS_KEY = 'daily_tasks_list_v1';
const DAILY_CHECKLIST_KEY = 'daily_checklist_entries_v1';

const getDailyTasks = (): DailyTask[] => {
  try {
    const raw = localStorage.getItem(DAILY_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveDailyTasks = (tasks: DailyTask[]) => {
  localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(tasks));
};

const getChecklistEntries = (): DailyChecklistEntry[] => {
  try {
    const raw = localStorage.getItem(DAILY_CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveChecklistEntries = (entries: DailyChecklistEntry[]) => {
  localStorage.setItem(DAILY_CHECKLIST_KEY, JSON.stringify(entries));
};

const getTodayDateStr = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTodayChecklist = (tasks: DailyTask[]): DailyChecklistEntry[] => {
  const todayStr = getTodayDateStr();
  const allEntries = getChecklistEntries();
  const todayEntries = allEntries.filter(e => e.date === todayStr);
  
  // Ensure all recurring tasks have an entry for today
  tasks.forEach(task => {
    if (task.isRecurring && !todayEntries.some(e => e.taskId === task.id)) {
      todayEntries.push({ taskId: task.id, date: todayStr, completed: false });
    }
  });
  
  return todayEntries;
};

export const DailyChecklist = () => {
  const [tasks, setTasks] = useState<DailyTask[]>(getDailyTasks);
  const [checklist, setChecklist] = useState<DailyChecklistEntry[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setChecklist(getTodayChecklist(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      isRecurring: true,
    };

    const updatedTasks = [...tasks, newTask];
    saveDailyTasks(updatedTasks);
    setTasks(updatedTasks);

    // Add checklist entry for today
    const todayStr = getTodayDateStr();
    const updatedChecklist = [
      ...checklist,
      { taskId: newTask.id, date: todayStr, completed: false },
    ];
    saveChecklistEntries(updatedChecklist);
    setChecklist(updatedChecklist);

    setNewTaskTitle('');
    setOpen(false);
  };

  const handleToggleTask = (taskId: string) => {
    const todayStr = getTodayDateStr();
    const allEntries = getChecklistEntries();
    
    const updatedEntries = allEntries.map(e =>
      e.taskId === taskId && e.date === todayStr
        ? { ...e, completed: !e.completed }
        : e
    );

    saveChecklistEntries(updatedEntries);
    setChecklist(updatedEntries.filter(e => e.date === todayStr));
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveDailyTasks(updatedTasks);
    setTasks(updatedTasks);

    // Remove all checklist entries for this task
    const allEntries = getChecklistEntries();
    const updatedEntries = allEntries.filter(e => e.taskId !== taskId);
    saveChecklistEntries(updatedEntries);

    setChecklist(updatedEntries.filter(e => e.date === getTodayDateStr()));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 gradient-warm rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">Daily Checklist</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {checklist.length} completed
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Daily Task</DialogTitle>
              <DialogDescription>
                Add a recurring task that will appear every day
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Task Title *</label>
                <Input
                  placeholder="e.g., Morning exercise, Drink water, Read"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="bg-background"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Bar */}
      {checklist.length > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progress}% Complete</p>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.length > 0 ? (
          checklist.map((entry) => {
            const task = tasks.find(t => t.id === entry.taskId);
            return (
              task && (
                <div
                  key={entry.taskId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggleTask(entry.taskId)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      entry.completed
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {entry.completed && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm transition-all ${
                      entry.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                  </button>
                </div>
              )
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            No daily tasks yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyChecklist;

import { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTasks, Task } from '@/hooks/useTasks';

const TaskList = () => {
  const { tasks, addTask, toggleTask, deleteTask, reorderTasks } = useTasks();
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim(), taskDate || undefined);
      setNewTask('');
      setTaskDate('');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderTasks(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-semibold text-foreground">Daily Tasks</h2>
        <span className="text-sm text-muted-foreground">
          {incompleteTasks.length} remaining
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="bg-muted border-border"
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="bg-muted border-border flex-1"
          />
          <Button type="submit" variant="warm" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {incompleteTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === index}
          />
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Completed</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto opacity-60">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <button onClick={() => toggleTask(task.id)}>
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </button>
                <span className="flex-1 text-sm line-through text-muted-foreground">
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const TaskItem = ({
  task,
  index,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: TaskItemProps) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-move group ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <button onClick={() => onToggle(task.id)}>
        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
      </button>
      <div className="flex-1">
        <span className="text-sm text-foreground">{task.title}</span>
        {task.date && (
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.date}</span>
          </div>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TaskList;

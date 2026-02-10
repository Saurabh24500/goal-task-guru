import { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, Calendar, Edit3, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTasks, Task } from '@/hooks/useTasks';

const TaskList = () => {
  const { tasks, addTask, toggleTask, deleteTask, reorderTasks, editTask } = useTasks();
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAttachments, setNewAttachments] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim(), taskDate || undefined, newDescription || undefined, newAttachments);
      setNewTask('');
      setTaskDate('');
      setNewDescription('');
      setNewAttachments([]);
    }
  };

  const handleNewFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const readers = arr.map((file) => new Promise(resolve => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve({ id: Date.now().toString() + Math.random().toString(36).slice(2), name: file.name, type: file.type, size: file.size, data: fr.result });
      };
      fr.readAsDataURL(file);
    }));
    Promise.all(readers).then((results) => {
      setNewAttachments(prev => [...prev, ...(results as any)]);
    });
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
        <Input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="bg-muted border-border"
        />
        <input type="file" multiple onChange={(e) => handleNewFiles(e.target.files)} className="text-xs text-muted-foreground" />
        {newAttachments.length > 0 && (
          <div className="flex flex-col gap-1 text-xs mt-1">
            {newAttachments.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2">
                <Paperclip className="w-3 h-3" />
                <a href={a.data as string} download={a.name} className="truncate">{a.name}</a>
              </div>
            ))}
          </div>
        )}
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
            onEdit={editTask}
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
  onEdit: (id: string, title: string, date?: string, description?: string, attachments?: any[]) => void;
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
  onEdit,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date || '');
  const [description, setDescription] = useState(task.description || '');
  const [attachments, setAttachments] = useState<any[]>(task.attachments || []);

  const handleSave = () => {
    if (title.trim()) {
      onEdit(task.id, title.trim(), date || undefined, description || undefined, attachments);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDate(task.date || '');
    setDescription(task.description || '');
    setAttachments(task.attachments || []);
    setIsEditing(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const readers = arr.map((file) => new Promise(resolve => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve({ id: Date.now().toString() + Math.random().toString(36).slice(2), name: file.name, type: file.type, size: file.size, data: fr.result });
      };
      fr.readAsDataURL(file);
    }));
    Promise.all(readers).then((results) => {
      setAttachments(prev => [...prev, ...(results as any)]);
    });
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));
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
        {!isEditing ? (
          <>
            <span className="text-sm text-foreground">{task.title}</span>
            {task.date && (
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{task.date}</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[160px]" />
              <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
            </div>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
            {attachments.length > 0 && (
              <div className="flex flex-col gap-1 text-xs mt-1">
                {attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <Paperclip className="w-3 h-3" />
                    <a href={a.data as string} download={a.name} className="truncate">{a.name}</a>
                    <button onClick={() => removeAttachment(a.id)} className="text-muted-foreground ml-2">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
      {!isEditing ? (
        <button onClick={() => setIsEditing(true)} className="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 className="w-4 h-4" />
        </button>
      ) : (
        <div className="ml-2 flex gap-2 opacity-100">
          <button onClick={handleSave} className="text-secondary">
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;

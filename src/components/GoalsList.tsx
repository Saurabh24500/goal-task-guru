import { useState } from 'react';
import { Plus, Trash2, GripVertical, Target, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoals, Goal } from '@/hooks/useTasks';

const GoalsList = () => {
  const { goals, addGoal, toggleGoal, deleteGoal, reorderGoals } = useGoals();
  const [newGoal, setNewGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(newGoal.trim(), deadline || undefined);
      setNewGoal('');
      setDeadline('');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderGoals(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const incompleteGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 gradient-cool rounded-lg">
          <Target className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">Long-term Goals</h2>
          <p className="text-sm text-muted-foreground">{incompleteGoals.length} goals in progress</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <Input
          type="text"
          placeholder="Add a new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="bg-muted border-border"
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="bg-muted border-border flex-1"
            placeholder="Set deadline"
          />
          <Button type="submit" variant="cool" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {incompleteGoals.map((goal, index) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            index={index}
            onToggle={toggleGoal}
            onDelete={deleteGoal}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === index}
          />
        ))}
        
        {incompleteGoals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No goals yet. Dream big!</p>
          </div>
        )}
      </div>

      {completedGoals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">🎉 Achieved</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10"
              >
                <button onClick={() => toggleGoal(goal.id)}>
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </button>
                <span className="flex-1 text-sm line-through text-muted-foreground">
                  {goal.title}
                </span>
                <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
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

interface GoalItemProps {
  goal: Goal;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const GoalItem = ({
  goal,
  index,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: GoalItemProps) => {
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all cursor-move group ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      <button onClick={() => onToggle(goal.id)} className="mt-0.5">
        <Circle className="w-5 h-5 text-secondary hover:text-secondary/80" />
      </button>
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{goal.title}</span>
        {goal.deadline && (
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {goal.deadline}
              <span className={`ml-2 ${getDaysRemaining(goal.deadline) < 7 ? 'text-accent' : 'text-secondary'}`}>
                ({getDaysRemaining(goal.deadline)} days left)
              </span>
            </span>
          </div>
        )}
      </div>
      <button onClick={() => onDelete(goal.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default GoalsList;

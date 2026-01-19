import { useState, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
  order: number;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
  order: number;
}

const TASKS_KEY = 'productivity_tasks';
const GOALS_KEY = 'productivity_goals';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, date?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      date,
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTasks(result.map((t, i) => ({ ...t, order: i })));
  };

  return { tasks, addTask, toggleTask, deleteTask, reorderTasks };
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(GOALS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = (title: string, deadline?: string) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      completed: false,
      deadline,
      order: goals.length,
    };
    setGoals([...goals, newGoal]);
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const reorderGoals = (startIndex: number, endIndex: number) => {
    const result = Array.from(goals);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setGoals(result.map((g, i) => ({ ...g, order: i })));
  };

  return { goals, addGoal, toggleGoal, deleteGoal, reorderGoals };
};

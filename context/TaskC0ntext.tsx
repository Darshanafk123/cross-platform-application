// context/TaskC0ntext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Task, TaskStatus } from "../types/Task";
import { saveTasks, loadTasks } from "../storage/taskStorage";

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, assignedTo: string) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
}

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  addTask: () => {},
  moveTask: () => {},
  deleteTask: () => {},
});

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks().then(setTasks);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(title: string, assignedTo: string) {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      assignedTo,
      status: "todo",
    };
    setTasks(prev => [...prev, newTask]);
  }

  function moveTask(taskId: string, status: TaskStatus) {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status }
          : task
      )
    );
  }

  function deleteTask(taskId: string) {
    setTasks(prev =>
      prev.filter(task => task.id !== taskId)
    );
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, moveTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}
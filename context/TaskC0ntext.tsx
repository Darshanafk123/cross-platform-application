import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { Task, TaskStatus } from "../types/Task";
import { saveTasks, loadTasks, deleteTaskById } from "../storage/taskStorage";
import { AuthContext } from "./AuthContext";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";

export const TaskContext = createContext<any>(null);

export function TaskProvider({ children }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { teamId } = useContext(AuthContext);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    if (!teamId) return;

    async function fetchTasks() {
      const loaded = await loadTasks(teamId);
      setTasks(loaded);
    }

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [teamId]);

  async function addTask(title: string, assignedTo: string) {
    if (!teamId) return;

    const newTask: Task = {
      id: uuidv4(),
      title,
      status: "todo",
      assignedTo,
    };

    const updated = [...tasksRef.current, newTask];
    setTasks(updated);
    await saveTasks(updated, teamId);

    // 👇 Send push notification to assigned user
    const { error } = await supabase.functions.invoke("send-task-notification", {
      body: {
        taskTitle: title,
        assignedTo,
        teamId,
      },
    });

    if (error) {
      console.log("Notification error:", error);
    } else {
      console.log("Notification triggered for:", assignedTo);
    }
  }

  async function moveTask(id: string, newStatus: TaskStatus) {
    if (!teamId) return;
    const updated = tasksRef.current.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
    await saveTasks(updated, teamId);
  }

  async function deleteTask(id: string) {
    const updated = tasksRef.current.filter(t => t.id !== id);
    setTasks(updated);
    await deleteTaskById(id);
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, moveTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}
// storage/taskStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/Task";

const STORAGE_KEY = "JIRA_LITE_TASKS";

export async function saveTasks(tasks: Task[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log("Error saving tasks", e);
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    console.log("Raw storage:", data);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("Error loading tasks", e);
    return [];
  }
}
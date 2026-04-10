import { supabase } from "../lib/supabase";
import { Task } from "../types/Task";

export async function saveTasks(tasks: Task[], teamId: string) {
  const rows = tasks.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    assigned_to: t.assignedTo,
    team_id: teamId,
  }));

  const { error } = await supabase.from("tasks").upsert(rows);
  if (error) console.log("Error saving tasks:", error);
}

export async function loadTasks(teamId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("team_id", teamId);

  if (error || !data) return [];

  return data.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status as any,
    assignedTo: t.assigned_to,
  }));
}

export async function deleteTaskById(id: string) {
  await supabase.from("tasks").delete().eq("id", id);
}
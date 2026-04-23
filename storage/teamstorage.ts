import { supabase } from "../lib/supabase";

export async function saveTeam(team: any, adminProfileId: string) {
  // 1. Create new team — no longer deletes old ones
  const { data: newTeam, error } = await supabase
    .from("teams")
    .insert({
      team_name: team.teamName,
      team_code: team.teamCode,
      admin_id: adminProfileId, // 👈 real profile id now
    })
    .select()
    .single();

  if (error) { console.log("Error saving team:", error); return null; }

  return newTeam;
}

export async function loadTeamByCredentials(teamName: string, teamCode: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .eq("team_name", teamName)
    .eq("team_code", teamCode)
    .single();

  if (error || !data) return null;

  return {
    teamId: data.id,
    teamName: data.team_name,
    teamCode: data.team_code,
    adminId: data.admin_id,
    users: data.team_members.map((m: any) => ({ id: m.id, name: m.name })),
  };
}

export async function loadTeam() {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    teamId: data.id,
    teamName: data.team_name,
    teamCode: data.team_code,
    adminId: data.admin_id,
    users: data.team_members.map((m: any) => ({ id: m.id, name: m.name })),
  };
}
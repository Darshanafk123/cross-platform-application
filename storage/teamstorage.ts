import { supabase } from "../lib/supabase";

// Delete all old data and create a new team
export async function saveTeam(team: any) {
  // 1. Delete all old teams (cascades to members + tasks)
  await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Create new team
  const { data: newTeam, error } = await supabase
    .from("teams")
    .insert({
      team_name: team.teamName,
      team_code: team.teamCode,
      admin_id: team.adminId,
    })
    .select()
    .single();

  if (error) { console.log("Error saving team:", error); return null; }

  // 3. Insert members
  const members = team.users.map((u: any) => ({
    id: u.id,
    name: u.name,
    team_id: newTeam.id,
  }));

  await supabase.from("team_members").insert(members);

  return newTeam;
}

// Load team by name + code (for user login)
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

// Load the single existing team (for admin)
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
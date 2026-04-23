import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { taskTitle, assignedTo, teamId } = await req.json();

    console.log("Notification request:", { taskTitle, assignedTo, teamId });

    // Create supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the team member's profile_id
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("profile_id")
      .eq("id", assignedTo)
      .single();

    if (memberError || !member) {
      console.log("Member not found:", memberError);
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Found member profile_id:", member.profile_id);

    // Get the user's push token
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("push_token, username")
      .eq("id", member.profile_id)
      .single();

    if (profileError || !profile?.push_token) {
      console.log("No push token found for user");
      return new Response(JSON.stringify({ error: "No push token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Sending notification to:", profile.username);

    // Send push notification via Expo
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: profile.push_token,
        title: "New Task Assigned 📋",
        body: taskTitle,
        data: { teamId },
      }),
    });

    const result = await response.json();
    console.log("Expo push result:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.log("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
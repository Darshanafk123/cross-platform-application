import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [role, setRoleState] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamId, setTeamIdState] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null); // supabase profile
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load session + role on app start
  useEffect(() => {
    async function loadSession() {
      // 1. Check if supabase has an active session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 2. Fetch their profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) setProfile(profileData);
      }

      // 3. Restore role + teamId from AsyncStorage
      const storedRole = await AsyncStorage.getItem("ROLE");
      const storedTeamId = await AsyncStorage.getItem("TEAM_ID");
      const storedUser = await AsyncStorage.getItem("CURRENT_USER");

      if (storedRole) setRoleState(storedRole as any);
      if (storedTeamId) setTeamIdState(storedTeamId);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      setSessionLoaded(true);
    }

    loadSession();
  }, []);

  async function setRole(newRole: "admin" | "user") {
    setRoleState(newRole);
    await AsyncStorage.setItem("ROLE", newRole);
  }

  async function setTeamId(id: string) {
    setTeamIdState(id);
    await AsyncStorage.setItem("TEAM_ID", id);
  }

  async function saveCurrentUser(user: any) {
    setCurrentUser(user);
    await AsyncStorage.setItem("CURRENT_USER", JSON.stringify(user));
  }

  async function logout() {
    await supabase.auth.signOut();
    setRoleState(null);
    setCurrentUser(null);
    setTeamIdState(null);
    setProfile(null);
    await AsyncStorage.multiRemove(["ROLE", "TEAM_ID", "CURRENT_USER"]);
  }

  return (
    <AuthContext.Provider value={{
      role, setRole,
      currentUser, setCurrentUser: saveCurrentUser,
      teamId, setTeamId,
      profile, setProfile,
      sessionLoaded,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
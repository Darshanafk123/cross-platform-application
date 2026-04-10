import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [role, setRoleState] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamId, setTeamId] = useState<string | null>(null); // 👈 new
  

  useEffect(() => {
    async function load() {
      const storedRole = await AsyncStorage.getItem("ROLE");
      const storedTeamId = await AsyncStorage.getItem("TEAM_ID");
      const storedUser = await AsyncStorage.getItem("CURRENT_USER");
      if (storedRole) setRoleState(storedRole as any);
      if (storedTeamId) setTeamId(storedTeamId);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }
    load();
  }, []);

  async function setRole(newRole: "admin" | "user") {
    setRoleState(newRole);
    await AsyncStorage.setItem("ROLE", newRole);
  }

  async function saveTeamId(id: string) {
    setTeamId(id);
    await AsyncStorage.setItem("TEAM_ID", id);
  }

  async function saveCurrentUser(user: any) {
    setCurrentUser(user);
    await AsyncStorage.setItem("CURRENT_USER", JSON.stringify(user));
  }

  async function logout() {
    setRoleState(null);
    setCurrentUser(null);
    setTeamId(null);
    await AsyncStorage.multiRemove(["ROLE", "TEAM_ID", "CURRENT_USER"]);
  }

  return (
    <AuthContext.Provider value={{
      role, setRole,
      currentUser, setCurrentUser: saveCurrentUser,
      teamId, setTeamId: saveTeamId,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [role, setRoleState] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Load role from AsyncStorage when app starts
  useEffect(() => {
    async function loadRole() {
      try {
        const storedRole = await AsyncStorage.getItem("ROLE");
        if (storedRole) {
          setRoleState(storedRole as "admin" | "user");
        }
      } catch (e) {
        console.log("Error loading role:", e);
      }
    }

    loadRole();
  }, []);

  // ✅ Custom setter to also save role
  async function setRole(newRole: "admin" | "user") {
    try {
      setRoleState(newRole);
      await AsyncStorage.setItem("ROLE", newRole);
    } catch (e) {
      console.log("Error saving role:", e);
    }
  }

  return (
    <AuthContext.Provider
      value={{ role, setRole, currentUser, setCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
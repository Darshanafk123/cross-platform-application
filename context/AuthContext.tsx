import React, { createContext, useState } from "react";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  return (
    <AuthContext.Provider value={{ role, setRole, currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskC0ntext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Stack />
      </TaskProvider>
    </AuthProvider>
  );
}
// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskC0ntext";
import "react-native-get-random-values";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Stack />
      </TaskProvider>
    </AuthProvider>
  );
}
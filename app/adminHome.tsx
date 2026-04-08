// app/adminHome.tsx
import { View, Button } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminHome() {
  const router = useRouter();
  const { role } = useContext(AuthContext);

  // Ensure user is admin
  useEffect(() => {
    if (role && role !== "admin") {
      router.replace("/login");
    }
  }, [role]);

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Create Team"
        onPress={() => router.push("/createTeam")}
      />

      <Button
        title="Enter Existing Team"
        onPress={() => router.push("/enterTeam")}
      />
    </View>
  );
}
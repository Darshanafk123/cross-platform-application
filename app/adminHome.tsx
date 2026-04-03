import { View, Button } from "react-native";
import { useRouter } from "expo-router";

export default function AdminHome() {
  const router = useRouter();

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
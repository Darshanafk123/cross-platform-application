import React, { useState, useContext } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { loadTeam } from "../storage/teamstorage";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function UserLogin() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [userId, setUserId] = useState("");

  const { setCurrentUser } = useContext(AuthContext);
  const router = useRouter();

  async function handleLogin() {
    const team = await loadTeam();

    if (!team) {
      Alert.alert("No team found");
      return;
    }

    // Validate team
    if (team.teamName !== teamName || team.teamCode !== teamCode) {
      Alert.alert("Invalid team details");
      return;
    }

    // Find user
    const user = team.users.find((u: any) => u.id === userId);

    if (!user) {
      Alert.alert("User not found");
      return;
    }

    // Save logged-in user
    setCurrentUser(user);

    Alert.alert("Login successful");

    router.push("/userBoard");
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />

      <TextInput
        placeholder="Team Code"
        value={teamCode}
        onChangeText={setTeamCode}
        style={styles.input}
      />

      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});
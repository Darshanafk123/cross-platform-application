// app/enterTeam.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { loadTeam } from "../storage/teamstorage";
import { useRouter } from "expo-router";

export default function EnterTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");

  const router = useRouter();

  async function handleEnterTeam() {
    const team = await loadTeam();

    if (!team) {
      Alert.alert("No team found");
      return;
    }

    if (team.teamName !== teamName || team.teamCode !== teamCode) {
      Alert.alert("Invalid team details");
      return;
    }

    Alert.alert("Access Granted");

    router.push("/adminBoard"); // or your board screen
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

      <Button title="Enter Team" onPress={handleEnterTeam} />
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
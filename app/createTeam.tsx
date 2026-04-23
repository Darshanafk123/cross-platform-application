import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert,
} from "react-native";
import { saveTeam } from "../storage/teamstorage";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTeamId, profile } = useContext(AuthContext);

  async function handleCreateTeam() {
    if (!teamName || !teamCode) {
      Alert.alert("Please enter team name and team code");
      return;
    }

    setLoading(true);

    const newTeam = await saveTeam(
      { teamName, teamCode },
      profile.id  // 👈 pass real admin profile id
    );

    setLoading(false);

    if (!newTeam) {
      Alert.alert("Failed to create team");
      return;
    }

    await setTeamId(newTeam.id);
    Alert.alert("Team Created!", `Code: ${teamCode}`);
    router.push("/adminBoard");
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Team</Text>
      <Text style={styles.subtitle}>
        You can invite members after creating the team
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Team Name"
        placeholderTextColor="#666"
        value={teamName}
        onChangeText={setTeamName}
      />

      <TextInput
        style={styles.input}
        placeholder="Team Code"
        placeholderTextColor="#666"
        value={teamCode}
        onChangeText={setTeamCode}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateTeam}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Create Team</Text>
        }
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#000", padding: 24,
  },
  back: {
    color: "#4a77f2", fontSize: 15, marginTop: 10, marginBottom: 24,
  },
  title: {
    fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: "#666", marginBottom: 32,
  },
  input: {
    backgroundColor: "#111", color: "#fff",
    borderWidth: 1, borderColor: "#333",
    borderRadius: 10, padding: 14,
    marginBottom: 14, fontSize: 15,
  },
  button: {
    backgroundColor: "#4a77f2", borderRadius: 10,
    padding: 15, alignItems: "center", marginTop: 6,
  },
  buttonText: {
    color: "#fff", fontWeight: "bold", fontSize: 16,
  },
});
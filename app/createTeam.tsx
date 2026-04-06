// app/createTeam.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from "react-native";
import { saveTeam } from "../storage/teamstorage";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  function addUser() {
    if (!userName || !userId) return;

    setUsers(prev => [...prev, { name: userName, id: userId }]);
    setUserName("");
    setUserId("");
  }

  async function handleCreateTeam() {
    if (!teamName || !teamCode || users.length === 0) {
      alert("Please enter team name, team code, and add at least one user");
      return;
    }

    const team = {
      teamName,
      teamCode,
      adminId: "admin", // for now static
      users,
    };

    await saveTeam(team);

    console.log("TEAM CREATED:", team);

    alert(`Team Created!\nCode: ${team.teamCode}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Team</Text>

      {/* Team Name */}
      <TextInput
        placeholder="Enter Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />

      {/* Team Code */}
      <TextInput
        placeholder="Enter Team Code"
        value={teamCode}
        onChangeText={setTeamCode}
        style={styles.input}
      />

      {/* Add User */}
      <Text style={styles.subtitle}>Add Team Members</Text>

      <TextInput
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />

      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      <Button title="Add User" onPress={addUser} />

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.userItem}>
            {item.name} ({item.id})
          </Text>
        )}
      />

      {/* Create Team */}
      <Button title="Create Team" onPress={handleCreateTeam} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  userItem: {
    padding: 5,
    backgroundColor: "#eee",
    marginTop: 5,
  },
});
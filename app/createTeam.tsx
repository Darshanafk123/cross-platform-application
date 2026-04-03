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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  // Generate random team code
  function generateTeamCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  function addUser() {
    if (!userName || !userId) return;

    setUsers(prev => [...prev, { name: userName, id: userId }]);
    setUserName("");
    setUserId("");
  }

  async function handleCreateTeam() {
    if (!teamName || users.length === 0) return;

    const team = {
      teamName,
      teamCode: generateTeamCode(),
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
      <Button
      title ="Check Team Data"
      onPress ={async () => {
        const data = await AsyncStorage.getItem("JIRA_LITE_TEAM");
        console.log("STORAGE DIRECT:", data);
       }  
      }
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
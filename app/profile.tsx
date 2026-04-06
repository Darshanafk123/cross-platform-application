import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";
import { loadTeam } from "../storage/teamstorage";
import Navbar from "../components/Navbar";
import { Stack } from "expo-router";
import { Team } from "../types/Team";

export default function Profile() {
  const { role, currentUser } = useContext(AuthContext);
  const { tasks } = useContext(TaskContext);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const loadedTeam = await loadTeam();
      setTeam(loadedTeam);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4a77f2" />
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No team data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const assignedTasks = role === "user"
    ? tasks.filter(task => task.assignedTo === currentUser?.id)
    : tasks.filter(task => team.users.some(user => user.id === task.assignedTo));

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: role === "admin" ? "Admin Profile" : `${currentUser?.name || "My"} Profile`,
        }}
      />
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          <Text style={styles.infoText}>Team Name: {team.teamName}</Text>
          <Text style={styles.infoText}>Team Code: {team.teamCode}</Text>
        </View>

        {role === "user" ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Profile</Text>
          <Text style={styles.infoText}>Name: {currentUser?.name || "Unknown"}</Text>
          <Text style={styles.infoText}>ID: {currentUser?.id || "Unknown"}</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <FlatList
            data={team.users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                <Text style={styles.memberText}>{item.name}</Text>
                <Text style={styles.memberSubText}>{item.id}</Text>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Tasks</Text>
        {assignedTasks.length > 0 ? (
          <FlatList
            data={assignedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskRow}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSubtitle}>Assigned to: {item.assignedTo}</Text>
                <Text style={styles.taskSubtitle}>Status: {item.status}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  memberRow: {
    marginBottom: 12,
  },
  memberText: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberSubText: {
    fontSize: 14,
    color: "#555",
  },
  taskRow: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  taskSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
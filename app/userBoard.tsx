// app/userBoard.tsx
import React, { useContext } from "react";
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Column from "../components/Column";
import Navbar from "../components/Navbar";
import { Stack, useRouter } from "expo-router";

import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function UserBoard() {
  const { tasks } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  // ✅ Only this user's tasks
  const myTasks = tasks.filter(
    (t) => t.assignedTo === currentUser?.id
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options = {{ title: `Welcome ${currentUser?.name || "User"} 👋` }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <Navbar />

      <View style={styles.row}>
        <Column
          title="Todo"
          status="todo"
          tasks={myTasks.filter(t => t.status === "todo")}
        />

        <Column
          title="In Process"
          status="inprocess"
          tasks={myTasks.filter(t => t.status === "inprocess")}
        />
      </View>

      <View style={styles.row}>
        <Column
          title="Review"
          status="review"
          tasks={myTasks.filter(t => t.status === "review")}
        />

        <Column
          title="Completed"
          status="completed"
          tasks={myTasks.filter(t => t.status === "completed")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#000",
  },
  backText: {
    color: "#fff",
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    gap: 10,
    padding: 10,
  },
});
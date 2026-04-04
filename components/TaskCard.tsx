import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "../types/Task";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function TaskCard({ task }: { task: Task }) {
  const { moveTask, deleteTask } = useContext(TaskContext);
  const { role } = useContext(AuthContext) || {};
  console.log("ROLE:", role);

  const flow = ["todo", "inprocess", "review", "completed"];

  function moveForward() {
    const currentIndex = flow.indexOf(task.status);
    if (currentIndex < flow.length - 1) {
      moveTask(task.id, flow[currentIndex + 1]);
    }
  }

  function moveBackward() {
    const currentIndex = flow.indexOf(task.status);
    if (currentIndex > 0) {
      moveTask(task.id, flow[currentIndex - 1]);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.text}>{task.title}</Text>

      <View style={styles.actions}>
        
        {/* 👤 USER → can move */}
        {role === "user" && (
          <>
            <TouchableOpacity onPress={moveBackward}>
              <Text style={styles.icon}>⬅️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={moveForward}>
              <Text style={styles.icon}>➡️</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 👨‍💼 ADMIN → can delete */}
        {role === "admin" && (
          <TouchableOpacity onPress={() => deleteTask(task.id)}>
            <Text style={styles.icon}>❌</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  icon: {
    fontSize: 18,
  },
});
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "../types/Task";
import { TaskContext } from "../context/TaskC0ntext";

export default function TaskCard({ task }: { task: Task }) {
  const { deleteTask } = useContext(TaskContext);

  return (
    <View style={styles.card}>
      <Text style={styles.text}>{task.title}</Text>

      <TouchableOpacity onPress={() => deleteTask(task.id)}>
        <Text style={styles.delete}>❌</Text>
      </TouchableOpacity>
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
  },
  text: {
    fontSize: 16,
  },
  delete: {
    fontSize: 16,
  },
});
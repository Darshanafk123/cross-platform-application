import React, { useContext } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import Column from "../components/Column";
import Navbar from "../components/Navbar";

import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function UserBoard() {
  const { tasks } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);

  // ✅ Only this user's tasks
  const myTasks = tasks.filter(
    (t) => t.assignedTo === currentUser?.id
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
  row: {
    flexDirection: "row",
    flex: 1,
    gap: 10,
    padding: 10,
  },
});
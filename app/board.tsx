// app/board.tsx
import React, { useContext, useState } from "react";
import { View, StyleSheet, Button, SafeAreaView } from "react-native";

import Navbar from "../components/Navbar";
import Column from "../components/Column";
import AddTaskModal from "../components/AddTaskModal";
import { TaskContext } from "../context/TaskC0ntext";
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flex: 1,
    gap: 10,
    padding: 10,
  },
});



function Board() {
  const { tasks } = useContext(TaskContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navbar />

      <Button title="Add Task" onPress={() => setModalVisible(true)} />

      <View style={styles.row}>
        <Column
          title="Todo"
          status="todo"
          tasks={tasks.filter(t => t.status === "todo")}
        />

        <Column
          title="In Process"
          status="inprocess"
          tasks={tasks.filter(t => t.status === "inprocess")}
        />
      </View>

      <View style={styles.row}>
        <Column
          title="Review"
          status="review"
          tasks={tasks.filter(t => t.status === "review")}
        />

        <Column
          title="Completed"
          status="completed"
          tasks={tasks.filter(t => t.status === "completed")}
        />
      </View>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
export default Board;
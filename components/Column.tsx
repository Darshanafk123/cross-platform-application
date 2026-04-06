// components/Column.tsx
import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import TaskCard from "./TaskCard";
import { Task, TaskStatus } from "../types/Task";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

interface Props {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export default function Column({ title, status, tasks }: Props) {
  const { moveTask } = useContext(TaskContext);
  const { currentUser, role } = useContext(AuthContext);

  return (
    <View style={styles.column}>
      <Text style={styles.title}>{title}</Text>

      <DraggableFlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item, drag }) => {
          const isOwner = item.assignedTo === currentUser?.id;
          return (
            <View
              onTouchStart={isOwner || role === "admin" ? drag : undefined}
              style={{ opacity: isOwner || role === "admin" ? 1 : 0.5 }}
            >
              <TaskCard task={item} />
            </View>
          );
        }}
        onDragEnd={({ data }) => {
          data.forEach(task => {
            moveTask(task.id, status);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
});
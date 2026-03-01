import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import TaskCard from "./TaskCard";
import { Task, TaskStatus } from "../types/Task";
import { TaskContext } from "../context/TaskC0ntext";

interface Props {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export default function Column({ title, status, tasks }: Props) {
  const { moveTask } = useContext(TaskContext);

  return (
    <View style={styles.column}>
      <Text style={styles.title}>{title}</Text>

      <DraggableFlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item, drag }) => (
          <View onTouchStart={drag}>
            <TaskCard task={item} />
          </View>
        )}
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
    backgroundColor: "#f1f3f5",
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
  },
});
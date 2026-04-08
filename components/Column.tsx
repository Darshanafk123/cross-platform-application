// components/Column.tsx
import React, { useContext, useRef } from "react";
import { View, Text, StyleSheet, Animated, ScrollView, Dimensions } from "react-native";
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
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const maxHeight = Dimensions.get("window").height * 0.35; // Each column gets 35% of screen height

  return (
    <View style={styles.column}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{tasks.length} tasks</Text>

      <View style={[styles.scrollContainer, { maxHeight }]}>
        <Animated.ScrollView
          scrollEnabled={true}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
            { useNativeDriver: false }
          )}
          showsVerticalScrollIndicator={true}
          scrollIndicatorInsets={{ right: -8 }}
          style={styles.scrollView}
        >
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
            scrollEnabled={false}
          />
        </Animated.ScrollView>
      </View>
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
    marginBottom: 5,
    color: "#fff",
    fontSize: 16,
  },
  count: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  scrollContainer: {
    backgroundColor: "#0a0a0a",
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
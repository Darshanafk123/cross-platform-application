// app/index.tsx
import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  SafeAreaView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Navbar from "../components/Navbar";
import Column from "../components/Column";
import AddTaskModal from "../components/AddTaskModal";
import { TaskProvider, TaskContext } from "../context/TaskC0ntext";
import Login from "./login";



export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Login />
    </GestureHandlerRootView>
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
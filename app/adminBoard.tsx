import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TaskProvider } from "../context/TaskC0ntext";
import Board from "./board"; // 👈 your existing board file

export default function AdminBoard() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <Board />
      </TaskProvider>
    </GestureHandlerRootView>
  );
}
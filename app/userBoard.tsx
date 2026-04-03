import { useContext } from "react";
import { View, Text } from "react-native";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function UserBoard() {
  const { tasks } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);

  const myTasks = tasks.filter(
    (t) => t.assignedTo === currentUser?.id
  );

  return (
    <View>
      {myTasks.map((task) => (
        <Text key={task.id}>
          {task.title} - {task.status}
        </Text>
      ))}
    </View>
  );
}
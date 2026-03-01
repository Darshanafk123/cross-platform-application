import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { TaskContext } from "../context/TaskC0ntext";

export default function AddTaskModal({ visible, onClose }: any) {
  const [title, setTitle] = useState("");
  const { addTask } = useContext(TaskContext);

  function handleAdd() {
    if (!title) return;
    addTask(title);
    setTitle("");
    onClose();
  }

  return (
    <Modal visible={visible} transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <TextInput
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Button title="Add" onPress={handleAdd} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },
  modal: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
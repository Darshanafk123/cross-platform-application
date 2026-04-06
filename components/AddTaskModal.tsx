// components/AddTaskModal.tsx
import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
} from "react-native";
import { TaskContext } from "../context/TaskC0ntext";
import { Picker } from "@react-native-picker/picker";
import { loadTeam } from "../storage/teamstorage";

export default function AddTaskModal({ visible, onClose }: any) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const PickerAny = Picker as any;

  const { addTask } = useContext(TaskContext);

  // ✅ Load team users
  useEffect(() => {
    async function fetchUsers() {
      const team = await loadTeam();
      if (team?.users) {
        setUsers(team.users);
      }
    }
    fetchUsers();
  }, []);

  function handleAdd() {
    if (!title || !assignedTo) return;

    addTask(title, assignedTo);

    setTitle("");
    setAssignedTo("");

    onClose();
  }

  return (
    <Modal visible={visible} transparent>
      <View style={styles.container}>
        <View style={styles.modal}>

          {/* Task Title */}
          <TextInput
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            style={{marginBottom: 10}}
          />

          {/* 👇 Dropdown for users */}
          <Text>Select User</Text>
          <PickerAny
            selectedValue={assignedTo}
            onValueChange={(itemValue: string) => setAssignedTo(itemValue)}
            style={styles.input}
          >
            <PickerAny.Item label="Select a user" value="" />

            {users.map((u) => (
              <PickerAny.Item
                key={u.id}
                label={`${u.name} (${u.id})`}
                value={u.id}
              />
            ))}
          </PickerAny>

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
# Jira Lite - Complete Project Code

---

## lib/supabase.ts
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://YOUR_PROJECT_ID.supabase.co", // 👈 your URL
  "YOUR_ANON_KEY"                         // 👈 your anon key
);
```

---

## types/Task.ts
```typescript
export type TaskStatus =
  | "todo"
  | "inprocess"
  | "completed"
  | "review";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
}
```

---

## types/Team.ts
```typescript
export interface User {
  id: string;
  name: string;
}

export interface Team {
  teamName: string;
  teamCode: string;
  adminId: string;
  users: User[];
}
```

---

## storage/teamStorage.ts
```typescript
import { supabase } from "../lib/supabase";

// Delete all old data and create a new team
export async function saveTeam(team: any) {
  // 1. Delete all old teams (cascades to members + tasks)
  await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Create new team
  const { data: newTeam, error } = await supabase
    .from("teams")
    .insert({
      team_name: team.teamName,
      team_code: team.teamCode,
      admin_id: team.adminId,
    })
    .select()
    .single();

  if (error) { console.log("Error saving team:", error); return null; }

  // 3. Insert members
  const members = team.users.map((u: any) => ({
    id: u.id,
    name: u.name,
    team_id: newTeam.id,
  }));

  await supabase.from("team_members").insert(members);

  return newTeam;
}

// Load team by name + code (for user login)
export async function loadTeamByCredentials(teamName: string, teamCode: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .eq("team_name", teamName)
    .eq("team_code", teamCode)
    .single();

  if (error || !data) return null;

  return {
    teamId: data.id,
    teamName: data.team_name,
    teamCode: data.team_code,
    adminId: data.admin_id,
    users: data.team_members.map((m: any) => ({ id: m.id, name: m.name })),
  };
}

// Load the single existing team (for admin)
export async function loadTeam() {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    teamId: data.id,
    teamName: data.team_name,
    teamCode: data.team_code,
    adminId: data.admin_id,
    users: data.team_members.map((m: any) => ({ id: m.id, name: m.name })),
  };
}
```

---

## storage/taskStorage.ts
```typescript
import { supabase } from "../lib/supabase";
import { Task } from "../types/Task";

export async function saveTasks(tasks: Task[], teamId: string) {
  const rows = tasks.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    assigned_to: t.assignedTo,
    team_id: teamId,
  }));

  const { error } = await supabase.from("tasks").upsert(rows);
  if (error) console.log("Error saving tasks:", error);
}

export async function loadTasks(teamId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("team_id", teamId);

  if (error || !data) return [];

  return data.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status as any,
    assignedTo: t.assigned_to,
  }));
}

export async function deleteTaskById(id: string) {
  await supabase.from("tasks").delete().eq("id", id);
}
```

---

## context/AuthContext.tsx
```typescript
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [role, setRoleState] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const storedRole = await AsyncStorage.getItem("ROLE");
      const storedTeamId = await AsyncStorage.getItem("TEAM_ID");
      const storedUser = await AsyncStorage.getItem("CURRENT_USER");
      if (storedRole) setRoleState(storedRole as any);
      if (storedTeamId) setTeamId(storedTeamId);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }
    load();
  }, []);

  async function setRole(newRole: "admin" | "user") {
    setRoleState(newRole);
    await AsyncStorage.setItem("ROLE", newRole);
  }

  async function saveTeamId(id: string) {
    setTeamId(id);
    await AsyncStorage.setItem("TEAM_ID", id);
  }

  async function saveCurrentUser(user: any) {
    setCurrentUser(user);
    await AsyncStorage.setItem("CURRENT_USER", JSON.stringify(user));
  }

  async function logout() {
    setRoleState(null);
    setCurrentUser(null);
    setTeamId(null);
    await AsyncStorage.multiRemove(["ROLE", "TEAM_ID", "CURRENT_USER"]);
  }

  return (
    <AuthContext.Provider value={{
      role, setRole,
      currentUser, setCurrentUser: saveCurrentUser,
      teamId, setTeamId: saveTeamId,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## context/TaskContext.tsx
```typescript
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { Task, TaskStatus } from "../types/Task";
import { saveTasks, loadTasks, deleteTaskById } from "../storage/taskStorage";
import { AuthContext } from "./AuthContext";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export const TaskContext = createContext<any>(null);

export function TaskProvider({ children }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { teamId } = useContext(AuthContext);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Load + poll every 3 seconds
  useEffect(() => {
    if (!teamId) return;

    async function fetchTasks() {
      const loaded = await loadTasks(teamId);
      setTasks(loaded);
    }

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [teamId]);

  async function addTask(title: string, assignedTo: string) {
    if (!teamId) return;
    const newTask: Task = {
      id: uuidv4(),
      title,
      status: "todo",
      assignedTo,
    };
    const updated = [...tasksRef.current, newTask];
    setTasks(updated);
    await saveTasks(updated, teamId);
  }

  async function moveTask(id: string, newStatus: TaskStatus) {
    if (!teamId) return;
    const updated = tasksRef.current.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
    await saveTasks(updated, teamId);
  }

  async function deleteTask(id: string) {
    const updated = tasksRef.current.filter(t => t.id !== id);
    setTasks(updated);
    await deleteTaskById(id);
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, moveTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}
```

---

## app/_layout.tsx
```typescript
import "react-native-get-random-values";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskC0ntext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Stack />
      </TaskProvider>
    </AuthProvider>
  );
}
```

---

## app/index.tsx
```typescript
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Login from "./login";

export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Login />
    </GestureHandlerRootView>
  );
}
```

---

## app/login.tsx
```typescript
import { View, Button } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function Login() {
  const { setRole } = useContext(AuthContext);
  const router = useRouter();

  return (
    <View>
      <Button
        title="Admin Login"
        onPress={() => {
          setRole("admin");
          router.push("/adminHome");
        }}
      />

      <Button
        title="User Login"
        onPress={() => {
          setRole("user");
          router.push("/user");
        }}
      />
    </View>
  );
}
```

---

## app/adminHome.tsx
```typescript
import { View, Button } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminHome() {
  const router = useRouter();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    if (role && role !== "admin") {
      router.replace("/login");
    }
  }, [role]);

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Create Team"
        onPress={() => router.push("/createTeam")}
      />
      <Button
        title="Enter Existing Team"
        onPress={() => router.push("/enterTeam")}
      />
    </View>
  );
}
```

---

## app/createTeam.tsx
```typescript
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from "react-native";
import { saveTeam } from "../storage/teamstorage";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const { setTeamId } = useContext(AuthContext);

  function addUser() {
    if (!userName || !userId) return;
    setUsers(prev => [...prev, { name: userName, id: userId }]);
    setUserName("");
    setUserId("");
  }

  async function handleCreateTeam() {
    if (!teamName || !teamCode || users.length === 0) {
      alert("Please enter team name, team code, and add at least one user");
      return;
    }

    const team = {
      teamName,
      teamCode,
      adminId: "admin",
      users,
    };

    const newTeam = await saveTeam(team);

    if (!newTeam) {
      alert("Failed to create team");
      return;
    }

    await setTeamId(newTeam.id);
    alert(`Team Created!\nCode: ${team.teamCode}`);
    router.push("/adminBoard");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Team</Text>

      <TextInput
        placeholder="Enter Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />

      <TextInput
        placeholder="Enter Team Code"
        value={teamCode}
        onChangeText={setTeamCode}
        style={styles.input}
      />

      <Text style={styles.subtitle}>Add Team Members</Text>

      <TextInput
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />

      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      <Button title="Add User" onPress={addUser} />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.userItem}>
            {item.name} ({item.id})
          </Text>
        )}
      />

      <Button title="Create Team" onPress={handleCreateTeam} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { marginTop: 10, fontWeight: "bold" },
  input: { borderWidth: 1, padding: 10, borderRadius: 5 },
  userItem: { padding: 5, backgroundColor: "#eee", marginTop: 5 },
});
```

---

## app/enterTeam.tsx
```typescript
import React, { useState, useContext } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { loadTeamByCredentials } from "../storage/teamstorage";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

export default function EnterTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");

  const router = useRouter();
  const { setTeamId } = useContext(AuthContext);

  async function handleEnterTeam() {
    const team = await loadTeamByCredentials(teamName, teamCode);

    if (!team) {
      Alert.alert("Invalid team details");
      return;
    }

    await setTeamId(team.teamId);
    Alert.alert("Access Granted");
    router.push("/adminBoard");
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />
      <TextInput
        placeholder="Team Code"
        value={teamCode}
        onChangeText={setTeamCode}
        style={styles.input}
      />
      <Button title="Enter Team" onPress={handleEnterTeam} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5 },
});
```

---

## app/user.tsx
```typescript
import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput, Button, Alert, StyleSheet } from "react-native";
import { loadTeamByCredentials } from "../storage/teamstorage";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function UserLogin() {
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [userId, setUserId] = useState("");

  const { setCurrentUser, setRole, setTeamId } = useContext(AuthContext);
  const router = useRouter();

  async function handleLogin() {
    const team = await loadTeamByCredentials(teamName, teamCode);

    if (!team) {
      Alert.alert("Invalid team details");
      return;
    }

    const user = team.users.find((u: any) => u.id === userId);

    if (!user) {
      Alert.alert("User not found");
      return;
    }

    await setCurrentUser(user);
    await setRole("user");
    await setTeamId(team.teamId);

    Alert.alert("Login successful");
    router.push("/userBoard");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Team Name"
        placeholderTextColor="#aaa"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />

      <TextInput
        placeholder="Team Code"
        placeholderTextColor="#aaa"
        value={teamCode}
        onChangeText={setTeamCode}
        style={styles.input}
      />

      <TextInput
        placeholder="User ID"
        placeholderTextColor="#aaa"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10, backgroundColor: "#000" },
  input: {
    borderWidth: 1, borderColor: "#444",
    backgroundColor: "#111", color: "#fff",
    padding: 10, borderRadius: 5,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backText: { color: "#fff", fontSize: 18 },
});
```

---

## app/adminBoard.tsx
```typescript
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TaskProvider } from "../context/TaskC0ntext";
import Board from "./board";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function AdminBoard() {
  const { role } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== "admin") {
      router.replace("/login");
    }
  }, [role]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <Board />
      </TaskProvider>
    </GestureHandlerRootView>
  );
}
```

---

## app/board.tsx
```typescript
import React, { useContext, useState } from "react";
import { View, StyleSheet, Button, SafeAreaView } from "react-native";

import Navbar from "../components/Navbar";
import Column from "../components/Column";
import AddTaskModal from "../components/AddTaskModal";
import { TaskContext } from "../context/TaskC0ntext";

function Board() {
  const { tasks } = useContext(TaskContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navbar />
      <Button title="Add Task" onPress={() => setModalVisible(true)} />

      <View style={styles.row}>
        <Column title="Todo" status="todo" tasks={tasks.filter(t => t.status === "todo")} />
        <Column title="In Process" status="inprocess" tasks={tasks.filter(t => t.status === "inprocess")} />
      </View>

      <View style={styles.row}>
        <Column title="Review" status="review" tasks={tasks.filter(t => t.status === "review")} />
        <Column title="Completed" status="completed" tasks={tasks.filter(t => t.status === "completed")} />
      </View>

      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

export default Board;

const styles = StyleSheet.create({
  row: { flexDirection: "row", flex: 1, gap: 10, padding: 10 },
});
```

---

## app/userBoard.tsx
```typescript
import React, { useContext, useEffect } from "react";
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Column from "../components/Column";
import Navbar from "../components/Navbar";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function UserBoard() {
  const { tasks } = useContext(TaskContext);
  const { currentUser, role } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== "user") {
      router.replace("/login");
    }
    if (!currentUser) {
      router.replace("/user");
    }
  }, [role, currentUser]);

  const myTasks = tasks.filter((t) => t.assignedTo === currentUser?.id);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: `Welcome ${currentUser?.name || "User"} 👋` }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Navbar />

        <View style={styles.row}>
          <Column title="Todo" status="todo" tasks={myTasks.filter(t => t.status === "todo")} />
          <Column title="In Process" status="inprocess" tasks={myTasks.filter(t => t.status === "inprocess")} />
        </View>

        <View style={styles.row}>
          <Column title="Review" status="review" tasks={myTasks.filter(t => t.status === "review")} />
          <Column title="Completed" status="completed" tasks={myTasks.filter(t => t.status === "completed")} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: "#000" },
  backText: { color: "#fff", fontSize: 18 },
  row: { flexDirection: "row", flex: 1, gap: 10, padding: 10 },
});
```

---

## app/profile.tsx
```typescript
import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, StyleSheet,
  FlatList, ActivityIndicator, ScrollView,
} from "react-native";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";
import { loadTeam } from "../storage/teamstorage";
import Navbar from "../components/Navbar";
import { Stack } from "expo-router";
import { Team } from "../types/Team";

export default function Profile() {
  const { role, currentUser } = useContext(AuthContext);
  const { tasks } = useContext(TaskContext);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const loadedTeam = await loadTeam();
      setTeam(loadedTeam);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4a77f2" />
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No team data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const assignedTasks = role === "user"
    ? tasks.filter((task: any) => task.assignedTo === currentUser?.id)
    : tasks.filter((task: any) => team.users.some((user: any) => user.id === task.assignedTo));

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: role === "admin" ? "Admin Profile" : `${currentUser?.name || "My"} Profile` }} />
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          <Text style={styles.infoText}>Team Name: {team.teamName}</Text>
          <Text style={styles.infoText}>Team Code: {team.teamCode}</Text>
        </View>

        {role === "user" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Profile</Text>
            <Text style={styles.infoText}>Name: {currentUser?.name || "Unknown"}</Text>
            <Text style={styles.infoText}>ID: {currentUser?.id || "Unknown"}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <FlatList
              data={team.users}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }: any) => (
                <View style={styles.memberRow}>
                  <Text style={styles.memberText}>{item.name}</Text>
                  <Text style={styles.memberSubText}>{item.id}</Text>
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Tasks</Text>
          {assignedTasks.length > 0 ? (
            <FlatList
              data={assignedTasks}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }: any) => (
                <View style={styles.taskRow}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskSubtitle}>Assigned to: {item.assignedTo}</Text>
                  <Text style={styles.taskSubtitle}>Status: {item.status}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No tasks assigned yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  infoText: { fontSize: 16, marginBottom: 4 },
  memberRow: { marginBottom: 12 },
  memberText: { fontSize: 16, fontWeight: "600" },
  memberSubText: { fontSize: 14, color: "#555" },
  taskRow: { marginBottom: 14, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  taskTitle: { fontSize: 16, fontWeight: "600" },
  taskSubtitle: { fontSize: 14, color: "#555" },
  emptyText: { fontSize: 16, color: "#888" },
});
```

---

## components/AddTaskModal.tsx
```typescript
import React, { useState, useContext, useEffect } from "react";
import { Modal, View, TextInput, Button, StyleSheet, Text } from "react-native";
import { TaskContext } from "../context/TaskC0ntext";
import { Picker } from "@react-native-picker/picker";
import { loadTeam } from "../storage/teamstorage";

export default function AddTaskModal({ visible, onClose }: any) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const PickerAny = Picker as any;

  const { addTask } = useContext(TaskContext);

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
          <TextInput
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            style={{ marginBottom: 10 }}
          />
          <Text>Select User</Text>
          <PickerAny
            selectedValue={assignedTo}
            onValueChange={(itemValue: string) => setAssignedTo(itemValue)}
            style={styles.input}
          >
            <PickerAny.Item label="Select a user" value="" />
            {users.map((u) => (
              <PickerAny.Item key={u.id} label={`${u.name} (${u.id})`} value={u.id} />
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
  container: { flex: 1, justifyContent: "center", backgroundColor: "#00000088" },
  modal: { backgroundColor: "white", margin: 20, padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});
```

---

## components/Column.tsx
```typescript
import React, { useContext, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
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
  const maxHeight = Dimensions.get("window").height * 0.35;

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
              data.forEach(task => { moveTask(task.id, status); });
            }}
            scrollEnabled={false}
          />
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { backgroundColor: "#111", padding: 10, borderRadius: 10, flex: 1 },
  title: { fontWeight: "bold", marginBottom: 5, color: "#fff", fontSize: 16 },
  count: { fontSize: 12, color: "#888", marginBottom: 10 },
  scrollContainer: { backgroundColor: "#0a0a0a", borderRadius: 8, overflow: "hidden", flex: 1 },
  scrollView: { flex: 1 },
});
```

---

## components/Navbar.tsx
```typescript
import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>JIRA-LITE</Text>
      </View>

      {menuOpen && (
        <View style={styles.overlay}>
          <View style={styles.drawer}>
            <Text style={styles.menuText}>Menu</Text>
            <TouchableOpacity style={styles.menuButton} onPress={() => { setMenuOpen(false); router.push("/profile"); }}>
              <Text style={styles.menuButtonText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backdrop} onPress={() => setMenuOpen(false)} activeOpacity={1} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbar: { flexDirection: "row", alignItems: "center", backgroundColor: "orange", padding: 15 },
  menuIcon: { fontSize: 22, marginRight: 15 },
  title: { fontSize: 18, fontWeight: "bold", color: "white" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", zIndex: 999 },
  drawer: { width: width * 0.7, maxWidth: 300, height: "100%", backgroundColor: "#4a77f2", padding: 20, elevation: 20 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menuText: { color: "white", fontSize: 18, fontWeight: "bold" },
  menuButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 15, backgroundColor: "#5a9df4", borderRadius: 5, alignItems: "center" },
  menuButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  logoutButton: { marginTop: 15, paddingVertical: 12, paddingHorizontal: 15, backgroundColor: "#ff6b6b", borderRadius: 5, alignItems: "center" },
  logoutButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
```

---

## components/TaskCard.tsx
```typescript
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { Task, TaskStatus } from "../types/Task";
import { TaskContext } from "../context/TaskC0ntext";
import { AuthContext } from "../context/AuthContext";

export default function TaskCard({ task }: { task: Task }) {
  const { moveTask, deleteTask } = useContext(TaskContext);
  const { role } = useContext(AuthContext) || {};
  const [popupVisible, setPopupVisible] = useState(false);

  const flow: TaskStatus[] = ["todo", "inprocess", "review", "completed"];

  function moveForward() {
    const currentIndex = flow.indexOf(task.status);
    if (currentIndex < flow.length - 1) moveTask(task.id, flow[currentIndex + 1]);
  }

  function moveBackward() {
    const currentIndex = flow.indexOf(task.status);
    if (currentIndex > 0) moveTask(task.id, flow[currentIndex - 1]);
  }

  return (
    <>
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setPopupVisible(true)}>
        <Text style={styles.text}>{task.title}</Text>
        <View style={styles.actions}>
          {role === "user" && (
            <>
              <TouchableOpacity onPress={moveBackward}><Text style={styles.icon}>⬅️</Text></TouchableOpacity>
              <TouchableOpacity onPress={moveForward}><Text style={styles.icon}>➡️</Text></TouchableOpacity>
            </>
          )}
          {role === "admin" && (
            <TouchableOpacity onPress={() => deleteTask(task.id)}><Text style={styles.icon}>❌</Text></TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={popupVisible} animationType="fade" transparent onRequestClose={() => setPopupVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPopupVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Task details</Text>
            <Text style={styles.modalLabel}>Name:</Text>
            <Text style={styles.modalText}>{task.title}</Text>
            <Text style={styles.modalLabel}>Assigned to:</Text>
            <Text style={styles.modalText}>{task.assignedTo}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setPopupVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#1e1e1e", padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  text: { fontSize: 16, flex: 1, color: "#fff" },
  actions: { flexDirection: "row", gap: 10 },
  icon: { fontSize: 18, color: "#fff" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", maxWidth: 320, backgroundColor: "#121212", borderRadius: 14, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  modalLabel: { color: "#888", marginBottom: 4 },
  modalText: { color: "#fff", marginBottom: 12, fontSize: 16 },
  closeButton: { marginTop: 10, backgroundColor: "#272727", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  closeText: { color: "#fff", fontWeight: "600" },
});
```

---

## Supabase SQL (run in SQL Editor)
```sql
drop table if exists tasks;
drop table if exists team_members;
drop table if exists teams;

create table teams (
  id uuid default gen_random_uuid() primary key,
  team_name text not null,
  team_code text not null,
  admin_id text not null,
  created_at timestamp default now()
);

create table team_members (
  id text primary key,
  name text not null,
  team_id uuid references teams(id) on delete cascade
);

create table tasks (
  id text primary key,
  title text not null,
  status text default 'todo',
  assigned_to text references team_members(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  created_at timestamp default now()
);
```

---

## README.md
```markdown
# Jira Lite

A cross-platform task management app built with Expo + TypeScript + Supabase.

## Features
- Admin can create a team and assign tasks
- Users can log in and view/move their assigned tasks
- Real-time sync across devices via Supabase polling

## Tech Stack
- Expo (React Native)
- TypeScript
- Supabase (PostgreSQL)
- React Native Gesture Handler

## Getting Started

1. Install dependencies
   npm install

2. Add your Supabase credentials in lib/supabase.ts

3. Start the app
   npx expo start

## Roles
- Admin — creates team, adds members, assigns tasks
- User — logs in with team code and user ID, views and updates their tasks
```

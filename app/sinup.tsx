import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup() {
    if (!email || !username || !password) {
      Alert.alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // Check if username is already taken
    const { data: existingUsers } = await supabase
        .from("users") 
        .select("username")
        .eq("username", username);
    
    if(existingUsers && existingUsers.length > 0) {
        Alert.alert("Username already taken");
        setLoading(false);
        return;
    }
    // Create account
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // passed to the trigger
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Signup failed", error.message);
      return;
    }

    Alert.alert(
      "Account Created!",
      "Please check your email to verify your account, then log in.",
      [{ text: "OK", onPress: () => router.replace("/login") }]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Jira Lite</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Create Account</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#000",
    padding: 24, justifyContent: "center",
  },
  title: {
    fontSize: 28, fontWeight: "bold",
    color: "#fff", marginBottom: 6,
  },
  subtitle: {
    fontSize: 15, color: "#666",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#111", color: "#fff",
    borderWidth: 1, borderColor: "#333",
    borderRadius: 10, padding: 14,
    marginBottom: 14, fontSize: 15,
  },
  button: {
    backgroundColor: "#4a77f2", borderRadius: 10,
    padding: 15, alignItems: "center", marginTop: 6,
  },
  buttonText: {
    color: "#fff", fontWeight: "bold", fontSize: 16,
  },
  link: {
    color: "#4a77f2", textAlign: "center",
    marginTop: 20, fontSize: 14,
  },
});
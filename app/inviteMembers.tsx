import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, FlatList,
} from "react-native";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function InviteMembers() {
  const { teamId, profile } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invitedList, setInvitedList] = useState<any[]>([]);
  const router = useRouter();

  async function handleSearch() {
    if (!searchText.trim()) return;

    setSearching(true);
    setSearchResult(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", searchText.trim())
      .single();

    setSearching(false);

    if (error || !data) {
      Alert.alert("User not found", "No user with that username exists.");
      return;
    }

    if (data.id === profile.id) {
      Alert.alert("That's you!", "You can't invite yourself.");
      return;
    }

    setSearchResult(data);
  }

  async function handleInvite(invitedUser: any) {
    setInviting(true);
    console.log("Step 1: Starting invite for", invitedUser.username);

    // ✅ Fixed: no .single() — use array check instead
    const { data: existingList } = await supabase
      .from("team_invites")
      .select("*")
      .eq("team_id", teamId)
      .eq("invited_profile_id", invitedUser.id);

    if (existingList && existingList.length > 0) {
      Alert.alert("Already invited", "This user has already been invited.");
      setInviting(false);
      return;
    }

    console.log("Step 2: No existing invite found");

    const { data: existingMemberList } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("profile_id", invitedUser.id);

    if (existingMemberList && existingMemberList.length > 0) {
      Alert.alert("Already a member", "This user is already in the team.");
      setInviting(false);
      return;
    }

    console.log("Step 3: Not a member yet, inserting invite");

    // Insert invite
    const { data: newInvite, error } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        invited_profile_id: invitedUser.id,
        invited_email: invitedUser.email,
      })
      .select()
      .single();

    if (error) {
      console.log("Step 3 ERROR:", error);
      Alert.alert("Failed to send invite", error.message);
      setInviting(false);
      return;
    }

    console.log("Step 4: Invite inserted", newInvite);

    // Fetch team name
    const { data: teamData } = await supabase
      .from("teams")
      .select("team_name")
      .eq("id", teamId)
      .single();

    console.log("Step 5: Team data", teamData);

    // Call edge function to send email
    const { error: fnError } = await supabase.functions.invoke("send-invite-email", {
      body: {
        invitedEmail: invitedUser.email,
        invitedUsername: invitedUser.username,
        teamName: teamData?.team_name || "Unknown Team",
        inviteId: newInvite.id,
      },
    });

    console.log("Step 6: Edge function", fnError ? fnError : "success");

    setInviting(false);
    setInvitedList(prev => [...prev, invitedUser]);
    setSearchResult(null);
    setSearchText("");

    Alert.alert("Invite Sent! ✉️", `${invitedUser.username} will receive an email.`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Invite Members</Text>
      <Text style={styles.subtitle}>Search by username to invite someone</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.searchButtonText}>Search</Text>
          }
        </TouchableOpacity>
      </View>

      {searchResult && (
        <View style={styles.resultCard}>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>@{searchResult.username}</Text>
            <Text style={styles.resultEmail}>{searchResult.email}</Text>
            <Text style={styles.resultId}>ID: {searchResult.user_id}</Text>
          </View>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInvite(searchResult)}
            disabled={inviting}
          >
            {inviting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.inviteButtonText}>Invite</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {invitedList.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invited This Session</Text>
          <FlatList
            data={invitedList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.invitedCard}>
                <Text style={styles.invitedIcon}>✉️</Text>
                <View>
                  <Text style={styles.invitedName}>@{item.username}</Text>
                  <Text style={styles.invitedStatus}>Invite sent — pending acceptance</Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#000", padding: 24,
  },
  back: {
    color: "#4a77f2", fontSize: 15, marginTop: 10, marginBottom: 24,
  },
  title: {
    fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: "#666", marginBottom: 24,
  },
  searchRow: {
    flexDirection: "row", gap: 10, marginBottom: 20,
  },
  input: {
    flex: 1, backgroundColor: "#111", color: "#fff",
    borderWidth: 1, borderColor: "#333",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  searchButton: {
    backgroundColor: "#4a77f2", borderRadius: 10,
    paddingHorizontal: 18, justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff", fontWeight: "bold",
  },
  resultCard: {
    backgroundColor: "#1a1a1a", borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: "#4a77f2",
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  resultInfo: { flex: 1 },
  resultName: {
    color: "#fff", fontSize: 16, fontWeight: "bold",
  },
  resultEmail: {
    color: "#666", fontSize: 13, marginTop: 2,
  },
  resultId: {
    color: "#555", fontSize: 12, marginTop: 2,
  },
  inviteButton: {
    backgroundColor: "#4a77f2", borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  inviteButtonText: {
    color: "#fff", fontWeight: "bold",
  },
  sectionTitle: {
    color: "#666", fontSize: 13, fontWeight: "bold",
    marginBottom: 14, textTransform: "uppercase", letterSpacing: 1,
  },
  invitedCard: {
    backgroundColor: "#1a1a1a", borderRadius: 12,
    padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: "#333",
  },
  invitedIcon: { fontSize: 24 },
  invitedName: {
    color: "#fff", fontSize: 15, fontWeight: "bold",
  },
  invitedStatus: {
    color: "#666", fontSize: 13, marginTop: 2,
  },
});
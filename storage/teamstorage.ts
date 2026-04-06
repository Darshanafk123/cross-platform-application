// storage/teamStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const TEAM_KEY = "JIRA_LITE_TEAM";

// ✅ Save Team
export async function saveTeam(team: any) {
  try {
    await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(team));
    console.log("✅ Team saved successfully:", team);
  } catch (e) {
    console.log("❌ Error saving team:", e);
  }
}

// ✅ Load Team (with debug log)
export async function loadTeam() {
  try {
    const data = await AsyncStorage.getItem(TEAM_KEY);

    console.log("📦 Raw team data from storage:", data);

    const parsed = data ? JSON.parse(data) : null;

    console.log("✅ Parsed team object:", parsed);

    return parsed;
  } catch (e) {
    console.log("❌ Error loading team:", e);
    return null;
  }
}

// ✅ Clear Team (for reset/testing)
export async function clearTeam() {
  try {
    await AsyncStorage.removeItem(TEAM_KEY);
    console.log("🗑️ Team cleared from storage");
  } catch (e) {
    console.log("❌ Error clearing team:", e);
  }
}

// ✅ Get ALL AsyncStorage data (for debugging everything)
export async function getAllStorageData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);

    console.log("🧠 FULL STORAGE DATA:", result);

    return result;
  } catch (e) {
    console.log("❌ Error fetching all storage:", e);
  }
}
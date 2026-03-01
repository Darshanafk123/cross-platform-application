import { View, Text, StyleSheet } from "react-native";

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.text}>Jira-Lite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#0d6efd",
    padding: 15,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
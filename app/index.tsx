import { Text, View, TextInput } from "react-native";
import { useState } from "react";

export default function Index() {
  const [input, setInput] = useState("");

  // reverse the string whenever input changes
  const reversed = input.split("").reverse().join("");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <TextInput
        style={{
          width: "80%",
          borderColor: "orange",
          borderWidth: 1,
          padding: 8,
          marginBottom: 16,
        }}
        placeholder="Type something"
        value={input}
        onChangeText={setInput}
      />
      <Text style={{ fontSize: 18 }}>Reversed:</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
        {reversed}
      </Text>
    </View>
  );
}

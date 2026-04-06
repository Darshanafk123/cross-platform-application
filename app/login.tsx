// app/login.tsx
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
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1">
            {/* Background */}
            <Image
              source={require("../assets/images/login.png")}
              className="absolute w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(3,105,161,0.85)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: "absolute", bottom: 0, width, height }}
            />

            {/* Back button */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-20 px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/50 p-2 rounded-full self-start">
                <Feather name="chevron-left" size={28} color="white" />
              </TouchableOpacity>
            </SafeAreaView>

            {/* Content */}
            <View className="flex-1 justify-end px-8 pb-10 z-10">
              {/* Heading */}
              <View className="items-center mb-5">
                <Text
                  className="text-white font-bold text-center"
                  style={{
                    fontSize: width * 0.08,
                    lineHeight: width * 0.095,
                  }}>
                  Welcome back 👋
                </Text>
                <Text
                  className="text-gray-200 font-medium text-center mt-1"
                  style={{ fontSize: width * 0.042 }}>
                  Sign in to explore Bucharest
                </Text>
              </View>

              {/* Inputs */}
              <View className="gap-5 mb-6">
                <TextInput
                  placeholder="Email / Username"
                  placeholderTextColor="#e5e7eb"
                  value={email}
                  onChangeText={setEmail}
                  className="bg-white/20 border border-white/30 rounded-full px-6 py-3 text-white text-base"
                />
                <View className="relative">
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#e5e7eb"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    className="bg-white/20 border border-white/30 rounded-full px-6 py-3 pr-12 text-white text-base"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3">
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#e5e7eb"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const response = await fetch(`${BASE_URL}/login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();
                    if (response.ok) {
                      await AsyncStorage.setItem("token", data.token);
                      await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                      );

                      const user = data.user; // ⬅️ adaugă această linie
                      console.log("👤 USER ROLE:", user.role);

                      if (user.role === "admin") {
                        router.replace("/admin"); // redirecționare admin
                      } else {
                        router.replace("/home"); // pagina standard pentru utilizatori
                      }
                    } else {
                      alert(data.error || "Autentificare eșuată");
                    }
                  } catch {
                    alert("Eroare la autentificare");
                  }
                }}
                className="bg-white py-3 rounded-full shadow-md"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                <Text
                  className="text-center font-bold"
                  style={{ color: "#0284c7", fontSize: width * 0.052 }}>
                  Log In
                </Text>
              </TouchableOpacity>

              {/* <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 32,
                  marginTop: 20,
                }}>
                <TouchableOpacity onPress={() => alert("Continue with Google")}>
                  <Image
                    source={require("../assets/images/icons/google.png")}
                    style={{
                      height: width * 0.11,
                      width: width * 0.11,
                      borderRadius: (width * 0.11) / 2,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                    }}
                  />
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity onPress={() => alert("Continue with Apple")}>
                    <Image
                      source={require("../assets/images/icons/apple.png")}
                      style={{
                        height: width * 0.11,
                        width: width * 0.11,
                        borderRadius: (width * 0.11) / 2,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                      }}
                    />
                  </TouchableOpacity>
                )}
              </View> */}

              {/* Register link */}
              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-200">Don’t have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text className="text-white font-medium ml-2">Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

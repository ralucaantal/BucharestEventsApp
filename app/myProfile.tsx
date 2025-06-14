"use client";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";
import { BASE_URL } from "../constants";

const EditAccountScreen: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"username" | "password" | null>(null);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUsername(parsed.username || "");
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    if (mode === "username" && (!username || !currentPassword)) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (mode === "password" && (!currentPassword || !newPassword)) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const parsed = userData ? JSON.parse(userData) : null;

      const body =
        mode === "username"
          ? { username, password: currentPassword }
          : { oldPassword: currentPassword, newPassword };

      const url =
        mode === "username"
          ? `${BASE_URL}/users/${parsed.id}`
          : `${BASE_URL}/users/${parsed.id}/password`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      if (data.user && data.token) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
      }

      Alert.alert("Success", "Account updated successfully");
      router.back();
    } catch (err) {
      console.error("❌", err);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-100 rounded-full mr-3">
              <Feather name="chevron-left" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              Edit Account
            </Text>
          </View>

          {/* Avatar and Username */}
          <View className="items-center mt-8 mb-6">
            <Image
              source={require("../assets/images/avatar.png")}
              className="w-24 h-24 rounded-full mb-3"
            />
            <Text className="text-xl font-bold text-gray-800">{username}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Manage your details
            </Text>
          </View>

          {/* Toggle Buttons */}
          <View className="flex-row justify-center gap-x-6 px-5 mt-6">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                mode === "username" ? "" : "bg-gray-100"
              }`}
              style={{
                backgroundColor:
                  mode === "username" ? theme.buttons2 : undefined,
              }}
              onPress={() => {
                setMode("username");
                setErrorMsg("");
              }}>
              <Text
                className={`text-base font-semibold ${
                  mode === "username" ? "text-white" : "text-gray-800"
                }`}>
                Change Username
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                mode === "password" ? "" : "bg-gray-100"
              }`}
              style={{
                backgroundColor:
                  mode === "password" ? theme.buttons2 : undefined,
              }}
              onPress={() => {
                setMode("password");
                setErrorMsg("");
              }}>
              <Text
                className={`text-base font-semibold ${
                  mode === "password" ? "text-white" : "text-gray-800"
                }`}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input fields */}
          <View className="px-5 mt-6 space-y-7">
            {mode === "username" && (
              <>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    New Username
                  </Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm  mb-2"
                    placeholder="Enter new username"
                    placeholderTextColor="gray"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Current Password
                  </Text>
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm"
                    placeholder="Enter current password"
                    secureTextEntry
                    placeholderTextColor="gray"
                  />
                </View>
              </>
            )}

            {mode === "password" && (
              <>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Current Password
                  </Text>
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm mb-2"
                    placeholder="Enter current password"
                    secureTextEntry
                    placeholderTextColor="gray"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    New Password
                  </Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm"
                    placeholder="Enter new password"
                    secureTextEntry
                    placeholderTextColor="gray"
                  />
                </View>
              </>
            )}

            {errorMsg ? (
              <Text className="text-red-500 text-sm text-center">
                {errorMsg}
              </Text>
            ) : null}

            {mode && (
              <TouchableOpacity
                onPress={handleSave}
                className="mt-8 py-3 px-8 rounded-full self-center shadow"
                style={{ backgroundColor: theme.buttons1 }}>
                <Text className="text-white font-bold text-base">Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditAccountScreen;

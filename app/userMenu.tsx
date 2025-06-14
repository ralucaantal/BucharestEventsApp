"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const UserMenuScreen: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("User");
  const [accountType, setAccountType] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log(userData);
        setUsername(parsed.username || "");
        setAccountType(parsed.role || "");
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <Text className="text-2xl font-bold text-gray-800">Account</Text>
        </View>

        {/* Avatar and Username */}
        <View className="items-center mt-8 mb-6">
          <Image
            source={require("../assets/images/avatar.png")}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text className="text-xl font-bold text-gray-800">{username}</Text>
          <Text className="text-sm text-gray-500 mt-1">Welcome back 👋</Text>
          {accountType ? (
            <Text
              className="text-sm font-medium capitalize mt-1"
              style={{ color: theme.buttons1 }}>
              {accountType}
            </Text>
          ) : null}
        </View>

        {/* Menu Options */}
        <View className="px-5 mt-3 space-y-6">
          <TouchableOpacity
            onPress={() => router.push("/myProfile")}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <Feather name="user" size={20} color="#1f2937" className="mr-3" />
            <Text className="text-base text-gray-800 ml-3">My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowRequestForm(true)}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <FontAwesome5 name="user-check" size={18} color="#1f2937" />
            <Text className="text-base text-gray-800 ml-3">
              Request Local Account
            </Text>
          </TouchableOpacity>

          {showRequestForm && (
            <View className="px-5 mb-6">
              <View className="bg-gray-100 rounded-xl px-4 py-3 shadow-sm">
                <Text className="text-gray-800 text-sm font-medium mb-2">
                  Why do you want to become a local?
                </Text>
                <TextInput
                  value={requestReason}
                  onChangeText={setRequestReason}
                  placeholder="Explain your reason..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  className="text-gray-800 text-base"
                  style={{ minHeight: 80 }}
                />
              </View>

              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  onPress={async () => {
                    if (!requestReason.trim()) {
                      alert("Please provide a reason");
                      return;
                    }

                    try {
                      const token = await AsyncStorage.getItem("token");
                      const userData = await AsyncStorage.getItem("user");
                      const parsed = userData ? JSON.parse(userData) : null;

                      const res = await fetch(
                        `${BASE_URL}/requests/local-account`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            userId: parsed.id,
                            reason: requestReason,
                          }),
                        }
                      );

                      if (!res.ok) throw new Error("Request failed");

                      alert("Request sent successfully!");
                      setShowRequestForm(false);
                      setRequestReason("");
                    } catch (err) {
                      console.error("❌ Request error:", err);
                      alert("Something went wrong. Please try again.");
                    }
                  }}
                  className="flex-1 mr-2 py-3 rounded-xl items-center shadow-sm"
                  style={{ backgroundColor: theme.buttons1 }}>
                  <Text className="text-white font-bold text-base">Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowRequestForm(false);
                    setRequestReason("");
                  }}
                  className="flex-1 ml-2 py-3 rounded-xl items-center bg-gray-300 shadow-sm">
                  <Text className="text-gray-800 font-bold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push("/myRequests")}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <Feather name="inbox" size={20} color="#1f2937" />
            <Text className="text-base text-gray-800 ml-3">My Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert("App Settings")}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <Feather name="settings" size={20} color="#1f2937" />
            <Text className="text-base text-gray-800 ml-3">App Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert("Help & Support")}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <MaterialIcons name="support-agent" size={20} color="#1f2937" />
            <Text className="text-base text-gray-800 ml-3">Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert("About the app")}
            className="bg-gray-100 flex-row items-center p-4 rounded-xl shadow-sm mb-6">
            <Feather name="info" size={20} color="#1f2937" />
            <Text className="text-base text-gray-800 ml-3">About</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-10 py-3 px-8 rounded-full self-center shadow mb-8"
          style={{ backgroundColor: theme.buttons1 }}>
          <Text className="text-white font-bold text-base">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserMenuScreen;

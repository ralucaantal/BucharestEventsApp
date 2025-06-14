"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";

const { width } = Dimensions.get("window");

const UserMenuScreen: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const loadUsername = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUsername(parsed.username || "User");
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
    };
    loadUsername();
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
          <Text className="text-2xl font-bold text-gray-800">Settings</Text>
        </View>

        {/* Avatar and username */}
        <View className="items-center mt-8 mb-6">
          <Image
            source={require("../assets/images/avatar.png")}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text className="text-xl font-bold text-gray-800">{username}</Text>
        </View>

        {/* Menu Options */}
        <View className="px-5 mt-3">
          <TouchableOpacity
            onPress={() => alert("My Profile")}
            className="bg-gray-100 p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-base text-gray-800">My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => alert("Settings")}
            className="bg-gray-100 p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-base text-gray-800">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => alert("Help & Support")}
            className="bg-gray-100 p-4 rounded-xl shadow-sm">
            <Text className="text-base text-gray-800">Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-10 py-3 px-6 rounded-full self-center"
          style={{ backgroundColor: theme.buttons1 }}>
          <Text className="text-white font-bold text-base">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserMenuScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
              backgroundColor: "#f3f4f6",
              borderRadius: 999,
              marginRight: 10,
            }}
          >
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}>
              Settings
            </Text>
          </View>
        </View>

        {/* Avatar and username */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Image
            source={require("../assets/images/avatar.png")}
            style={{
              height: 100,
              width: 100,
              borderRadius: 50,
              marginBottom: 10,
            }}
          />
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>{username}</Text>
        </View>

        {/* Menu Options */}
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <TouchableOpacity onPress={() => alert("My Profile")}
            style={optionStyle}>
            <Text style={optionText}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => alert("Settings")}
            style={optionStyle}>
            <Text style={optionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => alert("Help & Support")}
            style={optionStyle}>
            <Text style={optionText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 40,
            backgroundColor: theme.text,
            paddingVertical: 12,
            borderRadius: 999,
            marginHorizontal: 20,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const optionStyle = {
  backgroundColor: "#f3f4f6",
  padding: 16,
  borderRadius: 12,
};

const optionText = {
  fontSize: 16,
  color: "#1f2937",
};

export default UserMenuScreen;
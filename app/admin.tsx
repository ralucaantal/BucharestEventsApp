"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import { theme } from "../theme";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

const AdminDashboardScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Not authorized or failed to fetch");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  useEffect(() => {
    const checkRole = async () => {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || user.role !== "admin") {
        alert("Access denied");
        router.replace("/");
      }
    };

    checkRole();
    fetchUsers();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">
            Admin Dashboard
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout },
              ])
            }
            className="p-2 bg-red-100 rounded-full">
            <Feather name="log-out" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Section 1: Users */}
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Bucharestly Users:
        </Text>

        {loading ? (
          <ActivityIndicator size="large" className="mt-10" />
        ) : users.length === 0 ? (
          <Text className="text-gray-500 text-center mt-4">
            No users found.
          </Text>
        ) : (
          <>
            {users.slice(0, showAllUsers ? users.length : 2).map((user) => (
              <View
                key={user.id}
                className="bg-gray-100 p-4 rounded-xl mb-4 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800">
                  {user.username}
                </Text>
                <Text className="text-gray-600 mt-1">Email: {user.email}</Text>
                <Text className="text-gray-500 mt-1">Role: {user.role}</Text>
                <Text className="text-gray-400 mt-1">
                  Joined: {formatDate(user.created_at)}
                </Text>
              </View>
            ))}
            {users.length > 2 && (
              <TouchableOpacity
                onPress={() => setShowAllUsers(!showAllUsers)}
                className="self-center py-1 px-2 rounded-lg mb-4"
                style={{
                  backgroundColor: showAllUsers ? "#fee2e2" : theme.buttons1,
                }}>
                <Text
                  className="font-medium"
                  style={{
                    color: showAllUsers ? "#b91c1c" : "#ffffff",
                  }}>
                  {showAllUsers ? "Cancel" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Section 2: Requests (static for now) */}
        <Text className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          Requests for becoming local:
        </Text>

        {/* Placeholder */}
        <Text className="text-gray-500 italic">
          (Coming soon: integrate with `/requests/local-account` endpoint)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

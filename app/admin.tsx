"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";

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

  useEffect(() => {
    const checkRole = async () => {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || user.role !== "admin") {
        alert("Access denied");
        router.replace("/"); // redirect to home
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
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
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            Admin Dashboard
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" className="mt-10" />
        ) : users.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">
            No users found.
          </Text>
        ) : (
          users.map((user) => (
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

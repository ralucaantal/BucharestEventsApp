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

type LocalRequest = {
  id: number;
  username: string;
  email: string;
  reason: string;
  status: string;
  created_at: string;
};

type SuggestionRequest = {
  id: number;
  username: string;
  email: string;
  title: string;
  theme: string;
  status: string;
  created_at: string;
};

const AdminDashboardScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [localRequests, setLocalRequests] = useState<LocalRequest[]>([]);
  const [showAllLocalRequests, setShowAllLocalRequests] = useState(false);
  const [suggestionRequests, setSuggestionRequests] = useState<
    SuggestionRequest[]
  >([]);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

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

  const fetchItineraryRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/requests/itinerary-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestionRequests(data);
    } catch (err) {
      console.error("❌ Failed to fetch suggestion requests:", err);
    }
  };

  const fetchLocalRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/requests/local-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setLocalRequests(data);
    } catch (err) {
      console.error("❌ Failed to fetch local requests:", err);
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
    fetchLocalRequests();
    fetchItineraryRequests();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleDecision = async (
    requestId: number,
    action: "accept" | "reject"
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/requests/local-account/${requestId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to update request");

      setLocalRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error(`❌ Failed to ${action} request:`, err);
      alert(`Failed to ${action} request`);
    }
  };

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

        {/* Users Section */}
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
                <Text className="text-gray-500 mt-1 italic">
                  Role: {user.role}
                </Text>
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

        {/* Local Requests Section */}
        <Text className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          Requests for becoming local:
        </Text>

        {localRequests.length === 0 ? (
          <Text className="text-gray-500 italic mb-4">No requests found.</Text>
        ) : (
          <>
            {localRequests
              .slice(0, showAllLocalRequests ? localRequests.length : 2)
              .map((request) => (
                <View
                  key={request.id}
                  className="bg-gray-100 p-4 rounded-xl mb-4 shadow-sm">
                  <Text className="text-lg font-semibold text-gray-800">
                    {request.username}
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    Email: {request.email}
                  </Text>
                  <Text className="text-gray-500 mt-1 italic">
                    Reason: {request.reason}
                  </Text>
                  <Text className="text-gray-400 mt-1">
                    Requested: {formatDate(request.created_at)}
                  </Text>
                  {request.status === "pending" ? (
                    <View className="flex-row mt-3 space-x-5">
                      <TouchableOpacity
                        className="bg-green-100 px-3 py-1 rounded-lg"
                        onPress={() => handleDecision(request.id, "accept")}>
                        <Text className="text-green-700 font-medium">
                          Accept
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-red-100 px-3 py-1 rounded-lg"
                        onPress={() => handleDecision(request.id, "reject")}>
                        <Text className="text-red-700 font-medium">Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text
                      className={`mt-3 font-semibold ${
                        request.status === "accepted"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}>
                      Status:{" "}
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Text>
                  )}
                </View>
              ))}

            {localRequests.length > 2 && (
              <TouchableOpacity
                onPress={() => setShowAllLocalRequests(!showAllLocalRequests)}
                className="self-center py-1 px-2 rounded-lg mb-4"
                style={{
                  backgroundColor: showAllLocalRequests
                    ? "#fee2e2"
                    : theme.buttons1,
                }}>
                <Text
                  className="font-medium"
                  style={{
                    color: showAllLocalRequests ? "#b91c1c" : "#ffffff",
                  }}>
                  {showAllLocalRequests ? "Cancel" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <Text className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          Itinerary Suggestions:
        </Text>

        {suggestionRequests.length === 0 ? (
          <Text className="text-gray-500 italic mb-4">
            No suggestions found.
          </Text>
        ) : (
          <>
            {suggestionRequests
              .slice(0, showAllSuggestions ? suggestionRequests.length : 2)
              .map((req) => (
                <View
                  key={req.id}
                  className="bg-gray-100 p-4 rounded-xl mb-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {req.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                    router.push({
                      pathname: "/suggestedItinerary",
                      params: { id: req.id },
                    })
                  }
                      className="px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: theme.buttons2 }}>
                      <Text className="text-white font-medium text-sm">
                        View details
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-600 mt-1">Email: {req.email}</Text>
                  <Text className="text-gray-500 mt-1 italic">
                    Suggested by: {req.username}
                  </Text>
                  <Text className="text-gray-500 mt-1 italic">
                    Theme: {req.theme}
                  </Text>
                  <Text className="text-gray-400 mt-1">
                    Sent: {formatDate(req.created_at)}
                  </Text>
                  <Text
                    className={`mt-3 font-semibold ${
                      req.status === "pending"
                        ? "text-yellow-600"
                        : req.status === "accepted"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}>
                    Status:{" "}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Text>
                </View>
              ))}

            {suggestionRequests.length > 2 && (
              <TouchableOpacity
                onPress={() => setShowAllSuggestions(!showAllSuggestions)}
                className="self-center py-1 px-2 rounded-lg mb-4"
                style={{
                  backgroundColor: showAllSuggestions
                    ? "#fee2e2"
                    : theme.buttons1,
                }}>
                <Text
                  className="font-medium"
                  style={{
                    color: showAllSuggestions ? "#b91c1c" : "#ffffff",
                  }}>
                  {showAllSuggestions ? "Cancel" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

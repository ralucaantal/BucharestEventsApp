"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme";
import { BASE_URL } from "../constants";

type RequestType = {
  id: number;
  status: string;
  created_at: string;
  reason?: string;
};

const MyRequestsScreen: React.FC = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/requests/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("❌ Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const deleteRequest = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Error deleting request:", err);
      alert("Failed to delete request");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center px-5 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">My Requests</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" className="mt-10" />
        ) : requests.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No requests found.
          </Text>
        ) : (
          <View className="px-5 mt-6 space-y-4">
            {requests.map((request, index) => (
              <View
                key={index}
                className="bg-gray-100 p-4 rounded-xl shadow-sm mb-4">
                <Text className="text-sm text-gray-500 mt-1">
                  Status:{" "}
                  <Text
                    className={`font-medium ${
                      request.status === "approved"
                        ? "text-green-600"
                        : request.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                    {request.status}
                  </Text>
                </Text>

                <Text className="text-sm text-gray-500 mt-1">
                  Date: {formatDate(request.created_at)}
                </Text>

                {"reason" in request && request.reason && (
                  <Text className="text-sm text-gray-600 mt-2">
                    Reason: {request.reason}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => deleteRequest(request.id)}
                  className="absolute top-2 right-2 bg-red-100 px-2 py-1 rounded-full">
                  <Text className="text-red-700 text-xs font-medium">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyRequestsScreen;

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
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import { theme } from "../theme";

const SuggestedItineraryDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isFinalized = data.status === "accepted" || data.status === "rejected";

  const fetchDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/suggested-itineraries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch details");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Error loading details:", err);
      Alert.alert("Error", "Failed to load itinerary details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/requests/itinerary-suggestions/${id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to approve itinerary");
      Alert.alert("Success", "Itinerary approved successfully!");
      router.replace("/admin");
    } catch (err) {
      console.error("❌ Approval error:", err);
      Alert.alert("Error", "Could not approve itinerary.");
    }
  };

  const handleReject = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/requests/itinerary-suggestions/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reject itinerary");
      Alert.alert("Rejected", "Itinerary was rejected.");
      router.replace("/admin");
    } catch (err) {
      console.error("❌ Rejection error:", err);
      Alert.alert("Error", "Could not reject itinerary.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={theme.buttons2} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {/* HEADER */}
        <View className="flex-row items-center pt-5 pb-3 px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            Suggested Itinerary
          </Text>
        </View>

        {/* CARD DETALII */}
        <View className="bg-white mx-4 mt-2 mb-4 p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <Text className="text-xl font-bold text-gray-800">{data.title}</Text>
          <Text className="text-sm text-gray-600">{data.description}</Text>

          <Text className="text-xs text-gray-500">
            🎯 Theme: {data.theme} · 🧭 Level: {data.difficulty} · 💰 Budget:{" "}
            {data.estimated_budget}
          </Text>
          <Text className="text-xs text-gray-500">
            ⏱ Duration: {Math.round(data.duration_minutes / 60)}h · 🕒 Start:{" "}
            {data.starting_time?.slice(0, 5)}
          </Text>
          <Text className="text-xs text-gray-500">
            🏷 Tags: {data.tags?.join(", ") || "—"}
          </Text>
        </View>

        {/* STOPS */}
        <View className="px-5">
          <Text className="font-semibold text-base text-gray-700 mb-2">
            📍 Itinerary Stops
          </Text>
          <View className="space-y-8 pb-10">
            {data.stops?.map((stop: any, idx: number) => (
              <View
                key={idx}
                className="border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 shadow-sm">
                <Text className="font-semibold text-sm text-gray-800">
                  {`${idx + 1}. `}
                  {stop.time ? `🕒 ${stop.time} · ` : ""}
                  {stop.name || `Place ID: ${stop.place_id}`}
                </Text>
                {stop.note && (
                  <Text className="text-sm text-gray-500 mt-0.5">
                    📝 {stop.note}
                  </Text>
                )}
                {stop.instructions && (
                  <Text className="text-sm text-gray-500 mt-0.5">
                    📌 {stop.instructions}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ACTION BUTTONS */}
        {!isFinalized && (
          <View className="px-5 mb-10 flex-row justify-center">
            <TouchableOpacity
              onPress={handleApprove}
              style={{
                backgroundColor: theme.buttons2,
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 999,
                marginRight: 12,
                elevation: 3,
              }}>
              <Text className="text-white font-semibold text-base">
                ✅ Approve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              style={{
                backgroundColor: theme.buttons1,
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 999,
                elevation: 3,
              }}>
              <Text className="text-white font-semibold text-base">
                ❌ Reject
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SuggestedItineraryDetailScreen;

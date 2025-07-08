"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import { BASE_URL } from "../constants";
import { theme } from "../theme";
import mapStyle from "../assets/mapStyle.json";

const { height } = Dimensions.get("window");

const SuggestedItineraryDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState<any>({
    title: "",
    description: "",
    difficulty: "",
    startingTime: "",
    budget: "",
    duration: "",
    theme: "",
    tags: "",
    imageURL: "",
  });

  const fetchDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/suggested-itineraries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch details");
      const json = await res.json();
      setData(json);
      setEditable({
        title: json.title,
        description: json.description,
        difficulty: json.difficulty,
        startingTime: json.starting_time?.slice(0, 5),
        budget: json.estimated_budget,
        duration: Math.round(json.duration_minutes / 60).toString(),
        theme: json.theme,
        tags: json.tags?.join(", ") || "",
        imageURL: json.image_url || "",
      });
    } catch (err) {
      console.error("❌ Error loading details:", err);
      Alert.alert("Error", "Failed to load itinerary details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const imageUrl = editable.imageURL?.trim();

    if (!imageUrl) {
      Alert.alert("Missing Image", "Please add an image URL before approving.");
      return;
    }

    const isValidUrl = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(
      imageUrl
    );
    if (!isValidUrl) {
      Alert.alert(
        "Invalid URL",
        "Please provide a valid image URL ending in .jpg, .png, etc."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/requests/itinerary-suggestions/${id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
          }),
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
  const isFinalized = data.status === "accepted" || data.status === "rejected";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
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

        <View className="px-6 pt-6 pb-10 space-y-6">
          {[
            "title",
            "description",
            "theme",
            "tags",
            "budget",
            "duration",
            "difficulty",
            "startingTime",
            "imageURL",
          ].map((field) => (
            <View key={field}>
              <Text
                className="text-sm font-semibold text-gray-600 capitalize"
                style={{ marginBottom: 10 }}>
                {field.replace(/([A-Z])/g, " $1")}
              </Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder={field}
                value={editable[field]}
                style={{ marginBottom: 10 }}
                onChangeText={(val) =>
                  setEditable((prev: any) => ({ ...prev, [field]: val }))
                }
              />
            </View>
          ))}
        </View>

        {/* MAPA */}
        {data.stops?.length > 0 && (
          <View
            style={{
              height: height * 0.35,
              marginTop: 30,
              borderRadius: 20,
              overflow: "hidden",
            }}
            className="mx-5">
            <MapView
              style={{ flex: 1 }}
              provider="google"
              customMapStyle={mapStyle}
              initialRegion={{
                latitude: data.stops[0].latitude,
                longitude: data.stops[0].longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}>
              {data.stops.map((place: any, index: number) => (
                <Marker
                  key={`${place.place_id}-${index}`}
                  coordinate={{
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }}>
                  <View
                    style={{
                      backgroundColor: theme.buttons2,
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: "white",
                    }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {index + 1}
                    </Text>
                  </View>
                </Marker>
              ))}
              <Polyline
                coordinates={data.stops.map((p: any) => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                }))}
                strokeWidth={2}
                strokeColors={["#ff5d9e"]}
              />
            </MapView>
          </View>
        )}

        {/* ACTIONS */}
        {!isFinalized && (
          <View className="px-5 mt-10 flex-row justify-center">
            <TouchableOpacity
              onPress={handleApprove}
              style={{
                backgroundColor: theme.buttons2,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 999,
                marginRight: 12,
              }}>
              <Text className="text-white font-semibold text-base">
                ✅ Approve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReject}
              style={{
                backgroundColor: theme.buttons1,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 999,
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

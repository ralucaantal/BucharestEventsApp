import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import mapStyle from "../assets/mapStyle.json";
import { theme } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const ItineraryDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [postAnonymously, setPostAnonymously] = useState(false);

  const fetchItinerary = async () => {
    try {
      const res = await fetch(`${BASE_URL}/itineraries/${id}`);
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      console.error("❌ Error fetching itinerary:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/itineraries/${id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("❌ Error fetching reviews", err);
    }
  };

  useEffect(() => {
    const fetchItineraryAndReviews = async () => {
      try {
        const res = await fetch(`${BASE_URL}/itineraries/${id}`);
        const data = await res.json();
        setItinerary(data);
        await fetchReviews(); // ✅ acum funcția e definită
      } catch (err) {
        console.error("❌ Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraryAndReviews();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const checkIfFavorite = async () => {
        try {
          const userDataString = await AsyncStorage.getItem("user");
          if (!userDataString || !id) return;
          const user = JSON.parse(userDataString);

          const res = await fetch(`${BASE_URL}/favorites/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, itineraryId: Number(id) }),
          });

          const data = await res.json();
          if (typeof data === "boolean") setIsFavorite(data);
        } catch (err) {
          console.error("❌ Error checking favorite status", err);
        }
      };

      checkIfFavorite();
    }, [id])
  );

  const toggleFavorite = async () => {
    const newStatus = !isFavorite;
    try {
      const token = await AsyncStorage.getItem("token");
      const userDataString = await AsyncStorage.getItem("user");
      if (!token || !userDataString) return;

      const user = JSON.parse(userDataString);
      await fetch(`${BASE_URL}/favorites/itineraries`, {
        method: newStatus ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itineraryId: Number(id) }),
      });

      setIsFavorite(newStatus);
    } catch (e) {
      console.error("❌ Favorite toggle failed", e);
    }
  };

  if (loading || !itinerary || !Array.isArray(itinerary.places)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  const coordinates = itinerary.places.map((place: any) => ({
    latitude: place.latitude || place.lat,
    longitude: place.longitude || place.lng,
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View className="flex-row items-center px-5 pt-5 pb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-100 rounded-full mr-3">
              <Feather name="chevron-left" size={24} color="#1f2937" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                {itinerary.title}
              </Text>

              <View className="mb-3 space-y-1">
                <Text className="text-xs text-gray-500">
                  🎯 Theme: {itinerary.theme} · 🧭 Level: {itinerary.difficulty}{" "}
                  · 💰 Budget: {itinerary.estimated_budget}
                </Text>
                <Text className="text-xs text-gray-500">
                  ⏱ Duration: {Math.round(itinerary.duration_minutes / 60)}h ·
                  🕒 Start: {itinerary.starting_time?.slice(0, 5)} ⭐{" "}
                  {isNaN(Number(itinerary.rating_avg))
                    ? "0"
                    : Number(itinerary.rating_avg) % 1 === 0
                    ? Number(itinerary.rating_avg).toFixed(0)
                    : Number(itinerary.rating_avg).toFixed(1)}{" "}
                  / 5
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={toggleFavorite}
              className="ml-2 bg-white/70 p-1.5 rounded-full">
              <Feather
                name="heart"
                size={20}
                color={isFavorite ? "red" : "gray"}
              />
            </TouchableOpacity>
          </View>

          {/* HARTA (în interiorul ScrollView!) */}
          {coordinates.length > 0 && (
            <View
              style={{
                height: height * 0.4,
                marginHorizontal: 20,
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 20,
              }}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider="google"
                customMapStyle={mapStyle}
                initialRegion={{
                  latitude: coordinates[0].latitude,
                  longitude: coordinates[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}>
                {itinerary.places.map((place: any, index: number) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: place.latitude || place.lat,
                      longitude: place.longitude || place.lng,
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
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}>
                        {index + 1}
                      </Text>
                    </View>
                  </Marker>
                ))}
                <Polyline
                  coordinates={coordinates}
                  strokeWidth={2}
                  strokeColors={["#ff5d9e"]}
                />
              </MapView>
            </View>
          )}

          {/* CONȚINUT SCROLLABIL */}
          <View className="px-5">
            <Text className="text-sm text-gray-600 mb-3">
              {itinerary.description}
            </Text>

            <Text className="font-semibold text-base text-gray-700 mb-2">
              📍 Itinerary Stops
            </Text>
            <View className="space-y-8 pb-10">
              {itinerary.places.map((place: any, idx: number) => (
                <View
                  key={idx}
                  style={{ marginBottom: 15 }}
                  className="border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 shadow-sm">
                  <Text className="font-semibold text-sm text-gray-800">
                    {place.time ? `🕒 ${place.time} · ` : ""}
                    {place.place || place.name}
                  </Text>
                  {place.note && (
                    <Text className="text-sm text-gray-500 mt-0.5">
                      📝 {place.note}
                    </Text>
                  )}
                  {place.instructions && (
                    <Text className="text-sm text-gray-500 mt-0.5">
                      📌 {place.instructions}
                    </Text>
                  )}
                  {place.description && !place.note && !place.instructions && (
                    <Text className="text-sm text-gray-500 mt-0.5">
                      {place.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* FORM REVIEW */}
            <View className="mt-8">
              <View className="flex-row mt-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <FontAwesome
                      name={star <= rating ? "star" : "star-o"}
                      size={24}
                      color="#facc15"
                      style={{ marginRight: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Write your comment here..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                className="border border-gray-300 rounded-lg p-3 text-sm text-gray-700 bg-white"
              />
              <TouchableOpacity
                onPress={() => setPostAnonymously(!postAnonymously)}
                className="flex-row items-center mt-3">
                <View
                  className="w-5 h-5 mr-2 rounded items-center justify-center"
                  style={{
                    backgroundColor: postAnonymously ? theme.buttons1 : "white",
                    borderWidth: 1,
                    borderColor: postAnonymously ? theme.buttons1 : "#9ca3af", // gray-400
                  }}>
                  {postAnonymously && (
                    <Feather name="check" size={14} color="white" />
                  )}
                </View>

                <Text className="text-sm text-gray-700">Post anonymously</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const userDataString = await AsyncStorage.getItem("user");
                    const token = await AsyncStorage.getItem("token");
                    if (!userDataString || !token) return;
                    const user = JSON.parse(userDataString);

                    await fetch(`${BASE_URL}/reviews/itineraries`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        userId: user.id,
                        itineraryId: Number(id),
                        rating,
                        comment,
                        anonymous: postAnonymously,
                      }),
                    });

                    setComment("");
                    setRating(0);
                    await fetchItinerary();
                    await fetchReviews();
                  } catch (err) {
                    console.error("❌ Error submitting review", err);
                    alert("Error submitting review");
                  }
                }}
                className="bg-white self-center py-4 px-8 rounded-full shadow-md mt-4"
                style={{
                  backgroundColor: theme.buttons1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 3,
                }}>
                <Text className="text-white font-semibold text-sm">
                  Submit Review
                </Text>
              </TouchableOpacity>
            </View>

            {/* REVIEWS LIST */}
            <View className="mt-8 mb-10">
              <Text className="font-semibold text-base text-gray-700 mb-2">
                🗣️ What others say
              </Text>
              {reviews.length === 0 ? (
                <Text className="text-sm text-gray-500">No reviews yet.</Text>
              ) : (
                reviews.map((rev: any, idx: number) => (
                  <View
                    key={idx}
                    className="border border-gray-200 bg-white rounded-xl px-4 py-3 mb-3 shadow-sm">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-semibold text-gray-800 text-sm flex-row items-center">
                        {rev.anonymous ? (
                          <View className="flex-row items-center space-x-1">
                            <FontAwesome
                              name="user-secret"
                              size={14}
                              color="gray"
                            />
                            <Text className="text-gray-800 text-sm">
                              Anonymous
                            </Text>
                          </View>
                        ) : (
                          rev.username
                        )}
                      </Text>

                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome
                            key={star}
                            name={star <= rev.rating ? "star" : "star-o"}
                            size={16}
                            color="#facc15"
                          />
                        ))}
                      </View>
                    </View>
                    {rev.comment && (
                      <Text className="text-sm text-gray-600">
                        {rev.comment}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ItineraryDetailScreen;

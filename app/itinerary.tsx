import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import mapStyle from "../assets/mapStyle.json";
import { theme } from "../theme";

const { height } = Dimensions.get("window");

const ItineraryDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`${BASE_URL}/itineraries/${id}`);
        const data = await res.json();
        setItinerary(data);
      } catch (err) {
        console.error("❌ Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

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
      {/* Header cu titlu */}
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-gray-100 rounded-full mr-3">
          <Feather name="chevron-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-800">
            {itinerary.title}
          </Text>
          <View className="mb-3 space-y-1">
            <Text className="text-xs text-gray-500">
              🎯 Theme: {itinerary.theme} · 🧭 Level: {itinerary.difficulty} ·
              💰 Budget: {itinerary.estimated_budget}
            </Text>
            <Text className="text-xs text-gray-500">
              ⏱ Duration: {Math.round(itinerary.duration_minutes / 60)}h · 🕒
              Start: {itinerary.starting_time?.slice(0, 5)}
            </Text>
          </View>
        </View>
      </View>

      {/* Map */}
      {coordinates.length > 0 && (
        <MapView
          ref={mapRef}
          style={{ height: height * 0.4 }}
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
                  style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
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
      )}

      {/* Detalii */}
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-sm text-gray-600 mb-3">
          {itinerary.description}
        </Text>

        <Text className="font-semibold text-base text-gray-700 mb-2">
          📍 Itinerary Stops
        </Text>
        <View className="space-y-3 pb-10">
          {itinerary.places.map((place: any, idx: number) => (
            <View
              key={idx}
              className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 shadow-sm">
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItineraryDetailScreen;

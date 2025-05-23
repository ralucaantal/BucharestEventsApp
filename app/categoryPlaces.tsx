import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const typeMapping: { [key: string]: string[] } = {
  "🏛 Monuments": ["tourist_attraction"],
  "🖼 Museums": ["museum"],
  "🍴 Restaurants": ["restaurant"],
  "🌳 Parks": ["park"],
  "🎭 Culture": [
    "theater",
    "art_gallery",
    "museum",
    "movie_theater",
    "point_of_interest",
  ],
  "🎬 Cinemas": ["movie_theater"],
  "☕ Cafes": ["cafe"],
  "🍻 Bars & Pubs": ["bar"],
  "🛍 Shops & Markets": ["shopping_mall", "store", "supermarket"],
  "🎨 Art Galleries": ["art_gallery"],
  "📚 Libraries": ["library"],
  "🧘‍♀️ Wellness": ["spa", "gym", "beauty_salon"],
};

type Place = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photo_url: string | null;
};

const CategoryPlacesScreen: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const mappedTypes = typeMapping[category as string] || [];

        if (mappedTypes.length > 0) {
          const tag = mappedTypes[0];
          const res = await fetch(
            `${BASE_URL}/places?tag=${encodeURIComponent(tag)}`
          );
          const data = await res.json();
          setPlaces(data);
        } else {
          setPlaces([]);
        }
      } catch (error) {
        console.error("Failed to fetch places", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchPlaces();
  }, [category]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-gray-100 rounded-full mr-3">
          <Feather name="chevron-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-800">{category}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            Discover the best places
          </Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Places List */}
        <View className="px-5">
          {places.map((place) => (
            <TouchableOpacity
              key={place.place_id}
              activeOpacity={0.8}
              className="flex-row bg-gray-100 p-3 rounded-2xl mb-4 items-center">
              {place.photo_url ? (
                <Image
                  source={{ uri: place.photo_url }}
                  className="rounded-xl mr-4"
                  style={{ width: width * 0.22, height: width * 0.22 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="bg-gray-300 justify-center items-center rounded-xl mr-4"
                  style={{ width: width * 0.22, height: width * 0.22 }}>
                  <Text className="text-gray-500">No Image</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">
                  {place.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {place.address}
                </Text>
                <Text className="text-sm font-bold text-yellow-500 mt-1">
                  ⭐ {place.rating?.toFixed(1) ?? "N/A"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryPlacesScreen;

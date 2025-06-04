import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BASE_URL } from "../constants";
import { Feather, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type Place = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photo_url: string | null;
  user_ratings_total?: number;
};

const AllCategoriesScreen: React.FC = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchFavorites = async (uid: number) => {
    try {
      const res = await fetch(`${BASE_URL}/favorites/${uid}`);
      const data = await res.json();
      setFavorites(data.map((place: Place) => place.place_id));
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  };

  const toggleFavorite = async (placeId: string, isFav: boolean) => {
    try {
      await fetch(`${BASE_URL}/favorites`, {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, placeId }),
      });
      await fetchFavorites(userId!);
    } catch (err) {
      console.error("❌ Failed to update favorite", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        const stored = await AsyncStorage.getItem("user");
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setUserId(parsed.id);
        await fetchFavorites(parsed.id);
      };
      init();
    }, [])
  );

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/places?category=${encodeURIComponent(
            category as string
          )}`
        );
        const data = await res.json();
        setPlaces(data);
      } catch (error) {
        console.error("Failed to fetch places", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [category]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 mb-5">
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
          {places.map((place) => {
            const isFav = favorites.includes(place.place_id);
            return (
              <TouchableOpacity
                key={place.place_id}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/destination",
                    params: {
                      name: place.name,
                      photo_url: place.photo_url ?? "",
                      rating: place.rating?.toString() ?? "",
                      address: place.address ?? "",
                      lat: place.latitude?.toString() ?? "",
                      lng: place.longitude?.toString() ?? "", 
                    },
                  })
                }
                className="flex-row bg-gray-100 p-3 rounded-2xl mb-4 items-center relative">
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
                  <Text className="text-sm font-bold text-amber-500 mt-1">
                    ⭐ {place.rating?.toFixed(1) ?? "N/A"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleFavorite(place.place_id, isFav)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "rgba(255,255,255,0.6)",
                    padding: 6,
                    borderRadius: 999,
                  }}>
                  <FontAwesome
                    name="heart"
                    size={20}
                    color={isFav ? "red" : "white"}
                    solid={isFav}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllCategoriesScreen;

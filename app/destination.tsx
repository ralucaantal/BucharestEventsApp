"use client";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { BASE_URL } from "../constants";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ios = Platform.OS === "ios";
const topMargin = ios ? 0 : 40;
const { width, height } = Dimensions.get("window");

const DestinationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);
  const placeId =
    typeof params.placeId === "string"
      ? params.placeId
      : Array.isArray(params.placeId)
      ? params.placeId[0]
      : "";

  const [isFavourite, toggleFavourite] = useState(false);

  const handleToggleFavorite = async () => {
    const newStatus = !isFavourite;
    try {
      const token = await AsyncStorage.getItem("token");
      const userDataString = await AsyncStorage.getItem("user");
      if (!token || !userDataString) return;

      const user = JSON.parse(userDataString);

      await fetch(`${BASE_URL}/favorites/places`, {
        method: newStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          placeId,
        }),
      });

      toggleFavourite(newStatus);
    } catch (err) {
      console.error("❌ Favorite toggle failed", err);
    }
  };

  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const checkIfFavorite = async () => {
        try {
          const userDataString = await AsyncStorage.getItem("user");
          if (!userDataString || !placeId) return;
          const user = JSON.parse(userDataString);

          const res = await fetch(`${BASE_URL}/favorites/check/places`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, placeId }),
          });

          const data = await res.json();
          if (typeof data === "boolean") toggleFavourite(data);
        } catch (err) {
          console.error("❌ Error checking favorite status", err);
        }
      };

      checkIfFavorite();
    }, [placeId])
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await fetch(`${BASE_URL}/places/details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId }),
        });

        const data = await res.json();
        setPlace(data);
      } catch (err) {
        console.error("❌ Failed to fetch place details", err);
        Alert.alert("Error", "Could not load place details.");
      } finally {
        setLoading(false);
      }
    };

    if (placeId) fetchPlace();
  }, [placeId]);

  function openGoogleMapsPlaceByName(name: string, address: string) {
    const query = `${name}, ${address}, București`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;

    Linking.openURL(url).catch((err) => {
      console.error("❌ Failed to open Google Maps:", err);
      Alert.alert("Error", "Could not open Google Maps.");
    });
  }

  if (loading || !place) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {place.photo_url ? (
        <Image
          source={{ uri: place.photo_url }}
          style={{ width, height: height * 0.55 }}
        />
      ) : (
        <View
          className="bg-gray-300"
          style={{ width, height: height * 0.55 }}
        />
      )}

      <StatusBar style="light" />

      {/* Top buttons */}
      <SafeAreaView
        className="absolute w-full flex-row justify-between items-center px-4"
        style={{ marginTop: topMargin }}>
        <TouchableOpacity
          className="p-2 rounded-full bg-white/50"
          onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2 rounded-full bg-white/50"
          onPress={handleToggleFavorite}>
          <FontAwesome
            name="heart"
            size={28}
            solid={isFavourite}
            color={isFavourite ? "red" : "white"}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <View
        className="flex-1 bg-white px-5 pt-[30px]"
        style={{
          marginTop: -40,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title + Rating */}
          <View className="flex-row justify-between items-start">
            <Text className="text-[26px] font-bold text-gray-700 flex-1">
              {place.name}
            </Text>
            <Text
              className="text-[22px] font-semibold"
              style={{ color: theme.text }}>
              ⭐ {place.rating ? Number(place.rating).toFixed(1) : "N/A"}
            </Text>
          </View>

          {/* Description */}
          {place.description && (
            <Text className="text-[15px] text-gray-700 mt-[10px] mb-[15px] leading-[22px]">
              {place.description}
            </Text>
          )}

          {/* Address */}
          <View className="flex-row items-start gap-2 mb-6">
            <MaterialIcons name="location-pin" size={24} color="#f87171" />
            <Text className="text-[16px] text-gray-600 flex-1">
              {place.address}
            </Text>
          </View>

          {/* Navigate button */}
          <TouchableOpacity
            onPress={() => openGoogleMapsPlaceByName(place.name, place.address)}
            className="h-[50px] rounded-full justify-center items-center mb-6 self-center"
            style={{
              width: width * 0.55,
              backgroundColor: theme.buttons1,
            }}>
            <Text className="text-white font-bold text-[17px]">
              Open on Google Maps
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default DestinationScreen;

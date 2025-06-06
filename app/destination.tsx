"use client";
import React, { useState } from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";

const ios = Platform.OS === "ios";
const topMargin = ios ? 0 : 40;
const { width, height } = Dimensions.get("window");

const DestinationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavourite, toggleFavourite] = useState(false);

  const item = {
    image: params.photo_url,
    title: params.name,
    rating: Number(params.rating),
    address: params.address,
    lat: Number(params.lat),
    lng: Number(params.lng),
    description: `Discover the charm of ${params.name} located in Bucharest.`,
  };

  function openNavigationApp(lat: number, lon: number, label: string) {
    const iosUrl = `maps://?daddr=${lat},${lon}&dirflg=d`;
    const androidUrl = `google.navigation:q=${lat},${lon}`;
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

    const url = Platform.OS === "ios" ? iosUrl : androidUrl;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error("Navigation error:", err);
        Alert.alert("Error", "Could not open navigation app.");
      });
  }

  return (
    <View className="flex-1 bg-white">
      {item.image ? (
        <Image
          source={{ uri: item.image as string }}
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
          onPress={() => toggleFavourite(!isFavourite)}>
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
              {item.title}
            </Text>
            <Text
              className="text-[22px] font-semibold"
              style={{ color: theme.text }}>
              ⭐ {item.rating?.toFixed(1) ?? "N/A"}
            </Text>
          </View>

          {/* Description */}
          <Text className="text-[15px] text-gray-700 mt-[10px] mb-[15px] leading-[22px]">
            {item.description}
          </Text>

          {/* Address */}
          <View className="flex-row items-start gap-2 mb-6">
            <MaterialIcons name="location-pin" size={24} color="#f87171" />
            <Text className="text-[16px] text-gray-600 flex-1">
              {item.address}
            </Text>
          </View>

          {/* Navigate button */}
          <TouchableOpacity
            onPress={() =>
              openNavigationApp(item.lat, item.lng, item.title[0])
            }
            className="h-[50px] rounded-full justify-center items-center mb-6 self-center"
            style={{
              width: width * 0.55,
              backgroundColor: theme.bg(0.8),
            }}>
            <Text className="text-white font-bold text-[17px]">Navigate</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default DestinationScreen;

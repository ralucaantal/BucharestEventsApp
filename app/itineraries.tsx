import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import { theme } from "../theme";

const { width } = Dimensions.get("window");

type Itinerary = {
  id: number;
  title: string;
  theme: string;
  description: string;
  image_url: string;
  starting_point: string;
  starting_lat: number;
  starting_lng: number;
  starting_time: string;
  duration_minutes: number;
  difficulty: string;
  etimated_budget: string;
  tags: string[];
  rating_avg: number;
};

const ItinerariesScreen: React.FC = () => {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await fetch(`${BASE_URL}/itineraries`);
        const data = await res.json();
        setItineraries(data);
      } catch (err) {
        console.error("❌ Error loading itineraries:", err);
      }
    };

    fetchItineraries();
  }, []);

  const getPriceEmoji = (budget: string) => {
    if (!budget) return "💸";

    const normalized = budget.replace(/[^\d]/g, "");
    const value = parseInt(normalized);

    if (isNaN(value)) return "💸";
    if (value <= 50) return "💸";
    if (value <= 150) return "💰";
    return "💎";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              Itineraries 🧭
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Best urban journeys through Bucharest
            </Text>
          </View>
        </View>

        {/* List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pb-8">
            {itineraries.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                className="flex-row bg-gray-100 p-3 rounded-2xl mb-4 items-center"
                onPress={() => router.push({ pathname: "/itinerary", params: { id: item.id.toString() } })}>
                <Image
                  source={{ uri: item.image_url }}
                  className="rounded-xl mr-4"
                  style={{ width: width * 0.22, height: width * 0.22 }}
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {item.title}
                  </Text>

                  {/* Tema + dificultate + buget cu emoji-uri */}
                  <Text className="text-[12px] text-gray-500 mt-0.5">
                    🎯 Theme: {item.theme} · 🧭 Level: {item.difficulty} · 💰
                    Budget: {getPriceEmoji(item.etimated_budget)}{" "}
                    {item.etimated_budget} · ⭐{" "}
                    {isNaN(Number(item.rating_avg))
                      ? "0"
                      : Number(item.rating_avg) % 1 === 0
                      ? Number(item.rating_avg).toFixed(0)
                      : Number(item.rating_avg).toFixed(1)}{" "}
                    / 5
                  </Text>

                  {/* Descriere */}
                  {/* <Text
                    className="text-sm text-gray-500 mt-1"
                    numberOfLines={3}>
                    📍 {item.description}
                  </Text> */}

                  {/* TAGS cu badge-uri */}
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <View className="flex-row flex-wrap mt-2 gap-1">
                      {item.tags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-white border border-gray-300 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-gray-600">
                            🏷️ {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ItinerariesScreen;

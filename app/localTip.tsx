import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";
import { theme } from "../theme";

const { width } = Dimensions.get("window");

const LocalTipDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tip, setTip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${BASE_URL}/local-tips`);
        const allTips = await res.json();
        const selected = allTips.find((t: any) => t.id === Number(id));
        setTip(selected);
      } catch (err) {
        console.error("❌ Error fetching local tip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [id]);

  if (loading || !tip) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={theme.buttons1} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800 flex-1">
            {tip.emoji} {tip.title}
          </Text>
        </View>

        {/* Image */}
        {tip.image_url && (
          <View className="mx-5 mb-4 rounded-2xl overflow-hidden shadow-md">
            <Image
              source={{ uri: tip.image_url }}
              className="w-full h-56"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Description */}
        {tip.description && (
          <Text className="text-gray-700 text-base px-5 mb-5">
            {tip.description}
          </Text>
        )}

        {/* Places in the Tip */}
        <View className="px-5 space-y-5">
          {tip.places.map((item: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={{ marginBottom: 20 }}
              onPress={() =>
                router.push({
                  pathname: "/destination",
                  params: { placeId: item.place_id },
                })
              }
              className="flex-row items-center bg-gray-100 p-3 rounded-xl shadow-sm">
              <Image
                source={{
                  uri: item.photo_url || "https://via.placeholder.com/150",
                }}
                className="rounded-lg mr-4"
                style={{ width: width * 0.22, height: width * 0.22 }}
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-sm mb-1">
                  #{item.rank} · {item.name}
                </Text>
                {item.comment && (
                  <Text className="text-sm text-gray-600">{item.comment}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocalTipDetailScreen;

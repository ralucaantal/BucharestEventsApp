import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const LocalTipsScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${BASE_URL}/local-tips`);
        const data = await res.json();
        setTips(data);
      } catch (err) {
        console.error("❌ Failed to fetch local tips", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const filteredTips = tips.filter((tip) =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Header + Search */}
          <View className="z-10 bg-white">
            <View className="flex-row items-center px-5 pt-5 pb-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 bg-gray-100 rounded-full mr-3">
                <Feather name="chevron-left" size={24} color="#1f2937" />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Local Tips 💡
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Discover authentic places, loved by locals
                </Text>
              </View>
            </View>

            <View className="px-5 mb-3">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                <Feather name="search" size={20} color="gray" />
                <TextInput
                  placeholder="Search tips..."
                  placeholderTextColor="gray"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="ml-2 flex-1 text-base text-gray-700"
                />
              </View>
            </View>
          </View>

          {/* Tips List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-5 pb-8">
              {loading ? (
                <ActivityIndicator size="large" color={theme.text} />
              ) : filteredTips.length === 0 ? (
                <Text className="text-center text-gray-500 mt-10">
                  No tips found.
                </Text>
              ) : (
                filteredTips.map((tip) => (
                  <TouchableOpacity
                    key={tip.id}
                    activeOpacity={0.9}
                    className="flex-row bg-gray-100 p-3 rounded-2xl mb-4 items-center"
                    onPress={() => router.push({ pathname: "/localTip", params: { id: tip.id } })}
                  >
                    <Image
                      source={{ uri: tip.image_url || "https://via.placeholder.com/150" }}
                      className="rounded-xl mr-4"
                      style={{ width: width * 0.22, height: width * 0.22 }}
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">
                        {tip.emoji} {tip.title}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {tip.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LocalTipsScreen;
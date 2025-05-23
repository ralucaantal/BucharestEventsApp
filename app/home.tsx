import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Categories from "../components/categories";
import Destinations from "../components/destinations";
import QuickActions from "@/components/QuickActions";
import CategorySelector from "../components/categorySelector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (!token || !storedUser) {
        router.replace("/login");
      } else {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (e) {
          console.error("❌ Failed to parse user:", e);
        }
      }
    };
    checkLogin();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" backgroundColor="white" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              Hello, {user?.username || "Explorer"}! 👋
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              What do you want to do today in Bucharest?
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/userMenu")}>
            <Image
              source={require("../assets/images/avatar.png")}
              className="h-11 w-11 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Feather name="search" size={20} color="gray" />
            <TextInput
              placeholder="Search destinations..."
              placeholderTextColor="gray"
              className="ml-2 flex-1 text-base text-gray-700"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-4">
          <QuickActions />
        </View>

        {/* Categories */}
        <View className="mb-4">
          <Categories />
        </View>

        {/* Featured Destinations */}
        <View className="mb-6">
          <View className="px-5 mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              Featured Destinations
            </Text>
          </View>

          {/* Category Selector */}
          <CategorySelector
            activeCategory={activeCategory}
            onSelect={(cat) => setActiveCategory(cat)}
          />

          {/* Destinations */}
          <Destinations activeCategory={activeCategory} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
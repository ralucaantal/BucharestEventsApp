"use client";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const handlePress = async () => {
    const token = await AsyncStorage.getItem("token");
    const userData = await AsyncStorage.getItem("user");

    if (!token || !userData) {
      return router.push("/login");
    }

    const user = JSON.parse(userData);

    if (user.role === "admin") {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      return router.replace("/login");
    }

    router.push("/home");
  };

  return (
    <View className="flex-1">
      {/* Background Image */}
      <Image
        source={require("../assets/images/welcome.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(3,105,161,0.85)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          bottom: 0,
          width,
          height: height * 0.6,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      />

      {/* Content */}
      <View className="flex-1 justify-end px-8 pb-10 z-10">
        <View className="items-center mb-6">
          <Text
            className="text-white font-bold text-center"
            style={{
              fontSize: width * 0.1,
              lineHeight: width * 0.1,
              marginBottom: width * 0.05,
            }}
          >
            Life in Bucharest made easier 🤭
          </Text>
          <Text
            className="text-gray-200 font-medium text-center"
            style={{
              fontSize: width * 0.06,
            }}
          >
            Find out about activities in Bucharest with just one tap.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePress}
          className="bg-white self-center py-4 px-12 rounded-full shadow-md"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text
            className="font-bold"
            style={{
              fontSize: width * 0.052,
              color: theme.buttons1,
            }}
          >
            Let&apos;s go!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
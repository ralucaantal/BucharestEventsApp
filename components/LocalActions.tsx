import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const LocalActions: React.FC = () => {
  const router = useRouter();

  const localActionsData = [
    {
      title: "Propose an Itinerary 🗺️",
      image: require("../assets/images/proposeItinerary.png"),
      onPress: () => router.push("/suggestItinerary"),
    },
    {
      title: "Propose a Local Tip 💡",
      image: require("../assets/images/proposeLocalTips.png"),
      //onPress: () => router.push("/suggestTop"),
    },
  ];

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="px-5 flex-row justify-between items-center mb-2">
        <Text
          className="font-bold text-gray-800"
          style={{ fontSize: width * 0.045 }}>
          Contribute Locally 🙌
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}>
        {localActionsData.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={action.onPress}
            className="mr-5 items-center">
            <View className="w-[72px] h-[72px] rounded-2xl bg-gray-100 justify-center items-center mb-2 shadow-sm">
              <Image
                source={action.image}
                resizeMode="cover"
                className="w-[64px] h-[64px] rounded-xl"
              />
            </View>
            <Text
              className="text-center text-gray-700 font-medium text-xs w-[80px]"
              numberOfLines={4}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default LocalActions;
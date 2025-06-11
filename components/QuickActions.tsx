import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const QuickActions: React.FC = () => {
  const router = useRouter();

  const quickActionsData = [
    {
      title: 'Find Your Way 🗺️',
      image: require('../assets/images/map.png'),
      onPress: () => router.push('/map'),
    },
    {
      title: 'What’s Happening Today 🎉',
      image: require('../assets/images/calendar.png'),
      onPress: () => router.push('/calendar'),
    },
    {
      title: 'Ask Your Guide 👀',
      image: require('../assets/images/guide.png'),
      onPress: () => router.push('/virtualGuide'),
    },
    {
      title: 'Need some plan suggestions? 🧠',
      image: require('../assets/images/itineraries.png'),
      onPress: () => router.push('/virtualGuide'),
    },
  ];

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="px-5 flex-row justify-between items-center mb-2">
        <Text
          className="font-bold text-gray-800"
          style={{ fontSize: width * 0.045 }}
        >
          Quick Actions
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {quickActionsData.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={action.onPress}
            className="mr-5 items-center"
          >
            <View className="w-[72px] h-[72px] rounded-2xl bg-gray-100 justify-center items-center mb-2 shadow-sm">
              <Image
                source={action.image}
                resizeMode="cover"
                className="w-[64px] h-[64px] rounded-xl"
              />
            </View>
            <Text
              className="text-center text-gray-700 font-medium text-xs w-[80px]"
              numberOfLines={4}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickActions;
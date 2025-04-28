import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const QuickActions: React.FC = () => {
  const router = useRouter();

  const quickActionsData = [
    {
      title: 'Find Your Way 🗺️',
      image: require('../assets/images/map.png'),
      onPress: () => router.push('/map'),
    },
    {
      title: 'Plan Your Day ⏱️',
      image: require('../assets/images/calendar.png'),
      onPress: () => router.push('/calendar'),
    },
    {
      title: 'Ask Your Guide 👀',
      image: require('../assets/images/guide.png'),
      // onPress: () => router.push('/assistant'),
    },
  ];

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="px-5 flex-row justify-between items-center">
        <Text
          style={{ fontSize: wp(4.5), marginBottom: wp(2) }}
          className="font-bold text-neutral-800"
        >
          Quick Actions
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(5) }}
      >
        {quickActionsData.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={action.onPress}
            className="mr-5 items-center"
          >
            <View
              style={{
                width: wp(20),
                height: wp(20),
                borderRadius: wp(5),
                backgroundColor: '#f3f4f6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
              className="mb-2 justify-center items-center"
            >
              <Image
                source={action.image}
                resizeMode="cover"
                style={{
                  width: wp(18),
                  height: wp(18),
                  borderRadius: wp(4),
                }}
              />
            </View>
            <Text
              style={{ fontSize: wp(3) }}
              className="text-neutral-700 font-medium text-center"
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
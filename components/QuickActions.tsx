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
      title: 'Plan Your Day ⏱️',
      image: require('../assets/images/calendar.png'),
      onPress: () => router.push('/calendar'),
    },
    {
      title: 'Ask Your Guide 👀',
      image: require('../assets/images/guide.png'),
      onPress: () => router.push('/virtualGuide'),
    },
  ];

  return (
    <View style={{ gap: 16 }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.045,
            fontWeight: 'bold',
            color: '#1f2937',
          }}
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
            style={{
              marginRight: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: width * 0.2,
                height: width * 0.2,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Image
                source={action.image}
                resizeMode="cover"
                style={{
                  width: width * 0.18,
                  height: width * 0.18,
                  borderRadius: 12,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: width * 0.03,
                color: '#374151',
                fontWeight: '500',
                textAlign: 'center',
              }}
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
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { categoriesData } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AllCategories = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: width * 0.06,
            fontWeight: 'bold',
            marginBottom: 20,
            color: '#1f2937',
          }}
        >
          All Categories
        </Text>

        {categoriesData.map((cat, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              router.push(`/categoryPlaces?category=${encodeURIComponent(cat.title)}`)
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Image
              source={cat.image}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 16,
              }}
            />
            <Text
              style={{
                fontSize: width * 0.045,
                color: '#374151',
                fontWeight: '600',
              }}
            >
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllCategories;
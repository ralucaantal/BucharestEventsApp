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
import { theme } from '../theme';
import { categoriesData } from '../constants';

const { width } = Dimensions.get('window');

const Categories: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = (categoryTitle: string) => {
    router.push(`/categoryPlaces?category=${encodeURIComponent(categoryTitle)}` as any);
  };

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
          Categories
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categoriesData.map((cat, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(cat.title)}
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
                source={cat.image}
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
                fontSize: width * 0.033,
                color: '#374151',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Categories;
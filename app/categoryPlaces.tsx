import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { BASE_URL } from '../constants';

const typeMapping: { [key: string]: string[] } = {
  '🏛 Monuments': ['tourist_attraction'],
  '🖼 Museums': ['museum'],
  '🍴 Restaurants': ['restaurant'],
  '🌳 Parks': ['park'],
  '🎭 Culture': ['cultural_center'],
  '🎬 Cinemas': ['movie_theater'],
  '☕ Cafes': ['cafe'],
  '🍻 Bars & Pubs': ['bar'],
  '🛍 Shops & Markets': ['shopping_mall', 'store', 'supermarket'],
  '🎨 Art Galleries': ['art_gallery'],
  '📚 Libraries': ['library'],
  '🧘‍♀️ Wellness': ['spa', 'gym', 'beauty_salon'],
};

type Place = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photo_url: string | null;
};

const CategoryPlacesScreen = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${BASE_URL}/places`);
        const data = await res.json();
        const mappedTypes = typeMapping[category as string] || [];

        const filtered = data.filter((place: Place) =>
          place.types.some((t) => mappedTypes.includes(t))
        );

        setPlaces(filtered);
      } catch (error) {
        console.error('Failed to fetch places', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [category]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(10) }}>
        {/* Header with Back Button și Titlu */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: wp(3) }}
              className="p-2 rounded-full bg-neutral-100"
            >
              <ChevronLeftIcon size={wp(6)} strokeWidth={3} color="#1f2937" />
            </TouchableOpacity>
            <View>
              <Text
                style={{ fontSize: wp(6.5), lineHeight: wp(7.5) }}
                className="font-bold text-neutral-800"
              >
                {category}
              </Text>
              <Text
                className="text-neutral-400"
                style={{ fontSize: wp(3), marginTop: 2 }}
              >
                Discover the best places
              </Text>
            </View>
          </View>
        </View>

        {/* Lista locuri */}
        <View className="space-y-5 px-5">
          {places.map((place) => (
            <TouchableOpacity
              key={place.place_id}
              activeOpacity={0.8}
              style={{ marginBottom: wp(2) }}
              className="flex-row bg-neutral-100 p-3 rounded-2xl items-center shadow-sm"
            >
              {place.photo_url ? (
                <Image
                  source={{ uri: place.photo_url }}
                  style={{
                    width: wp(20),
                    height: wp(20),
                    borderRadius: wp(5),
                    marginRight: wp(3),
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: wp(20),
                    height: wp(20),
                    borderRadius: wp(5),
                    marginRight: wp(3),
                    backgroundColor: '#d1d5db',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-neutral-500">No Image</Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="font-bold text-neutral-800" style={{ fontSize: wp(4.2) }}>
                  {place.name}
                </Text>
                <Text className="text-neutral-500" style={{ fontSize: wp(3.2), marginTop: 2 }}>
                  {place.address}
                </Text>
                <Text className="text-yellow-500 font-bold mt-1" style={{ fontSize: wp(3.5) }}>
                  ⭐ {place.rating?.toFixed(1) ?? 'N/A'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryPlacesScreen;
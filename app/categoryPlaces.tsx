import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

const typeMapping: { [key: string]: string[] } = {
  '🏛 Monuments': ['tourist_attraction'],
  '🖼 Museums': ['museum'],
  '🍴 Restaurants': ['restaurant'],
  '🌳 Parks': ['park'],
  '🎭 Culture': ['theater', 'art_gallery', 'museum', 'movie_theater', 'point_of_interest'],
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

const CategoryPlacesScreen: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const mappedTypes = typeMapping[category as string] || [];

        if (mappedTypes.length > 0) {
          const tag = mappedTypes[0]; // trimite doar primul tip pentru backend
          const res = await fetch(`${BASE_URL}/places?tag=${encodeURIComponent(tag)}`);
          const data = await res.json();
          setPlaces(data);
        } else {
          setPlaces([]);
        }
      } catch (error) {
        console.error('Failed to fetch places', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchPlaces();
  }, [category]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
              backgroundColor: '#f3f4f6',
              borderRadius: 999,
              marginRight: 10,
            }}
          >
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              {category}
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              Discover the best places
            </Text>
          </View>
        </View>

        {/* Places List */}
        <View style={{ paddingHorizontal: 20 }}>
          {places.map((place) => (
            <TouchableOpacity
              key={place.place_id}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 20,
                marginBottom: 14,
                alignItems: 'center',
              }}
            >
              {place.photo_url ? (
                <Image
                  source={{ uri: place.photo_url }}
                  style={{
                    width: width * 0.22,
                    height: width * 0.22,
                    borderRadius: 12,
                    marginRight: 14,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: width * 0.22,
                    height: width * 0.22,
                    borderRadius: 12,
                    marginRight: 14,
                    backgroundColor: '#d1d5db',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#6b7280' }}>No Image</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
                  {place.name}
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {place.address}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>
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
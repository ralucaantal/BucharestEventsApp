import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../constants';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Place = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photo_url: string | null;
  user_ratings_total?: number;
};

const AllCategoriesScreen: React.FC = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allDestinations, setAllDestinations] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${BASE_URL}/places`);
        const data = await res.json();
        setAllDestinations(data);
      } catch (error) {
        console.error('Failed to fetch places', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/places?category=${encodeURIComponent(category as string)}`);
        const data = await res.json();
        setPlaces(data);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
              backgroundColor: '#f3f4f6',
              borderRadius: 999,
              marginRight: 12,
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
              onPress={() =>
                router.push({
                  pathname: '/destination',
                  params: {
                    name: place.name,
                    photo_url: place.photo_url ?? '',
                    rating: place.rating,
                    address: place.address,
                  },
                })
              }
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
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    marginTop: 4,
                  }}
                >
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

export default AllCategoriesScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BASE_URL, sortCategoryData } from '../constants';
import { theme } from '../theme';

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

type DestinationCardProps = {
  item: Place;
};

const DestinationCard: React.FC<DestinationCardProps> = ({ item }) => {
  const [isFavourite, toggleFavourite] = useState(false);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/destination',
          params: {
            name: item.name,
            photo_url: item.photo_url ?? '',
            rating: item.rating,
            address: item.address,
          },
        })
      }
      style={{
        width: width * 0.44,
        height: width * 0.65,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
      }}
      activeOpacity={0.9}
    >
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#d1d5db',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>No image</Text>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={{
          position: 'absolute',
          bottom: 0,
          height: '45%',
          width: '100%',
        }}
      />

      <TouchableOpacity
        onPress={() => toggleFavourite(!isFavourite)}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255,255,255,0.5)',
          padding: 8,
          borderRadius: 999,
        }}
      >
        <FontAwesome
          name="heart"
          size={20}
          color={isFavourite ? 'red' : 'white'}
          solid={isFavourite}
        />
      </TouchableOpacity>

      <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: width * 0.042,
            marginBottom: 4,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: '#e5e7eb',
            fontSize: width * 0.031,
            lineHeight: width * 0.04,
          }}
          numberOfLines={2}
        >
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Destinations: React.FC = () => {
  const [allDestinations, setAllDestinations] = useState<Place[]>([]);
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Popular');

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
    if (activeCategory === 'All') {
      setDestinations(allDestinations);
    } else if (activeCategory === 'Popular') {
      const popular = [...allDestinations]
        .filter((p) => (p.user_ratings_total || 0) > 0)
        .sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
      setDestinations(popular);
    } else if (activeCategory === 'Recommended') {
      const recommended = [...allDestinations]
        .filter((p) => (p.user_ratings_total || 0) > 100 && (p.rating || 0) >= 4)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setDestinations(recommended);
    } else {
      setDestinations([]);
    }
  }, [activeCategory, allDestinations]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View>
      {/* Category selector */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {sortCategoryData.map((cat, index) => {
            const isActive = cat === activeCategory;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveCategory(cat)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  marginRight: 12,
                  backgroundColor: isActive ? 'white' : '#f3f4f6',
                  borderRadius: 999,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isActive ? 0.1 : 0,
                  shadowRadius: isActive ? 3 : 0,
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: width * 0.038,
                    color: isActive ? theme.text : 'gray',
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Destination preview list (max 4) */}
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {destinations.slice(0, 4).map((item) => (
          <DestinationCard item={item} key={item.place_id} />
        ))}
      </View>

      {/* See All button */}
      {destinations.length > 4 && (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/categoryPlaces?category=${encodeURIComponent(activeCategory)}`)
            }
            style={{
              backgroundColor: theme.bg(1),
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Destinations;
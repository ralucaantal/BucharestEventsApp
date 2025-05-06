import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BASE_URL } from '../constants';
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

type Props = {
  activeCategory: string;
};

const DestinationCard: React.FC<{ item: Place }> = ({ item }) => {
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

const Destinations: React.FC<Props> = ({ activeCategory }) => {
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/places?category=${encodeURIComponent(activeCategory)}&limit=4`
        );
        const data = await res.json();
        setDestinations(data);
      } catch (error) {
        console.error('Failed to fetch places', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [activeCategory]);

  return (
    <View style={{ minHeight: 280, paddingHorizontal: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20, alignSelf: 'center' }} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {destinations.map((item) => (
            <DestinationCard item={item} key={item.place_id} />
          ))}
        </View>
      )}

      {!loading && destinations.length === 4 && (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/allCategories?category=${encodeURIComponent(activeCategory)}`)
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
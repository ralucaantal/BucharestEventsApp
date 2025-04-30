import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { HeartIcon } from 'react-native-heroicons/solid';
import { router } from 'expo-router';
import { BASE_URL, sortCategoryData } from '../constants';
import { theme } from '../theme';

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
        width: wp(44),
        height: wp(65),
        marginBottom: wp(5),
        borderRadius: wp(6),
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="relative"
      activeOpacity={0.9}
    >
      {/* Image */}
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View className="flex-1 bg-neutral-300 justify-center items-center">
          <Text>No image</Text>
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={{
          position: 'absolute',
          bottom: 0,
          height: '45%',
          width: '100%',
        }}
      />

      {/* Favorite button */}
      <TouchableOpacity
        onPress={() => toggleFavourite(!isFavourite)}
        className="absolute top-3 right-3 bg-white/50 rounded-full p-2"
      >
        <HeartIcon size={wp(4.5)} color={isFavourite ? 'red' : 'white'} />
      </TouchableOpacity>

      {/* Text overlay */}
      <View className="absolute bottom-4 left-4 right-4">
        <Text className="text-white font-bold" style={{ fontSize: wp(4.2), marginBottom: 2 }}>
          {item.name}
        </Text>
        <Text
          className="text-neutral-200"
          style={{ fontSize: wp(3.1), lineHeight: wp(4) }}
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
        setDestinations(data);
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
        .filter(p => (p.user_ratings_total || 0) > 0)
        .sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0))
        .slice(0, 20);
      setDestinations(popular);
    } else if (activeCategory === 'Recommended') {
      const recommended = [...allDestinations]
        .filter(p => (p.user_ratings_total || 0) > 100 && (p.rating || 0) >= 4)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 20);
      setDestinations(recommended);
    } else {
      setDestinations([]);
    }
  }, [activeCategory, allDestinations]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View>
      {/* Category selector */}
      <View className="px-5 mb-4">
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
                  paddingVertical: wp(2),
                  paddingHorizontal: wp(5),
                  marginRight: wp(3),
                  backgroundColor: isActive ? 'white' : '#f3f4f6',
                  borderRadius: wp(5),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isActive ? 0.1 : 0,
                  shadowRadius: isActive ? 3 : 0,
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text
                  className="font-medium"
                  style={{
                    fontSize: wp(3.8),
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

      {/* Destination list */}
      <View className="px-5 flex-row flex-wrap justify-between">
        {destinations.map((item) => (
          <DestinationCard item={item} key={item.place_id} />
        ))}
      </View>
    </View>
  );
};

export default Destinations;
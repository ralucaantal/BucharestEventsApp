import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { destinationData } from '../constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { HeartIcon } from 'react-native-heroicons/solid';
import { router } from 'expo-router';

type Item = {
  image: any;
  title: string;
  shortDescription: string;
  price: number;
  longDescription: string;
  duration: string;
  distance: string;
  weather: string;
};

type DestinationCardProps = {
  item: Item;
};

const DestinationCard: React.FC<DestinationCardProps> = ({ item }) => {
  const [isFavourite, toggleFavourite] = useState(false);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: '/destination', params: { ...item } })
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
      <Image
        source={item.image}
        resizeMode="cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

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
        <Text
          className="text-white font-bold"
          style={{ fontSize: wp(4.2), marginBottom: 2 }}
        >
          {item.title}
        </Text>
        <Text
          className="text-neutral-200"
          style={{ fontSize: wp(3.1), lineHeight: wp(4) }}
          numberOfLines={2}
        >
          {item.shortDescription}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Destinations: React.FC = () => {
  return (
    <View className="px-5 flex-row flex-wrap justify-between">
      {destinationData.map((item, index) => (
        <DestinationCard item={item} key={index} />
      ))}
    </View>
  );
};

export default Destinations;

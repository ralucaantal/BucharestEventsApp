'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { HeartIcon, MapPinIcon, StarIcon } from 'react-native-heroicons/solid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../theme';

const ios = Platform.OS === 'ios';
const topMargin = ios ? '' : 'mt-10';

const DestinationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavourite, toggleFavourite] = useState(false);

  const item = {
    image: params.photo_url,
    title: params.name,
    rating: Number(params.rating),
    address: params.address,
    description: `Discover the charm of ${params.name} located in Bucharest.`,
  };

  return (
    <View className="bg-white flex-1">
      {item.image ? (
        <Image source={{ uri: item.image as string }} style={{ width: wp(100), height: hp(55) }} />
      ) : (
        <View style={{ width: wp(100), height: hp(55), backgroundColor: '#d1d5db' }} />
      )}
      <StatusBar style="light" />

      {/* Top buttons */}
      <SafeAreaView className={`flex-row justify-between items-center w-full absolute ${topMargin}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full ml-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeftIcon size={wp(7)} strokeWidth={4} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavourite(!isFavourite)}
          className="p-2 rounded-full mr-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          <HeartIcon size={wp(7)} strokeWidth={4} color={isFavourite ? 'red' : 'white'} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <View
        style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        className="px-5 flex flex-1 justify-between bg-white pt-8 -mt-14"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-5">
          <View className="flex-row justify-between items-start">
            <Text style={{ fontSize: wp(7) }} className="font-bold flex-1 text-neutral-700">
              {item.title}
            </Text>
            <Text style={{ fontSize: wp(6.5), color: theme.text }} className="font-semibold">
              ⭐ {item.rating?.toFixed(1) ?? 'N/A'}
            </Text>
          </View>

          <Text style={{ fontSize: wp(3.7) }} className="text-neutral-700 tracking-wide mb-2">
            {item.description}
          </Text>

          <View className="flex-row space-x-2 items-start">
            <MapPinIcon size={wp(7)} color="#f87171" />
            <Text style={{ fontSize: wp(4.2) }} className="text-neutral-600 tracking-wide flex-1">
              {item.address}
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={{ backgroundColor: theme.bg(0.8), height: wp(15), width: wp(50) }}
          className="mb-6 mx-auto flex justify-center items-center rounded-full"
        >
          <Text className="text-white font-bold" style={{ fontSize: wp(5.5) }}>
            Book now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DestinationScreen;
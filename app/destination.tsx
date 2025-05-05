'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const ios = Platform.OS === 'ios';
const topMargin = ios ? 0 : 40;

const { width, height } = Dimensions.get('window');

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
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      {item.image ? (
        <Image source={{ uri: item.image as string }} style={{ width, height: height * 0.55 }} />
      ) : (
        <View style={{ width, height: height * 0.55, backgroundColor: '#d1d5db' }} />
      )}
      <StatusBar style="light" />

      {/* Top buttons */}
      <SafeAreaView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          width: '100%',
          marginTop: topMargin,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 10,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        >
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavourite(!isFavourite)}
          style={{
            padding: 10,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        >
          <FontAwesome
            name="heart"
            size={28}
            color={isFavourite ? 'red' : 'white'}
            solid={isFavourite}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingTop: 30,
          marginTop: -40,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          justifyContent: 'space-between',
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#374151', flex: 1 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '600', color: theme.text }}>
              ⭐ {item.rating?.toFixed(1) ?? 'N/A'}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 15,
              color: '#374151',
              marginTop: 10,
              marginBottom: 15,
              lineHeight: 22,
            }}
          >
            {item.description}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <MaterialIcons name="location-pin" size={24} color="#f87171" />
            <Text style={{ fontSize: 16, color: '#4b5563', flex: 1 }}>
              {item.address}
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={{
            backgroundColor: theme.bg(0.8),
            height: 55,
            width: width * 0.5,
            borderRadius: 999,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            marginTop: 16,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            Book now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DestinationScreen;
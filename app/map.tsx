import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { destinationData } from '../constants';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const screenHeight = Dimensions.get('window').height;

const normalize = (text: string) =>
  text.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const MapScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');

  const filteredMarkers = destinationData.filter((item) =>
    normalize(item.title).includes(normalize(searchText))
  );

  useEffect(() => {
    if (filteredMarkers.length === 1) {
      const place = filteredMarkers[0];

      mapRef.current?.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [filteredMarkers]);

  const handleMarkerPress = (item: any) => {
    router.push({
      pathname: '/destination',
      params: { ...item },
    });
  };

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 44.4268,
          longitude: 26.1025,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {filteredMarkers.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            title={item.title}
            onPress={() => handleMarkerPress(item)}
          />
        ))}
      </MapView>

      {/* Back Button */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
        <View className="flex-row justify-start px-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeftIcon size={wp(7)} strokeWidth={4} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View
        style={{
          position: 'absolute',
          top: screenHeight / 2 - wp(9),
          left: wp(6),
          right: wp(6),
          zIndex: 10,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            paddingHorizontal: wp(5),
            paddingVertical: wp(2.7),
            borderRadius: wp(10),
          }}
        >
          <TextInput
            placeholder="Search places..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="white"
            style={{
              fontSize: wp(4),
              color: 'white',
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default MapScreen;
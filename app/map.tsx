import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../constants'; // <-- adaugă link-ul corect spre backend

const { width, height } = Dimensions.get('window');

const normalize = (text: string) =>
  text.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const MapScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${BASE_URL}/places`);
        const data = await res.json();
        setPlaces(data);
      } catch (error) {
        console.error('Failed to fetch places', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const filteredMarkers = places.filter((item) =>
    normalize(item.name).includes(normalize(searchText))
  );

  const handleMarkerPress = (item: any) => {
    router.push({
      pathname: '/destination',
      params: { ...item },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
            title={item.name}
            onPress={() => handleMarkerPress(item)}
          />
        ))}
      </MapView>

      {/* Back Button */}
      <SafeAreaView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            padding: 10,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Search Bar */}
      <View
        style={{
          position: 'absolute',
          top: height / 2 - 36,
          left: 24,
          right: 24,
          zIndex: 10,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 999,
          }}
        >
          <TextInput
            placeholder="Search places..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="white"
            style={{
              fontSize: 16,
              color: 'white',
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default MapScreen;
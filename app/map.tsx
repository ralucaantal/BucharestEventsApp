import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../constants';

const { width, height } = Dimensions.get('window');

const normalize = (text: string) =>
  text.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const MapScreen: React.FC = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [places, setPlaces] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, eventsRes] = await Promise.all([
          fetch(`${BASE_URL}/places`),
          fetch(`${BASE_URL}/events`),
        ]);
        const [placesData, eventsData] = await Promise.all([
          placesRes.json(),
          eventsRes.json(),
        ]);
        setPlaces(placesData);
        setEvents(eventsData);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlaces = places.filter((item) =>
    normalize(item.name).includes(normalize(searchText))
  );

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
        showsUserLocation
        initialRegion={{
          latitude: 44.4268,
          longitude: 26.1025,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {filteredPlaces.map((item, index) => (
          <Marker
            key={`place-${index}`}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.name}
            description={item.types?.[0] || item.address}
            pinColor="#1f2937"
          />
        ))}
        {events.map((ev, index) => (
          <Marker
            key={`event-${index}`}
            coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
            title={ev.title}
            description={new Date(ev.date).toLocaleString()}
            pinColor="#2563eb"
          />
        ))}
      </MapView>

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 10,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10 }}>
        <View
          style={{
            backgroundColor: '#f3f4f6',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Feather name="search" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search places..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
            style={{ marginLeft: 10, flex: 1, fontSize: 16, color: '#1f2937' }}
          />
        </View>
      </View>
    </View>
  );
};

export default MapScreen;
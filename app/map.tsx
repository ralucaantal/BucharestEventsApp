import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../constants';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimină diacritice
    .replace(/[^\w\s]/gi, '')        // elimină caractere speciale
    .replace(/\s+/g, ' ');           // normalizează spațiile

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  interface Place {
    latitude: number;
    longitude: number;
    name: string;
    types?: string[];
    address?: string;
  }

  interface Event {
    latitude: number;
    longitude: number;
    title: string;
    date: string;
  }

  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

        if (isMounted) {
          setPlaces(placesData);
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('❌ Error fetching map data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const text = normalize(searchText);

  const filteredPlaces = places.filter(item => {
    const name = normalize(item.name);
    return (
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      (name.startsWith(text) ||
        name.includes(text) ||
        text.split(' ').every(word => name.includes(word)))
    );
  });

  const validEvents = events.filter(
    ev =>
      typeof ev.latitude === 'number' &&
      typeof ev.longitude === 'number' &&
      ev.date
  );

  const noResults = searchText && filteredPlaces.length === 0;

  // recentrare harta pe primul loc filtrat
  useEffect(() => {
    if (searchText && filteredPlaces.length > 0 && mapRef.current) {
      const { latitude, longitude } = filteredPlaces[0];
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [searchText]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.name}
              description={item.types?.[0] || item.address}
              pinColor="#1f2937"
            />
          ))}

          {validEvents.map((ev, index) => (
            <Marker
              key={`event-${index}`}
              coordinate={{
                latitude: ev.latitude,
                longitude: ev.longitude,
              }}
              title={ev.title}
              description={new Date(ev.date).toLocaleString()}
              pinColor="#2563eb"
            />
          ))}
        </MapView>

        {noResults && (
          <View
            style={{
              position: 'absolute',
              top: 130,
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white' }}>No places found.</Text>
          </View>
        )}

        <SafeAreaView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: 10,
              borderRadius: 999,
              alignSelf: 'flex-start',
              marginBottom: 12,
            }}
          >
            <Feather name="chevron-left" size={28} color="white" />
          </TouchableOpacity>

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
              style={{
                marginLeft: 10,
                flex: 1,
                fontSize: 16,
                color: '#1f2937',
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
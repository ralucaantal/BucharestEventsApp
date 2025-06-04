import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import mapStyle from "../assets/mapStyle.json";
import { BASE_URL } from "../constants";
import * as Location from "expo-location";

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ");

function getWeatherEmoji(description: string) {
  const desc = description.toLowerCase();
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("clouds")) return "☁️";
  if (desc.includes("few clouds")) return "🌤️";
  if (desc.includes("scattered clouds")) return "🌥️";
  if (desc.includes("broken clouds")) return "☁️";
  if (desc.includes("overcast")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("drizzle")) return "🌦️";
  if (desc.includes("thunderstorm")) return "⛈️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("mist")) return "🌫️";
  if (desc.includes("fog")) return "🌁";
  if (desc.includes("haze")) return "🌫️";
  if (desc.includes("smoke")) return "💨";
  if (desc.includes("dust") || desc.includes("sand")) return "🌪️";
  if (desc.includes("tornado")) return "🌪️";
  return "❓";
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [places, setPlaces] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    icon: string;
  } | null>(null);

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Location permission denied");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    })();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [placesRes, eventsRes, weatherRes] = await Promise.all([
          fetch(`${BASE_URL}/places`),
          fetch(`${BASE_URL}/events`),
          fetch(`${BASE_URL}/current-weather`),
        ]);
        const [placesData, eventsData, weatherData] = await Promise.all([
          placesRes.json(),
          eventsRes.json(),
          weatherRes.json(),
        ]);
        if (isMounted) {
          setPlaces(placesData);
          setEvents(eventsData);
          setWeather(weatherData);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearSearch = () => {
    setSearchText("");
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }
  };

  const text = normalize(searchText);
  const filteredPlaces = places.filter((item) => {
    const name = normalize(item.name);
    return (
      typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      (name.startsWith(text) ||
        name.includes(text) ||
        text.split(" ").every((word) => name.includes(word)))
    );
  });

  const validEvents = events.filter(
    (ev) =>
      typeof ev.latitude === "number" &&
      typeof ev.longitude === "number" &&
      ev.date
  );

  const noResults = searchText && filteredPlaces.length === 0;

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

  if (loading || !location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            showsUserLocation
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
            <Marker
              coordinate={location}
              title="You are here"
              pinColor="#ff5d9e"
            />
            {filteredPlaces.map((item, index) => (
              <Marker
                key={`place-${index}`}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.name}
                description={item.types?.[0] || item.address}
                pinColor="#7574c0"
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
                pinColor="#9333ea"
              />
            ))}
          </MapView>

          {/* Weather indicator + location button */}
          {weather && (
            <View className="absolute bottom-10 right-4 flex-row items-center space-x-6 z-20">
              <TouchableOpacity
                onPress={goToCurrentLocation}
                className="bg-white p-3 right-7 rounded-full shadow-md">
                <Feather name="crosshair" size={20} color="#ff5d9e" />
              </TouchableOpacity>

              <View className="bg-[#7574c0] right-4 px-5 py-4 rounded-xl shadow-md flex-row items-center">
                <Text className="text-white font-semibold">
                  {getWeatherEmoji(weather.description)}{" "}
                  {Math.round(weather.temp)}°C
                </Text>
              </View>
            </View>
          )}

          {/* No results */}
          {noResults && (
            <View className="absolute top-32 self-center bg-black/70 px-4 py-2 rounded-md">
              <Text className="text-white">No places found.</Text>
            </View>
          )}

          {/* Search and back button */}
          <SafeAreaView className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#7574c0] p-2 rounded-full self-start mb-3">
              <Feather name="chevron-left" size={28} color="white" />
            </TouchableOpacity>

            <View className="bg-[#ede9fe] flex-row items-center px-5 py-3 rounded-2xl shadow-md">
              {searchText !== "" ? (
                <TouchableOpacity onPress={clearSearch}>
                  <Feather name="x" size={20} color="#6b7280" />
                </TouchableOpacity>
              ) : (
                <Feather name="search" size={20} color="#6b7280" />
              )}
              <TextInput
                placeholder="Search places..."
                placeholderTextColor="#6b7280"
                value={searchText}
                onChangeText={setSearchText}
                className="ml-3 flex-1 text-base text-[#1f2937]"
              />
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

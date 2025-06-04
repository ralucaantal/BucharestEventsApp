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
  Image,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import mapStyle from "../assets/mapStyle.json";
import { BASE_URL } from "../constants";
import * as Location from "expo-location";
import { categoriesData } from "../constants";

const typeToCategoryMap: Record<string, { title: string; image: any }> = {
  tourist_attraction: categoriesData[0], // 🏛 Monuments
  museum: categoriesData[1],
  restaurant: categoriesData[2],
  park: categoriesData[3],
  movie_theater: categoriesData[5],
  cafe: categoriesData[6],
  bar: categoriesData[7],
  shopping_mall: categoriesData[8],
  store: categoriesData[8],
  supermarket: categoriesData[8],
  art_gallery: categoriesData[9],
  library: categoriesData[10],
  spa: categoriesData[11],
  gym: categoriesData[11],
  beauty_salon: categoriesData[11],
};

function openNavigationApp(lat: number, lon: number, label: string) {
  const iosUrl = `maps://?daddr=${lat},${lon}&dirflg=d`;
  const androidUrl = `google.navigation:q=${lat},${lon}`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

  const url = Platform.OS === "ios" ? iosUrl : androidUrl;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        return Linking.openURL(webUrl);
      }
    })
    .catch((err) => {
      console.error("Navigation error:", err);
      Alert.alert("Error", "Could not open navigation app.");
    });
}

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    if (text.length > 1) {
      const limitedSuggestions = filteredPlaces.slice(0, 3);
      setSuggestions(limitedSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

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

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const validEvents = events.filter((ev) => {
    if (
      typeof ev.latitude !== "number" ||
      typeof ev.longitude !== "number" ||
      !ev.date
    ) {
      return false;
    }
    const eventDate = new Date(ev.date);
    const eventDay = eventDate.toISOString().split("T")[0];
    return eventDay === today && eventDate > now;
  });

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
            <Marker coordinate={location} pinColor="#ff5d9e">
              <Callout tooltip>
                <View className="bg-white p-3 rounded-xl shadow-lg w-56 items-center">
                  <Text className="text-lg font-bold text-[#ff5d9e] text-center">
                    🧭 You are here
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1 text-center">
                    This is your current location on the map.
                  </Text>
                </View>
              </Callout>
            </Marker>

            {filteredPlaces.map((item, index) => (
              <Marker
                key={`place-${index}`}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                pinColor="#7574c0">
                <Callout
                  tooltip
                  onPress={() => {
                    Alert.alert(item.name, "Curious how to reach this spot?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Navigate",
                        onPress: () =>
                          openNavigationApp(
                            item.latitude,
                            item.longitude,
                            item.name
                          ),
                      },
                    ]);
                  }}>
                  <View
                    className="bg-white p-3 rounded-xl shadow-lg w-64 items-center"
                    pointerEvents="auto">
                    <Text className="font-bold text-lg text-[#4b0082] text-center">
                      {item.name}
                    </Text>
                    {typeToCategoryMap[item.types?.[0]]?.image && (
                      <View className="my-2">
                        <Image
                          source={typeToCategoryMap[item.types?.[0]].image}
                          style={{
                            width: 60,
                            height: 60,
                            resizeMode: "contain",
                          }}
                        />
                      </View>
                    )}
                    <Text className="text-sm text-gray-600 text-center">
                      {typeToCategoryMap[item.types?.[0]]?.title ||
                        item.address}
                    </Text>

                    {item.rating && item.user_ratings_total && (
                      <Text className="text-sm text-yellow-600 mt-1 text-center">
                        ⭐ {item.rating} ({item.user_ratings_total} review
                        {item.user_ratings_total === 1 ? "" : "s"})
                      </Text>
                    )}

                    {item.price_level && (
                      <Text className="text-xs text-gray-500 mt-1 text-center">
                        💰{" "}
                        {{
                          1: "Cheap",
                          2: "Moderate",
                          3: "Expensive",
                          4: "Very expensive",
                        }[item.price_level as 1 | 2 | 3 | 4] || "Unknown"}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={() =>
                        openNavigationApp(
                          item.latitude,
                          item.longitude,
                          item.name
                        )
                      }
                      className="mt-3 bg-[#4b0082] px-4 py-2 rounded">
                      <Text className="text-white text-center font-semibold">
                        Navigate
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}

            {validEvents.map((ev, index) => (
              <Marker
                key={`event-${index}`}
                coordinate={{
                  latitude: ev.latitude,
                  longitude: ev.longitude,
                }}
                pinColor="#9333ea">
                <Callout
                  tooltip
                  onPress={() =>
                    Alert.alert(
                      "Open tickets page?",
                      "You are about to leave the app to view ticket details. Do you want to continue?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Yes",
                          onPress: () => Linking.openURL(ev.url),
                        },
                      ]
                    )
                  }>
                  <View
                    className="bg-white p-3 rounded-xl shadow-lg w-64 items-center"
                    pointerEvents="auto">
                    <Text className="font-bold text-lg text-[#4b0082] text-center">
                      {ev.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1 text-center">
                      {new Date(ev.date).toLocaleDateString("en-EN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>

                    {ev.url && (
                      <TouchableOpacity className="mt-3 bg-[#4b0082] px-4 py-2 rounded">
                        <Text className="text-white text-center font-semibold">
                          🎟 Tickets
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

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

          {noResults && (
            <View className="absolute inset-0 justify-center items-center">
              <View className="bg-[#7574c0] px-6 py-3 rounded-2xl shadow-md">
                <Text className="text-white font-semibold text-base text-center">
                  No places found.
                </Text>
              </View>
            </View>
          )}

          <SafeAreaView className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#7574c0] p-2 rounded-full self-start mb-3">
              <Feather name="chevron-left" size={28} color="white" />
            </TouchableOpacity>

            <View className="flex-row items-center bg-white rounded-full shadow-md px-4 py-2 border border-gray-200">
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Search for places..."
                placeholderTextColor="#9ca3af"
                value={searchText}
                onChangeText={setSearchText}
              />
              {suggestions.length > 0 && (
                <View className="absolute top-28 left-4 right-4 z-30 bg-white rounded-xl shadow-lg">
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={`suggestion-${index}`}
                      onPress={() => {
                        setSearchText(""); // închide sugestiile
                        setSuggestions([]);

                        // Focalizează harta
                        mapRef.current?.animateToRegion({
                          latitude: item.latitude,
                          longitude: item.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        });

                      }}
                      className="px-4 py-3 border-b border-gray-100">
                      <Text className="text-gray-800 font-medium">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {searchText !== "" && (
                <TouchableOpacity
                  onPress={clearSearch}
                  className="ml-2 bg-gray-200 rounded-full p-1.5">
                  <Feather name="x" size={16} color="#374151" />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme";
import { BASE_URL } from "../constants";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import mapStyle from "../assets/mapStyle.json";
import { Dimensions } from "react-native";

const { height } = Dimensions.get("window");

interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

const SuggestItineraryScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [startingTime, setStartingTime] = useState("08:00");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [themeValue, setThemeValue] = useState("");
  const [tags, setTags] = useState("");
  const [showAddStopInput, setShowAddStopInput] = useState(false);
  const [stopSearch, setStopSearch] = useState("");
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedStops, setSelectedStops] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/places`)
      .then((res) => res.json())
      .then((data: Place[]) => {
        if (Array.isArray(data)) {
          setAllPlaces(data);
        }
      });
  }, []);

  const hourOptions = Array.from({ length: 30 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  });

  const handleAddStop = (place: Place) => {
    if (!selectedStops.some((p) => p.name === place.name)) {
      setSelectedStops([...selectedStops, place]);
    }
    setShowAddStopInput(false);
    setStopSearch("");
    setFilteredPlaces([]);
  };

  const handleRemoveStop = (place: Place) => {
    setSelectedStops(selectedStops.filter((p) => p.name !== place.name));
  };

  const moveStop = (index: number, direction: number) => {
    const newStops = [...selectedStops];
    const target = index + direction;
    if (target < 0 || target >= newStops.length) return;
    [newStops[index], newStops[target]] = [newStops[target], newStops[index]];
    setSelectedStops(newStops);
  };

  const handleSubmit = async () => {
    if (!title || !description || !startingTime || selectedStops.length === 0) return;
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/suggested-itineraries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          startingTime,
          stops: selectedStops.map((p) => p.name),
          budget,
          duration,
          theme: themeValue,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      router.back();
    } catch (err) {
      console.error("❌ Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white px-3">
        <ScrollView className="pb-20 px-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="flex-row items-center pt-5 pb-3">
            <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-gray-100 mr-3">
              <Feather name="chevron-left" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Suggest Itinerary</Text>
          </View>

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Title</Text>
          <TextInput className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700" placeholder="Title..." value={title} onChangeText={setTitle} />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Description</Text>
          <TextInput className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-700" placeholder="Short description..." value={description} onChangeText={setDescription} multiline />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Theme</Text>
          <TextInput className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700" placeholder="e.g. Cultural, Romantic" value={themeValue} onChangeText={setThemeValue} />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Tags (comma-separated)</Text>
          <TextInput className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700" placeholder="e.g. park, museum, kids" value={tags} onChangeText={setTags} />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Approximate Budget (RON)</Text>
          <TextInput className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700" placeholder="e.g. 100" value={budget} onChangeText={setBudget} keyboardType="numeric" />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-1">Estimated Duration (hours)</Text>
          <TextInput className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700" placeholder="e.g. 3" value={duration} onChangeText={setDuration} keyboardType="numeric" />

          {/* Difficulty */}
          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">Difficulty</Text>
          <View className="flex-row gap-3 mb-4">
            {["easy", "moderate", "hard"].map((level) => (
              <TouchableOpacity key={level} onPress={() => setDifficulty(level)} className="px-4 py-2 rounded-full border" style={{ backgroundColor: difficulty === level ? theme.buttons1 : "#f3f4f6" }}>
                <Text className={difficulty === level ? "text-white" : "text-gray-700"}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Starting Time */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">Starting Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 12 }}>
            {hourOptions.map((option) => (
              <TouchableOpacity key={option} onPress={() => setStartingTime(option)} className="w-20 py-2 rounded-full border items-center justify-center" style={{ backgroundColor: startingTime === option ? theme.buttons2 : undefined }}>
                <Text className={startingTime === option ? "text-white font-bold" : "text-gray-700"}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stops and Map */}
          <Text className="text-sm font-semibold text-gray-700 mt-6 mb-1">Stops</Text>
          {selectedStops.map((place, idx) => (
            <View key={`${place.name}-${idx}`} className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-full px-4 py-2">
              <Text className="text-gray-800 flex-1">{idx + 1}. {place.name}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => moveStop(idx, -1)}>
                  <Feather name="arrow-up" size={18} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveStop(idx, 1)}>
                  <Feather name="arrow-down" size={18} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveStop(place)}>
                  <Feather name="x" size={18} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {showAddStopInput ? (
            <View className="mb-4">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-2">
                <TextInput
                  className="flex-1 text-base text-gray-700"
                  placeholder="Search a place..."
                  value={stopSearch}
                  onChangeText={(text) => {
                    setStopSearch(text);
                    setFilteredPlaces(
                      allPlaces.filter(
                        (p) => p.name.toLowerCase().includes(text.toLowerCase()) && !selectedStops.some((s) => s.name === p.name)
                      )
                    );
                  }}
                />
                <TouchableOpacity onPress={() => setShowAddStopInput(false)}>
                  <Feather name="x" size={20} color="gray" />
                </TouchableOpacity>
              </View>
              {filteredPlaces.slice(0, 5).map((place, idx) => (
                <TouchableOpacity
                  key={`${place.name}-${idx}`}
                  onPress={() => handleAddStop(place)}
                  className="py-2 px-4 border-b border-gray-200"
                >
                  <Text className="text-gray-800">{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowAddStopInput(true)} className="flex-row gap-2 items-center mt-2 mb-4">
              <Feather name="plus-circle" size={24} color={theme.buttons1} />
              <Text className="text-base font-semibold text-gray-800">Add Stop</Text>
            </TouchableOpacity>
          )}

          {selectedStops.length > 0 && (
            <View style={{ height: height * 0.35, marginBottom: 20, borderRadius: 20, overflow: "hidden" }} className="mx-4">
              <MapView
                style={{ flex: 1 }}
                provider="google"
                customMapStyle={mapStyle}
                initialRegion={{
                  latitude: selectedStops[0].latitude,
                  longitude: selectedStops[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {selectedStops.map((place, index) => (
                  <Marker
                    key={`${place.name}-${index}`}
                    coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                    title={place.name}
                  >
                    <View
                      style={{
                        backgroundColor: theme.buttons2,
                        borderRadius: 20,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: "white",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>{index + 1}</Text>
                    </View>
                  </Marker>
                ))}
                <Polyline
                  coordinates={selectedStops.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
                  strokeWidth={2}
                  strokeColors={["#ff5d9e"]}
                />
              </MapView>
            </View>
          )}

          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="mt-8 py-3 px-6 rounded-full self-center" style={{ backgroundColor: theme.buttons1 }}>
            <Text className="text-white font-bold text-base">{loading ? "Submitting..." : "Submit Itinerary"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SuggestItineraryScreen;
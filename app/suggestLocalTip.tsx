"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { theme } from "../theme";
import { BASE_URL } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

interface Place {
  place_id: string;
  name: string;
}

export default function SuggestLocalTipScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState<
    { place_id: string; name: string; comment: string }[]
  >([]);

  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [showAddPlaceInput, setShowAddPlaceInput] = useState(false);
  const [placeSearch, setPlaceSearch] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/places`)
      .then((res) => res.json())
      .then((data) => setAllPlaces(data || []));
  }, []);

  const handleAddPlace = (place: Place) => {
    if (places.some((p) => p.place_id === place.place_id)) return;
    setPlaces((prev) => [...prev, { ...place, comment: "" }]);
    setShowAddPlaceInput(false);
    setPlaceSearch("");
    setFilteredPlaces([]);
  };

  const handleRemovePlace = (place_id: string) => {
    setPlaces((prev) => prev.filter((p) => p.place_id !== place_id));
  };

  const movePlace = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= places.length) return;
    const newPlaces = [...places];
    [newPlaces[index], newPlaces[target]] = [newPlaces[target], newPlaces[index]];
    setPlaces(newPlaces);
  };

  const handleSubmit = async () => {
    if (!title || !emoji || !description || places.length === 0) {
      Alert.alert("Error", "Please complete all fields and add at least one place.");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/suggest-local-tip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        emoji,
        description,
        items: places.map((p, i) => ({
          place_id: p.place_id,
          rank: i + 1,
          comment: p.comment,
        })),
      }),
    });

    if (res.ok) {
      Alert.alert("Success", "Your suggestion was submitted!");
      router.back();
    } else {
      const err = await res.json();
      Alert.alert("Error", err?.error || "Submission failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white px-6">
        <ScrollView
          className="pt-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-100 rounded-full mr-3">
              <Feather name="chevron-left" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              Suggest a Local Tip
            </Text>
          </View>

          <Text className="text-sm font-semibold text-gray-700 mb-1">Title</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 mb-3"
            placeholder="Ex: Best Ice Cream Spots 🍦"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="text-sm font-semibold text-gray-700 mb-1">Emoji</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 mb-3"
            placeholder="Ex: 😋"
            value={emoji}
            onChangeText={setEmoji}
          />

          <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
            placeholder="Write a short description..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">
            📍 Places in this Tip
          </Text>

          {places.map((p, index) => (
            <View
              key={p.place_id}
              className="mb-4 bg-gray-100 rounded-xl px-4 py-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-800 font-semibold">
                  {index + 1}. {p.name}
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => movePlace(index, -1)}>
                    <Feather name="arrow-up" size={18} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => movePlace(index, 1)}>
                    <Feather name="arrow-down" size={18} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemovePlace(p.place_id)}>
                    <Feather name="x" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                placeholder="Optional comment for this place..."
                value={p.comment}
                onChangeText={(text) =>
                  setPlaces((prev) =>
                    prev.map((item) =>
                      item.place_id === p.place_id ? { ...item, comment: text } : item
                    )
                  )
                }
                className="bg-white rounded-md px-3 py-2 mt-1 text-sm text-gray-700"
                multiline
              />
            </View>
          ))}

          {showAddPlaceInput ? (
            <View className="mb-4">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-2">
                <TextInput
                  className="flex-1 text-base text-gray-700"
                  placeholder="Search a place..."
                  value={placeSearch}
                  onChangeText={(text) => {
                    setPlaceSearch(text);
                    setFilteredPlaces(
                      allPlaces.filter(
                        (p) =>
                          p.name.toLowerCase().includes(text.toLowerCase()) &&
                          !places.some((s) => s.place_id === p.place_id)
                      )
                    );
                  }}
                />
                <TouchableOpacity onPress={() => setShowAddPlaceInput(false)}>
                  <Feather name="x" size={20} color="gray" />
                </TouchableOpacity>
              </View>
              {filteredPlaces.slice(0, 5).map((place, idx) => (
                <TouchableOpacity
                  key={`${place.place_id}-${idx}`}
                  onPress={() => handleAddPlace(place)}
                  className="py-2 px-4 border-b border-gray-200">
                  <Text className="text-gray-800">{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddPlaceInput(true)}
              className="flex-row gap-2 items-center mt-2 mb-4">
              <Feather name="plus-circle" size={24} color={theme.buttons1} />
              <Text className="text-base font-semibold text-gray-800">
                Add Place
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: theme.buttons2 }}
            className="self-start rounded-full py-3 px-6 mt-6">
            <Text className="text-white font-bold text-base">Submit Tip</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const ItineraryQuestionnaireScreen: React.FC = () => {
  const router = useRouter();
  const [departureHour, setDepartureHour] = useState("07:30");
  const [meals, setMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [customObjective, setCustomObjective] = useState("");
  const [startingLocation, setStartingLocation] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [weather, setWeather] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const hourOptions = Array.from({ length: 32 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  });

  useEffect(() => {
    fetch(`${BASE_URL}/current-weather`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.description) setWeather(data.description);
      })
      .catch((err) => console.error("Failed to fetch weather", err));
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!departureHour || interests.length === 0) {
      Alert.alert(
        "Missing info",
        "Please fill at least departure time and activities."
      );
      return;
    }

    setLoading(true);

    const mealList = Object.entries(meals)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join(", ");

    const prompt = `Create a one-day itinerary in Bucharest. The user will leave at ${departureHour} from ${
      startingLocation || "an unknown location"
    }, wants to do: ${interests.join(", ")}, prefers to eat: ${
      mealList || "no specific meals"
    }. Weather is: ${weather}. Must include: ${
      customObjective || "no specific places"
    }. Additional notes: ${extraNotes || "none"}. Return as a numbered list.`;

    try {
      const res = await fetch(`${BASE_URL}/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.itinerary);
      await AsyncStorage.setItem("lastItinerary", data.itinerary);
    } catch (err) {
      Alert.alert("Error", "Failed to generate itinerary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="pb-20 px-5">
        {/* Header */}
        <View className="flex-row items-center pt-5 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100 mr-3">
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              Virtual Guide 🤖
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Plan your perfect day in Bucharest
            </Text>
          </View>
        </View>

        {/* Robot image */}
        <View className="items-center my-6">
          <Image
            source={require("../assets/images/guide.png")}
            className="w-48 h-48 rounded-full border-2 border-gray-200"
            resizeMode="contain"
          />
        </View>

        {/* Departure Time */}
        <Text className="font-semibold text-gray-700 mb-2">
          When do you want to leave?
        </Text>
        <View className="pl-2 pr-4 py-3 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-x-4">
            {hourOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setDepartureHour(option)}
                className={`px-4 py-2 mr-2 rounded-full border ${
                  departureHour === option ? "" : "bg-white"
                }`}
                style={
                  departureHour === option
                    ? { backgroundColor: theme.buttons2 }
                    : {}
                }>
                <Text
                  className={`text-sm ${
                    departureHour === option
                      ? "text-white font-bold"
                      : "text-gray-700"
                  }`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Starting location */}
        <Text className="font-semibold text-gray-700 mb-2">
          Where do you want to leave from?
        </Text>
        <TextInput
          className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700 mb-4"
          placeholder="Ex: hotel, home, or a metro station"
          value={startingLocation}
          onChangeText={setStartingLocation}
        />

        {/* Meals */}
        <Text className="font-semibold text-gray-700 mb-2">
          Do you want to eat?
        </Text>
        <View className="flex-row gap-x-3 mb-4">
          {Object.keys(meals).map((meal) => {
            const selected = meals[meal as keyof typeof meals];
            return (
              <TouchableOpacity
                key={meal}
                className="px-4 py-2 rounded-full border"
                style={
                  selected
                    ? { backgroundColor: theme.buttons2 }
                    : { backgroundColor: "#f3f4f6" }
                }
                onPress={() =>
                  setMeals((prev) => ({
                    ...prev,
                    [meal]: !prev[meal as keyof typeof meals],
                  }))
                }>
                <Text className={selected ? "text-white" : "text-gray-700"}>
                  {meal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pre-planned objective */}
        <Text className="font-semibold text-gray-700 mb-2">
          Already planned something?
        </Text>
        <TextInput
          className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700 mb-4"
          placeholder="Ex: National Museum"
          value={customObjective}
          onChangeText={setCustomObjective}
        />

        {/* Interests */}
        <Text className="font-semibold text-gray-700 mb-2">
          What do you want to do?
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            "museums",
            "parks",
            "cafes",
            "art galleries",
            "shopping",
            "local food",
          ].map((item) => {
            const selected = interests.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggleInterest(item)}
                className="px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: selected ? theme.buttons2 : "#f3f4f6",
                }}>
                <Text className={selected ? "text-white" : "text-gray-700"}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Extra Notes */}
        <Text className="font-semibold text-gray-700 mb-2">
          Anything else we should know?
        </Text>
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-700 mb-6"
          placeholder="Write additional preferences or constraints..."
          value={extraNotes}
          onChangeText={setExtraNotes}
          multiline
        />

        {/* Generate */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading}
          className="py-4 rounded-full shadow-md mb-16"
          style={{ backgroundColor: theme.buttons1 }}>
          <Text className="text-center text-white font-bold text-base">
            {loading ? "Generating..." : "Generate Itinerary"}
          </Text>
        </TouchableOpacity>

        {response !== "" && (
          <View className="mt-8">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Your Suggested Itinerary:
            </Text>
            {response.split("\n").map((step, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                className="flex-row bg-gray-100 px-4 py-3 rounded-2xl mb-4 items-start">
                <View
                  className="w-7 h-7 rounded-full mr-4 items-center justify-center"
                  style={{ backgroundColor: theme.buttons2 }}>
                  <Text className="text-white font-bold text-sm">
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  {step.replace(/^\d+\.\s*/, "")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItineraryQuestionnaireScreen;

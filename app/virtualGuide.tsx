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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const ItineraryQuestionnaireScreen: React.FC = () => {
  const router = useRouter();
  const [departureHour, setDepartureHour] = useState("08:00");
  const [returnHour, setReturnHour] = useState("13:00");
  const [meals, setMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [customObjectives, setCustomObjectives] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [startingLocation, setStartingLocation] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [weather, setWeather] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState("walk");
  const [isFromStorage, setIsFromStorage] = useState(false);

  const [zones, setZones] = useState<string[]>([]);

  // în useEffect
  useEffect(() => {
    fetch(`${BASE_URL}/zones`)
      .then((res) => res.json())
      .then((data) => {
        setZones(data.map((z: any) => z.name));
      });
  }, []);

  const hourOptions = Array.from({ length: 30 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  });

  const handleClear = () => {
    Alert.alert("Clear form", "Are you sure you want to reset all fields?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setDepartureHour("08:00");
          setReturnHour("13:00");
          setMeals({ breakfast: false, lunch: false, dinner: false });
          setCustomObjectives([]);
          setCustomInput("");
          setStartingLocation("");
          setExtraNotes("");
          setInterests([]);
          setFilteredPlaces([]);
        },
      },
    ]);
  };

  useEffect(() => {
    const loadLastItinerary = async () => {
      const last = await AsyncStorage.getItem("lastItinerary");
      if (last) {
        setResponse(last);
        setIsFromStorage(true);
      }
    };
    loadLastItinerary();
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/current-weather`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.description) setWeather(data.description);
      })
      .catch((err) => console.error("Failed to fetch weather", err));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/places`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const uniquePlaces = Array.from(
            new Set(data.map((p: any) => p?.name).filter(Boolean))
          );
          setPlaces(uniquePlaces);
        } else {
          setPlaces([]);
        }
      })

      .catch(() => setPlaces([]));
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const getInstructionIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("walk")) return "🚶";
    if (lower.includes("metro") || lower.includes("subway")) return "🚇";
    if (lower.includes("bus")) return "🚌";
    if (lower.includes("tram")) return "🚋";
    if (lower.includes("taxi") || lower.includes("uber")) return "🚖";
    if (lower.includes("bike")) return "🚲";
    return "🧭";
  };

  const renderItinerary = () => {
    if (!response) return null;

    const lines = response
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    let stepNumber = 1;
    const blocks = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Elimină prefixe gen "1.", "-", "•"
      line = line.replace(/^(\d+[\.:]|\-|\•)?\s*/, "");

      // Detectează instrucțiunile oriunde în text
      const isInstruction = line.toLowerCase().startsWith("instructions:");

      if (isInstruction) {
        const instruction = line.replace(/^instructions:\s*/i, "");

        blocks.push(
          <View
            key={`inst-${i}`}
            className="px-4 py-2 rounded-md mb-3 mx-2 border-l-4"
            style={{
              backgroundColor: `${theme.buttons1}20`, // 12% opacitate pentru un fundal deschis
              borderColor: theme.buttons1,
            }}>
            <Text style={{ color: theme.buttons1, fontWeight: "600" }}>
              {getInstructionIcon(instruction)} {instruction}
            </Text>
          </View>
        );
      } else {
        blocks.push(
          <View
            key={`step-${i}`}
            className="flex-row bg-gray-100 px-4 py-3 rounded-2xl mb-4 items-start">
            <View
              className="w-7 h-7 rounded-full mr-4 items-center justify-center"
              style={{ backgroundColor: theme.buttons2 }}>
              <Text className="text-white font-bold text-sm">{stepNumber}</Text>
            </View>
            <Text className="flex-1 text-base text-gray-800 leading-6">
              {line}
            </Text>
          </View>
        );

        stepNumber++;
      }
    }

    return blocks;
  };

  const handleGenerate = async () => {
    if (!departureHour || interests.length === 0) {
      Alert.alert(
        "Missing info",
        "Please fill at least departure time and activities."
      );
      return;
    }

    if (departureHour >= returnHour) {
      Alert.alert("Invalid hours", "Return time must be after departure time.");
      return;
    }

    setLoading(true);

    const mealList = Object.entries(meals)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join(", ");

    const transportNote =
      transportMode === "walk"
        ? "Use only walking between locations. Do not suggest any kind of vehicle, taxi, or public transport."
        : transportMode === "public transport"
        ? "Use only public transport (bus, tram, metro) and walking. Do not suggest taxi, Uber, or Bolt."
        : "You may suggest walking, public transport, or taxi (e.g., Bolt or Uber), depending on what is most efficient.";

    const prompt = `Create a one-day itinerary in Bucharest. The user will leave at ${departureHour} from ${
      startingLocation || "an unknown location"
    } and must return to the same location by ${returnHour}. The itinerary must fit strictly within this time interval. They want to do: ${interests.join(
      ", "
    )}. **IMPORTANT: The user selected only the following meals: ${
      mealList || "no meals"
    }. You must include exactly these meals and no others. Do NOT suggest additional meals or snacks.** Weather is: ${weather}. Must include: ${
      customObjectives.join(", ") || "no specific places"
    }. Additional notes: ${extraNotes || "none"}.

➡️ The first step of the itinerary must clearly indicate the departure from "${
      startingLocation || "an unknown location"
    }" at ${departureHour}. It must describe what the user should do immediately after leaving this area (e.g., walk to X or take Y transport). Do not skip this step.

Return the itinerary as a numbered list. For each step:
- If needed, first write a line starting with 'Instructions: ...' to describe how to get to this location from the previous one
- Then on the next line, specify the exact time and the activity, using real, specific places in Bucharest (e.g., '08:30 - Visit Carol Park', '09:15 - Have coffee at Beans & Dots')

Avoid vague phrases like 'a park', 'a museum', 'a café' — always name a specific place in Bucharest.
Make sure the schedule is realistic and fits strictly between ${departureHour} and ${returnHour}.
${transportNote}`;

    try {
      const res = await fetch(`${BASE_URL}/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.itinerary);
      setIsFromStorage(false);
      await AsyncStorage.setItem("lastItinerary", data.itinerary);
    } catch (err) {
      Alert.alert("Error", "Failed to generate itinerary.");
    } finally {
      setLoading(false);
    }
  };

  const [searchZone, setSearchZone] = useState("");

  const filteredZones = startingLocation
    ? [startingLocation] // afișează doar zona selectată
    : zones.filter((zone) =>
        zone.toLowerCase().includes(searchZone.toLowerCase())
      );

  const toggleZone = (zone: string) => {
    if (startingLocation === zone) {
      setStartingLocation(""); // deselectează
      setSearchZone(""); // opțional: șterge și căutarea
    } else {
      setStartingLocation(zone); // selectează
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="px-5 pb-20">
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

          <View className="items-center my-6">
            <Image
              source={require("../assets/images/guide.png")}
              className="w-48 h-48 rounded-full border-2 border-gray-200"
              resizeMode="contain"
            />
            <Text className="mt-3 px-6 text-center text-lg font-semibold text-gray-800">
              Hi, I’m Pathi! 🫶 What kind of adventure are you up for today? 👀
            </Text>
          </View>

          <Text className="font-semibold text-gray-700 mb-2">
            When do you want to leave?
          </Text>
          <View className="pl-1 pr-4 py-3 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingRight: 16,
              }}>
              {hourOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setDepartureHour(option)}
                  className={`w-20 py-2 rounded-full border items-center justify-center ${
                    departureHour === option ? "" : "bg-white"
                  }`}
                  style={{
                    backgroundColor:
                      departureHour === option ? theme.buttons2 : undefined,
                  }}>
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

          <Text className="font-semibold text-gray-700 mb-2">
            When do you want to return?
          </Text>
          <View className="pl-1 pr-4 py-3 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingRight: 16,
              }}>
              {hourOptions
                .filter((option) => parseInt(option.split(":")[0]) >= 12)
                .map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setReturnHour(option)}
                    className={`w-20 py-2 rounded-full border items-center justify-center ${
                      returnHour === option ? "" : "bg-white"
                    }`}
                    style={{
                      backgroundColor:
                        returnHour === option ? theme.buttons2 : undefined,
                    }}>
                    <Text
                      className={`text-sm ${
                        returnHour === option
                          ? "text-white font-bold"
                          : "text-gray-700"
                      }`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          <Text className="font-semibold text-gray-700 mb-2">
            Where do you want to leave from?
          </Text>

          {startingLocation === "" && (
            <TextInput
              className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700 mb-4"
              placeholder="Search zone..."
              value={searchZone}
              onChangeText={setSearchZone}
            />
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 12 }}>
            {filteredZones.map((zone) => {
              const selected = startingLocation === zone;
              return (
                <TouchableOpacity
                  key={zone}
                  onPress={() => toggleZone(zone)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: selected ? theme.buttons2 : "#f3f4f6",
                  }}>
                  <Text className={selected ? "text-white" : "text-gray-700"}>
                    {zone}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
                  style={{
                    backgroundColor: selected ? theme.buttons2 : "#f3f4f6",
                  }}
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

          <Text className="font-semibold text-gray-700 mb-2">
            Already planned something?
          </Text>
          <TextInput
            className="bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700 mb-1"
            placeholder="Start typing..."
            value={customInput}
            onChangeText={(text) => {
              setCustomInput(text);
              setFilteredPlaces(
                places.filter(
                  (p) =>
                    p.toLowerCase().includes(text.toLowerCase()) &&
                    !customObjectives.includes(p)
                )
              );
            }}
          />
          {filteredPlaces.length > 0 && (
            <View className="bg-white border border-gray-200 rounded-xl mb-3 max-h-48">
              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredPlaces.map((place) => (
                  <TouchableOpacity
                    key={place}
                    onPress={() => {
                      setCustomObjectives((prev) => [...prev, place]);
                      setFilteredPlaces([]);
                      setCustomInput("");
                    }}
                    className="px-4 py-2 border-b border-gray-100">
                    <Text className="text-gray-700">{place}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {customObjectives.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {customObjectives.map((place) => (
                <View
                  key={place}
                  className="px-3 py-1 bg-gray-200 rounded-full">
                  <Text className="text-sm text-gray-800">{place}</Text>
                </View>
              ))}
            </View>
          )}

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

          <Text className="font-semibold text-gray-700 mb-2">
            How do you prefer to travel?
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {["walk", "public transport", "taxi"].map((mode) => {
              const selected = transportMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTransportMode(mode)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: selected ? theme.buttons2 : "#f3f4f6",
                  }}>
                  <Text className={selected ? "text-white" : "text-gray-700"}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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

          <View
            className="flex-row justify-between space-x-8 mb-16"
            style={{ gap: 20 }}>
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={loading}
              className="flex-1 py-4 rounded-full shadow-md"
              style={{ backgroundColor: theme.buttons1 }}>
              <Text className="text-center text-white font-bold text-base">
                {loading ? "Generating..." : "Generate Itinerary"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClear}
              className="flex-1 py-4 rounded-full shadow-md"
              style={{ backgroundColor: "#E5E7EB" }} // Tailwind: bg-gray-600
            >
              <Text
                className="text-center font-bold text-base"
                style={{ color: theme.buttons2 }}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {response !== "" && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-gray-800 mb-4">
                {isFromStorage
                  ? "Your Last Itinerary:"
                  : "Your Suggested Itinerary:"}
              </Text>
              {renderItinerary()}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ItineraryQuestionnaireScreen;

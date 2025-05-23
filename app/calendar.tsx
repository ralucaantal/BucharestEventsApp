import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Linking,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { format, addDays, subDays } from "date-fns";
import { Feather } from "@expo/vector-icons";
import { BASE_URL } from "../constants";

const { width } = Dimensions.get("window");

const daysOptions = [
  { label: "Yesterday", date: subDays(new Date(), 1) },
  { label: "Today", date: new Date() },
  { label: "Tomorrow", date: addDays(new Date(), 1) },
  { label: "In 2 Days", date: addDays(new Date(), 2) },
  { label: "In 3 Days", date: addDays(new Date(), 3) },
];

type EventItem = {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  image: any;
  url: string;
};

const CalendarScreen: React.FC = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/events`);
        const data = await res.json();

        const mapped = data.map((ev: any, index: number) => ({
          id: ev.id || index,
          title: ev.title,
          date: new Date(ev.date),
          time: format(new Date(ev.date), "HH:mm"),
          location: ev.location,
          image: { uri: ev.image_url || "https://via.placeholder.com/150" },
          url: ev.url,
        }));

        setEvents(mapped);
      } catch (err) {
        console.error("❌ Error loading events:", err);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") &&
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* FIXED: Header + Search + Day Selector */}
          <View className="z-10 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 pt-5 pb-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 bg-gray-100 rounded-full mr-3"
              >
                <Feather name="chevron-left" size={24} color="#1f2937" />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-bold text-gray-800">Events 📅</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  What's happening in Bucharest?
                </Text>
              </View>
            </View>

            {/* Search */}
            <View className="px-5 mb-3">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                <Feather name="search" size={20} color="gray" />
                <TextInput
                  placeholder="Search events..."
                  placeholderTextColor="gray"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="ml-2 flex-1 text-base text-gray-700"
                />
              </View>
            </View>

            {/* Day Selector */}
            <View className="mb-2">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                className="space-x-6"
              >
                {daysOptions.map((day, index) => {
                  const isSelected =
                    format(selectedDate, "yyyy-MM-dd") ===
                    format(day.date, "yyyy-MM-dd");
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(day.date)}
                      className={`py-1.5 px-4 rounded-full min-w-[100px] items-center justify-center ${
                        isSelected ? "bg-blue-600" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`font-bold text-sm ${
                          isSelected ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {day.label}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {format(day.date, "dd MMM")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* SCROLLABLE: Events List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-5 pb-8">
              {filteredEvents.map((event) => {
                const isPast = event.date < new Date();
                return (
                  <TouchableOpacity
                    key={event.id}
                    activeOpacity={1}
                    className="flex-row bg-gray-100 p-3 rounded-2xl mb-4 items-center"
                  >
                    <Image
                      source={event.image}
                      className="rounded-xl mr-4"
                      style={{ width: width * 0.22, height: width * 0.22 }}
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">
                        {event.title}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {event.time} · {event.location}
                      </Text>

                      {!isPast && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(event.url)}
                          className="mt-2 bg-blue-600 px-3 py-1.5 self-start rounded-full"
                        >
                          <Text className="text-white font-semibold text-sm">
                            🎟 Tickets
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CalendarScreen;
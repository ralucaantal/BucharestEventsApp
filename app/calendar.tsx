import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { format, addDays, subDays } from 'date-fns';

const ios = Platform.OS === 'ios';

const daysOptions = [
  { label: 'Yesterday', date: subDays(new Date(), 1) },
  { label: 'Today', date: new Date() },
  { label: 'Tomorrow', date: addDays(new Date(), 1) },
  { label: 'In 2 Days', date: addDays(new Date(), 2) },
  { label: 'In 3 Days', date: addDays(new Date(), 3) },
];

const eventsToday = [
  {
    id: 1,
    title: 'Street Delivery Festival',
    time: '12:00 PM',
    location: 'Arthur Verona Street',
    image: require('../assets/images/destinations/streetdelivery.png'),
  },
  {
    id: 2,
    title: 'Concert in Herăstrău Park',
    time: '7:00 PM',
    location: 'Herăstrău Park',
    image: require('../assets/images/destinations/herastrau.png'),
  },
  {
    id: 3,
    title: 'Museum Night - MNAR',
    time: '8:00 PM',
    location: 'National Art Museum',
    image: require('../assets/images/destinations/artmuseum.png'),
  },
];

const CalendarScreen: React.FC = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(10) }}
      >
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: wp(3) }}
              className="p-2 rounded-full bg-neutral-100"
            >
              <ChevronLeftIcon size={wp(6)} strokeWidth={3} color="#1f2937" />
            </TouchableOpacity>
            <View>
              <Text
                style={{ fontSize: wp(6.5), lineHeight: wp(7.5) }}
                className="font-bold text-neutral-800"
              >
                Today's Events 📅
              </Text>
              <Text
                className="text-neutral-400"
                style={{ fontSize: wp(3), marginTop: 2 }}
              >
                What's happening today in Bucharest?
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-neutral-100 rounded-full px-4 py-3">
            <MagnifyingGlassIcon size={22} strokeWidth={2} color="gray" />
            <TextInput
              placeholder="Search events..."
              placeholderTextColor="gray"
              className="flex-1 text-base pl-3 text-neutral-700"
            />
          </View>
        </View>

        {/* Day Selector Bar */}
        <View className="px-5 mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 5 }}
            className="space-x-4"
          >
            {daysOptions.map((day, index) => {
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
              return (
                <TouchableOpacity
                  key={index}
                  style={{ marginRight: wp(1) }}
                  onPress={() => setSelectedDate(day.date)}
                  className={`items-center p-3 px-5 rounded-full ${
                    isSelected ? 'bg-blue-600' : 'bg-neutral-100'
                  }`}
                >
                  <Text
                    className={`font-bold ${isSelected ? 'text-white' : 'text-neutral-700'}`}
                    style={{ fontSize: wp(3.5) }}
                  >
                    {day.label}
                  </Text>
                  <Text
                    className={`text-xs ${isSelected ? 'text-white' : 'text-neutral-500'}`}
                  >
                    {format(day.date, 'dd MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Events List */}
        <View className="space-y-5 px-5">
          {eventsToday.map((event) => (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.8}
              style={{ marginBottom: wp(2) }}
              className="flex-row bg-neutral-100 p-3 rounded-2xl items-center shadow-sm"
            >
              <Image
                source={event.image}
                style={{
                  width: wp(20),
                  height: wp(20),
                  borderRadius: wp(5),
                  marginRight: wp(3),
                }}
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="font-bold text-neutral-800" style={{ fontSize: wp(4.2) }}>
                  {event.title}
                </Text>
                <Text className="text-neutral-500" style={{ fontSize: wp(3.2), marginTop: 2 }}>
                  {event.time} · {event.location}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;
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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, addDays, subDays } from 'date-fns';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ios = Platform.OS === 'ios';

const daysOptions = [
  { label: 'Yesterday', date: subDays(new Date(), 1) },
  { label: 'Today', date: new Date() },
  { label: 'Tomorrow', date: addDays(new Date(), 1) },
  { label: 'In 2 Days', date: addDays(new Date(), 2) },
  { label: 'In 3 Days', date: addDays(new Date(), 3) },
];

type EventItem = {
  id: number;
  title: string;
  time: string;
  location: string;
  image: any;
};

const eventsToday: EventItem[] = [
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
              backgroundColor: '#f3f4f6',
              borderRadius: 999,
              marginRight: 10,
            }}
          >
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              Today's Events 📅
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              What's happening today in Bucharest?
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Feather name="search" size={20} color="gray" />
            <TextInput
              placeholder="Search events..."
              placeholderTextColor="gray"
              style={{
                marginLeft: 10,
                flex: 1,
                fontSize: 16,
                color: '#374151',
              }}
            />
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginBottom: 20 }}
        >
          {daysOptions.map((day, index) => {
            const isSelected =
              format(selectedDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(day.date)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 999,
                  backgroundColor: isSelected ? '#2563eb' : '#f3f4f6',
                  marginRight: 10,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: isSelected ? '#fff' : '#374151',
                  }}
                >
                  {day.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isSelected ? '#fff' : '#9ca3af',
                  }}
                >
                  {format(day.date, 'dd MMM')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Events List */}
        <View style={{ paddingHorizontal: 20 }}>
          {eventsToday.map((event) => (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 20,
                marginBottom: 14,
                alignItems: 'center',
              }}
            >
              <Image
                source={event.image}
                style={{
                  width: width * 0.22,
                  height: width * 0.22,
                  borderRadius: 12,
                  marginRight: 14,
                }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
                  {event.title}
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
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
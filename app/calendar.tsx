import React, { useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, addDays, subDays } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../constants'; // asigură-te că ai exportat IP-ul local corect

const { width } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/events`);
        const data = await res.json();

        const mapped = data.map((ev: any, index: number) => ({
          id: ev.id || index,
          title: ev.title,
          date: new Date(ev.date),
          time: format(new Date(ev.date), 'HH:mm'),
          location: ev.location,
          image: { uri: ev.image_url || 'https://via.placeholder.com/150' },
          url: ev.url,
        }));

        setEvents(mapped);
      } catch (err) {
        console.error('❌ Error loading events:', err);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Events 📅
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              What's happening in Bucharest?
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
              value={searchQuery}
              onChangeText={setSearchQuery}
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
{filteredEvents.map((event) => {
  const isPast = event.date < new Date(); // comparația se face automat
  return (
    <TouchableOpacity
      key={event.id}
      activeOpacity={1}
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

        {/* Afișează buton doar dacă evenimentul NU e în trecut */}
        {!isPast && (
          <TouchableOpacity
            onPress={() => Linking.openURL(event.url)}
            style={{
              marginTop: 6,
              backgroundColor: '#2563eb',
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: 'flex-start',
              borderRadius: 999,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
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
    </SafeAreaView>
  );
};

export default CalendarScreen;
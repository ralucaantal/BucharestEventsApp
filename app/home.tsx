import React from 'react';
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
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Categories from '../components/categories';
import Destinations from '../components/destinations';
import QuickActions from '@/components/QuickActions';

const { width } = Dimensions.get('window');
const ios = Platform.OS === 'ios';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
          <View>
            <Text
              style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}
            >
              Hello, Explorer! 👋
            </Text>
            <Text
              style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}
            >
              What do you want to do today in Bucharest?
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Image
              source={require('../assets/images/avatar.png')}
              style={{
                height: 44,
                width: 44,
                borderRadius: 22,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
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
              placeholder="Search destinations..."
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

        {/* Quick Actions */}
        <View style={{ marginBottom: 16 }}>
          <QuickActions />
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 16 }}>
          <Categories />
        </View>

        {/* Featured Destinations */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
              Featured Destinations
            </Text>
          </View>
          <Destinations />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
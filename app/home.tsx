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
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import Categories from '../components/categories';
import SortCategories from '../components/sortCategories';
import Destinations from '../components/destinations';

const ios = Platform.OS === 'ios';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(10) }}
      >
        {/* Header: Welcome & Avatar */}
        <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
          <View>
            <Text
              style={{ fontSize: wp(6.5), lineHeight: wp(7.5) }}
              className="font-bold text-neutral-800"
            >
              Hello, Explorer! 👋
            </Text>
            <Text
              className="text-neutral-400"
              style={{ fontSize: wp(3), marginTop: 2 }}
            >
              What do you want to do today in Bucharest?
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/map')}>
            <Image
              source={require('../assets/images/map.png')}
              style={{
                height: wp(11),
                width: wp(11),
                borderRadius: wp(11) / 2,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Image
              source={require('../assets/images/avatar.png')}
              style={{ height: wp(11), width: wp(11), borderRadius: wp(11) / 2 }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-neutral-100 rounded-full px-4 py-3">
            <MagnifyingGlassIcon size={22} strokeWidth={2} color="gray" />
            <TextInput
              placeholder="Search destinations..."
              placeholderTextColor="gray"
              className="flex-1 text-base pl-3 text-neutral-700"
            />
          </View>
        </View>

        {/* Categories */}
        <View className="mb-4">
          <Categories />
        </View>

        {/* Sort Options */}
        <View className="mb-4">
          <SortCategories />
        </View>

        {/* Featured Destinations */}
        <View className="mb-6">
          <View className="px-5 mb-3">
            <Text className="text-lg font-semibold text-neutral-800">
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
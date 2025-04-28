import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const ios = Platform.OS === 'ios';

const VirtualGuideScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(10) }}>
        
        {/* Header with Back Button and Avatar */}
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
                Virtual Guide 🤖
              </Text>
              <Text
                className="text-neutral-400"
                style={{ fontSize: wp(3), marginTop: 2 }}
              >
                Plan your perfect day in Bucharest
              </Text>
            </View>
          </View>
        </View>

        {/* Robot Illustration */}
        <View className="items-center my-8">
          <Image
            source={require('../assets/images/guide.png')}
            style={{
              width: wp(50),
              height: wp(50),
              borderRadius: wp(25),
              borderWidth: 2,
              borderColor: '#e5e7eb'
            }}
            resizeMode="contain"
          />
        </View>

        {/* Input for user itinerary request */}
        <View className="px-5 mb-8">
          <Text className="text-neutral-700 font-semibold mb-2" style={{ fontSize: wp(4) }}>
            Tell me what you want to do!
          </Text>
          <View className="flex-row items-center bg-neutral-100 rounded-full px-4 py-3">
            <TextInput
              placeholder="Ex: Museums + Parks + Cafés"
              placeholderTextColor="gray"
              className="flex-1 text-base text-neutral-700"
            />
          </View>
        </View>

        {/* Suggested Actions */}
        <View className="px-5 space-y-4">
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-full shadow-lg"
            onPress={() => alert('Generate itinerary')}
            style={{marginBottom: wp(2)}}
          >
            <Text className="text-white text-center font-bold" style={{ fontSize: wp(4.5) }}>
              Generate Itinerary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-neutral-100 py-4 rounded-full"
            onPress={() => alert('Surprise me!')}
          >
            <Text className="text-neutral-700 text-center font-semibold" style={{ fontSize: wp(4.5) }}>
              Surprise Me! 🎉
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default VirtualGuideScreen;
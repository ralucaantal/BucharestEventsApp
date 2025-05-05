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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ios = Platform.OS === 'ios';

const VirtualGuideScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
              borderRadius: 999,
              backgroundColor: '#f3f4f6',
              marginRight: 12,
            }}
          >
            <Feather name="chevron-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: width * 0.065,
                fontWeight: 'bold',
                color: '#1f2937',
              }}
            >
              Virtual Guide 🤖
            </Text>
            <Text
              style={{
                fontSize: width * 0.03,
                color: '#9ca3af',
                marginTop: 2,
              }}
            >
              Plan your perfect day in Bucharest
            </Text>
          </View>
        </View>

        {/* Robot Illustration */}
        <View style={{ alignItems: 'center', marginVertical: 32 }}>
          <Image
            source={require('../assets/images/guide.png')}
            style={{
              width: width * 0.5,
              height: width * 0.5,
              borderRadius: width * 0.25,
              borderWidth: 2,
              borderColor: '#e5e7eb',
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* User input */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontSize: width * 0.04,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Tell me what you want to do!
          </Text>
          <View
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextInput
              placeholder="Ex: Museums + Parks + Cafés"
              placeholderTextColor="gray"
              style={{
                flex: 1,
                fontSize: 16,
                color: '#374151',
              }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <TouchableOpacity
            onPress={() => alert('Generate itinerary')}
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 16,
              borderRadius: 999,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: width * 0.045,
              }}
            >
              Generate Itinerary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert('Surprise me!')}
            style={{
              backgroundColor: '#f3f4f6',
              paddingVertical: 16,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: '#374151',
                fontWeight: '600',
                fontSize: width * 0.045,
              }}
            >
              Surprise Me! 🎉
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VirtualGuideScreen;
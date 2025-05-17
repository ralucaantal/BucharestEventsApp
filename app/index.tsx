import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <Image
        source={require('../assets/images/welcome.png')}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          resizeMode: 'cover',
        }}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(3,105,161,0.85)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          width,
          height: height * 0.6,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      />

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 32,
          paddingBottom: 40,
          zIndex: 1,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: width * 0.1,
              lineHeight: width * 0.1,
              marginBottom: width * 0.05,
            }}
          >
            Life in Bucharest made easier 🤭
          </Text>
          <Text
            style={{
              color: '#e5e7eb',
              fontWeight: '500',
              textAlign: 'center',
              fontSize: width * 0.06,
            }}
          >
            Find out about activities in Bucharest with just one tap.
          </Text>
        </View>

        <TouchableOpacity
          // onPress={() => router.push('/home')}
          onPress={() => router.push('/login')}
          style={{
            backgroundColor: 'white',
            alignSelf: 'center',
            paddingVertical: 16,
            paddingHorizontal: 48,
            borderRadius: 999,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: 'bold',
              fontSize: width * 0.052,
            }}
          >
            Let's go!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1 }}>
      {/* Background image */}
      <Image
        source={require('../assets/images/login.png')}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          resizeMode: 'cover',
        }}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(3,105,161,0.85)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          width: width,
          height: height,
        }}
      />

      {/* Back button */}
      <SafeAreaView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            padding: 10,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 32,
          paddingBottom: 40,
          zIndex: 10,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text
            style={{
              fontSize: width * 0.08,
              lineHeight: width * 0.095,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            Welcome back 👋
          </Text>
          <Text
            style={{
              fontSize: width * 0.042,
              color: '#e5e7eb',
              fontWeight: '500',
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Sign in to explore Bucharest
          </Text>
        </View>

        {/* Inputs */}
        <View style={{ gap: 20, marginBottom: 24 }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#e5e7eb"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 12,
              color: 'white',
              fontSize: 16,
            }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#e5e7eb"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 12,
              color: 'white',
              fontSize: 16,
            }}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => alert('Login logic here')}
          style={{
            backgroundColor: 'white',
            paddingVertical: 12,
            borderRadius: 999,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#0284c7',
              fontWeight: 'bold',
              fontSize: width * 0.052,
            }}
          >
            Log In
          </Text>
        </TouchableOpacity>

        {/* Social Options */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 32,
            marginTop: 20,
          }}
        >
          <TouchableOpacity onPress={() => alert('Continue with Google')}>
            <Image
              source={require('../assets/images/icons/google.png')}
              style={{
                height: width * 0.11,
                width: width * 0.11,
                borderRadius: (width * 0.11) / 2,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={() => alert('Continue with Apple')}>
              <Image
                source={require('../assets/images/icons/apple.png')}
                style={{
                  height: width * 0.11,
                  width: width * 0.11,
                  borderRadius: (width * 0.11) / 2,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Register link */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
          }}
        >
          <Text style={{ color: '#e5e7eb' }}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => alert('Go to Register screen')}>
            <Text
              style={{
                color: 'white',
                fontWeight: '500',
                marginLeft: 6,
              }}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
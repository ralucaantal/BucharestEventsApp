import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1">
      {/* Background image */}
      <Image
        source={require('../assets/images/login.png')}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(3,105,161,0.85)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          width: wp(100),
          height: hp(100),
        }}
      />

      {/* Back button */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
        <View className="flex-row justify-start px-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeftIcon size={wp(7)} strokeWidth={4} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom content */}
      <View className="flex-1 justify-end px-8 pb-10 space-y-6 z-10">
        {/* Header */}
        <View className="items-center space-y-2 mb-4">
          <Text
            className="text-white font-bold text-center"
            style={{ fontSize: wp(8), lineHeight: wp(9.5) }}
          >
            Welcome back 👋
          </Text>
          <Text className="text-neutral-200 font-medium text-center" style={{ fontSize: wp(4.2) }}>
            Sign in to explore Bucharest
          </Text>
        </View>

        {/* Inputs */}
        <View className="space-y-8">
          <TextInput
            placeholder="Email"
            placeholderTextColor="#e5e7eb"
            value={email}
            onChangeText={setEmail}
            className="bg-white/20 border border-white/30 rounded-full px-6 py-3 text-white text-base"
            style={{ marginBottom: wp(2) }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#e5e7eb"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="bg-white/20 border border-white/30 rounded-full px-6 py-3 text-white text-base"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => alert('Login logic here')}
          className="bg-white py-3 rounded-full shadow-lg mt-2"
        >
          <Text className="text-sky-700 font-bold text-center" style={{ fontSize: wp(5.2) }}>
            Log In
          </Text>
        </TouchableOpacity>

        {/* Social options */}
        <View className="flex-row justify-center space-x-14 mt-4">
            <TouchableOpacity onPress={() => alert('Continue with Google')}
                style={{ marginHorizontal: wp(1) }}>
                <Image
                source={require('../assets/images/icons/google.png')}
                style={{
                    height: wp(11),
                    width: wp(11),
                    borderRadius: wp(11) / 2,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                }}
                />
            </TouchableOpacity>

        {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={() => alert('Continue with Apple')} style={{ marginHorizontal: wp(1) }}>
                <Image
                    source={require('../assets/images/icons/apple.png')}
                    style={{
                    height: wp(11),
                    width: wp(11),
                    borderRadius: wp(11) / 2,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    }}
                />
            </TouchableOpacity>
        )}
        </View>



        {/* Register link */}
        <View className="flex-row justify-center mt-3">
          <Text className="text-neutral-200">Don’t have an account?</Text>
          <TouchableOpacity onPress={() => alert('Go to Register screen')}>
            <Text className="text-white font-medium ml-1">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
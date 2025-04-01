import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from '../theme';

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1">
      {/* background image */}
      <Image 
        source={require('../assets/images/welcome.png')} 
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      {/* gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(3,105,161,0.85)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          width: wp(100),
          height: hp(60),
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      />

      {/* content */}
      <View className="flex-1 justify-end space-y-10 px-8 pb-20" style={{ zIndex: 1 }}>
        <View className="space-y-6 mb-8 items-center">
          <Text
            className="text-white font-bold text-center"
            style={{ fontSize: wp(10), lineHeight: wp(10), marginBottom: wp(2) }}
          >
            Life in Bucharest made easier 🤭
          </Text>
          <Text
            className="text-neutral-200 font-medium text-center"
            style={{ fontSize: wp(6) }}
          >
            Find out about activities in Bucharest with just one tap.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/home')}
          className="bg-white mx-auto p-4 px-12 rounded-full shadow-lg"
        >
          <Text
            className="text-sky-700 font-bold"
            style={{ fontSize: wp(5.2) }}
          >
            Let's go!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
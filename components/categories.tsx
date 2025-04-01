import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { theme } from '../theme';
import { categoriesData } from '../constants';

const Categories: React.FC = () => {
  return (
    <View className="space-y-4">
      {/* header */}
      <View className="px-5 flex-row justify-between items-center">
        <Text
          style={{ fontSize: wp(4.5),  marginBottom: wp(2)  }}
          className="font-bold text-neutral-800"
        >
          Categories
        </Text>
      </View>

      {/* horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(5) }}
      >
        {categoriesData.map((cat, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            className="mr-5 items-center"
          >
            <View
              style={{
                width: wp(20),
                height: wp(20),
                borderRadius: wp(5),
                backgroundColor: '#f3f4f6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
              className="mb-2 justify-center items-center"
            >
              <Image
                source={cat.image}
                resizeMode="cover"
                style={{
                  width: wp(18),
                  height: wp(18),
                  borderRadius: wp(4),
                }}
              />
            </View>
            <Text
              style={{ fontSize: wp(3.3) }}
              className="text-neutral-700 font-medium text-center"
            >
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Categories;

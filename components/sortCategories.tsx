import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { sortCategoryData } from '../constants';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { theme } from '../theme';

const SortCategories: React.FC = () => {
  const [activeSort, setActiveSort] = useState('Popular');

  return (
    <View className="px-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {sortCategoryData.map((sort, index) => {
          const isActive = sort === activeSort;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveSort(sort)}
              style={{
                paddingVertical: wp(2),
                paddingHorizontal: wp(5),
                marginRight: wp(3),
                backgroundColor: isActive ? 'white' : '#f3f4f6',
                borderRadius: wp(5),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.1 : 0,
                shadowRadius: isActive ? 3 : 0,
                elevation: isActive ? 2 : 0,
              }}
            >
              <Text
                className="font-medium"
                style={{
                  fontSize: wp(3.8),
                  color: isActive ? theme.text : 'gray',
                }}
              >
                {sort}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SortCategories;
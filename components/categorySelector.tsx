import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { sortCategoryData } from '../constants';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

type Props = {
  activeCategory: string;
  onSelect: (cat: string) => void;
};

type ItemProps = {
  cat: string;
  isActive: boolean;
  onPress: (cat: string) => void;
};

const CategoryButton: React.FC<ItemProps> = React.memo(({ cat, isActive, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(cat)}
    style={{
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginRight: 12,
      backgroundColor: isActive ? 'white' : '#f3f4f6',
      borderRadius: 999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isActive ? 0.1 : 0,
      shadowRadius: isActive ? 3 : 0,
      elevation: isActive ? 2 : 0,
    }}
  >
    <Text
      style={{
        fontWeight: '500',
        fontSize: width * 0.038,
        color: isActive ? theme.buttons1 : 'gray',
      }}
    >
      {cat}
    </Text>
  </TouchableOpacity>
));

const CategorySelector: React.FC<Props> = ({ activeCategory, onSelect }) => {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {sortCategoryData.map((cat, index) => (
          <CategoryButton
            key={index}
            cat={cat}
            isActive={cat === activeCategory}
            onPress={onSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;
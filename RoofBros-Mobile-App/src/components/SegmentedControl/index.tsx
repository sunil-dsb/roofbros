import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import AppText from '../AppText';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing } from '../../themes/spacing';

interface SegmentedControlProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const SegmentedControl = ({
  options,
  selectedValue,
  onValueChange,
}: SegmentedControlProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const selectedIndex = Math.max(0, options.indexOf(selectedValue));
  const animatedValue = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: Math.max(0, options.indexOf(selectedValue)),
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  }, [selectedValue, options]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width - 8); // total padding: 4 + 4
  };

  const itemWidth = containerWidth > 0 ? containerWidth / options.length : 0;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.animatedPill,
            {
              width: itemWidth,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: options.map((_, i) => i),
                    outputRange: options.map((_, i) => i * itemWidth),
                  }),
                },
              ],
            },
          ]}
        />
      )}
      {options.map(option => {
        const isSelected = option === selectedValue;
        return (
          <Pressable
            key={option}
            style={styles.option}
            onPress={() => onValueChange(option)}
          >
            <AppText
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  animatedPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 999,
  },
  optionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.body,
  },
  selectedOptionText: {
    color: colors.ink,
  },
});

export default SegmentedControl;

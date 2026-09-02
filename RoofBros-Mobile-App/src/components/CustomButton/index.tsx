import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  Keyboard,
} from 'react-native';
import AppText from '../AppText';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'compact' | 'dangerOutline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
}: CustomButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;
    setPressed(true);
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    setPressed(false);
    Animated.timing(scale, {
      toValue: 1.0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Keyboard.dismiss();
    if (onPress) {
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isCompact = variant === 'compact';
  const isDangerOutline = variant === 'dangerOutline';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={isCompact ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined}
      style={[
        styles.baseButton,
        isPrimary && styles.primaryButton,
        isPrimary && pressed && styles.primaryPressed,
        isSecondary && styles.secondaryButton,
        isSecondary && pressed && styles.secondaryPressed,
        isCompact && styles.compactButton,
        isCompact && pressed && styles.compactPressed,
        isDangerOutline && styles.dangerOutlineButton,
        isDangerOutline && pressed && styles.dangerOutlinePressed,
        disabled && styles.disabled,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {iconLeft}
        <AppText
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            (isSecondary || isCompact) && styles.outlineText,
            isDangerOutline && styles.dangerOutlineText,
            textStyle,
          ]}
        >
          {title}
        </AppText>
        {iconRight}
      </View>
    </AnimatedPressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 9999, // Full-pill shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  primaryPressed: {
    backgroundColor: colors.accentPress,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 18,
    height: 44,
  },
  secondaryPressed: {
    backgroundColor: colors.panel, // Subtle feedback on outline press
  },
  compactButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 36,
    width: 'auto', // Compact button doesn't stretch to full-width by default
    alignSelf: 'flex-start',
  },
  compactPressed: {
    backgroundColor: colors.panel,
  },
  dangerOutlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  dangerOutlinePressed: {
    backgroundColor: colors.errorTint,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fontFamily.medium, // Outfit 500
    fontSize: fontSizes.f16,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.ground,
  },
  outlineText: {
    color: colors.ink,
  },
  dangerOutlineText: {
    color: colors.error,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

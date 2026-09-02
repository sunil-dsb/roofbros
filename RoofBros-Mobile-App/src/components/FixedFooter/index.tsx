import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../themes/colors';

interface FixedFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const FixedFooter = ({ children, style }: FixedFooterProps) => {
  const insets = useSafeAreaInsets();

  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
});

export default FixedFooter;

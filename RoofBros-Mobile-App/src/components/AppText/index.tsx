import { StyleSheet, Text, TextProps } from 'react-native';
import React from 'react';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';

export interface AppTextProps extends TextProps {
  children?: React.ReactNode;
  variant?:
    | 'display'
    | 'data'
    | 'title'
    | 'heading'
    | 'body'
    | 'caption'
    | 'micro';
}

const AppText = ({
  children,
  style,
  variant = 'body',
  ...props
}: AppTextProps) => {
  return (
    <Text
      allowFontScaling={false}
      suppressHighlighting
      style={[styles.text, styles[variant], style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
  display: {
    fontFamily: fontFamily.heading, // af Another Sans Semibold
    fontSize: fontSizes.f28,
    color: colors.ink,
  },
  data: {
    fontFamily: fontFamily.heading, // af Another Sans Semibold
    fontSize: fontSizes.f26,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontFamily: fontFamily.heading, // af Another Sans Semibold
    fontSize: fontSizes.f22,
    color: colors.ink,
  },
  heading: {
    fontFamily: fontFamily.semiBold, // Outfit 600
    fontSize: fontSizes.f18,
    color: colors.ink,
  },
  body: {
    fontFamily: fontFamily.regular, // Outfit 400
    fontSize: fontSizes.f16,
    color: colors.body,
  },
  caption: {
    fontFamily: fontFamily.medium, // Outfit 500
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  micro: {
    fontFamily: fontFamily.semiBold, // Outfit 600
    fontSize: fontSizes.f12,
    color: colors.muted,
    letterSpacing: 11 * 0.06, // +6%
    textTransform: 'uppercase',
  },
});

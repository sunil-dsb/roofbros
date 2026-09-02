import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

export interface CustomKeyboardScrollViewProps
  extends KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const CustomKeyboardScrollView = ({
  children,
  contentContainerStyle,
  ...props
}: CustomKeyboardScrollViewProps) => {
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      keyboardDismissMode="on-drag"
      contentContainerStyle={contentContainerStyle}
      bottomOffset={50}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default CustomKeyboardScrollView;

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Pressable,
  Platform,
  StyleProp,
  TextStyle,
} from 'react-native';
import AppText from '../AppText';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import EyeIcon from '../../assets/icons/eyeIcon';
import EyeOffIcon from '../../assets/icons/eyeOffIcon';
import { spacing, width } from '../../themes/spacing';

export interface StackedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
}

const StackedInput = forwardRef<TextInput, StackedInputProps>(
  (
    {
      label,
      error,
      secureTextEntry,
      leftIcon,
      rightElement,
      style,
      inputStyle,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const internalRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => internalRef.current as TextInput);

    const handlePress = () => {
      internalRef.current?.focus();
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const isPassword = secureTextEntry;

    // Custom border rules to prevent double borders
    const getContainerStyle = () => {
      if (error) {
        return {
          backgroundColor: colors.fieldActive,
          borderColor: colors.error,
        };
      } else if (isFocused) {
        return {
          backgroundColor: colors.fieldActive,
        };
      } else {
        return {
          backgroundColor: colors.fieldInactive,
        };
      }
    };

    return (
      <View style={styles.outerContainer}>
        <View style={[styles.container, getContainerStyle(), style]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Pressable style={styles.inputContainer} onPress={handlePress}>
            {label && <AppText style={styles.label}>{label}</AppText>}
            <TextInput
              ref={internalRef}
              placeholderTextColor={colors.placeholder}
              secureTextEntry={isPassword && !showPassword}
              style={[styles.input, inputStyle]}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoCorrect={false}
              allowFontScaling={false}
              cursorColor={colors.ink}
              {...props}
            />
          </Pressable>

          {isPassword && (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOffIcon size={24} color={colors.muted} />
              ) : (
                <EyeIcon size={24} color={colors.muted} />
              )}
            </Pressable>
          )}

          {rightElement && (
            <View style={styles.rightElementContainer}>{rightElement}</View>
          )}
        </View>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
      </View>
    );
  },
);

export default StackedInput;

const styles = StyleSheet.create({
  outerContainer: {},
  container: {
    height: width * 0.2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.8,
    borderColor: colors.border,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: Platform.OS === 'ios' ? 10 : 0,
  },
  label: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    marginTop: Platform.OS === 'ios' ? 0 : 15,
  },
  input: {
    fontSize: fontSizes.f18,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    includeFontPadding: false,
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  leftIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightElementContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.f14,
    marginTop: 5,
    marginBottom: spacing.s,
    fontFamily: fontFamily.regular,
  },
});

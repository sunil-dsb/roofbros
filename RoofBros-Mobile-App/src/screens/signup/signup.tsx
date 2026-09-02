import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { navigate, reset } from '../../navigations/navigationServices';
import { spacing, width } from '../../themes/spacing';
import AppleIcon from '../../assets/icons/appleIcon';
import GoogleIcon from '../../assets/icons/googleIcon';
import fontSizes from '../../themes/fontSizes';
import {
  useSignUpMutation,
  useSocialLoginMutation,
} from '../../redux/services/authApi';
import Loader from '../../components/loader';
import { setLoaderOn, setLoaderOff } from '../../helper/commonFunctions';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useDispatch } from 'react-redux';
import { setToken, setUserData } from '../../redux/slices/persistedSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
});

type SignupForm = z.infer<typeof signupSchema>;

const SignUp = () => {
  const insets = useSafeAreaInsets();
  const [signUp] = useSignUpMutation();
  const [socialLogin] = useSocialLoginMutation();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleCreateAccount = async (data: SignupForm) => {
    managerApiCall(signUp, { ...data }, () => {
      navigate(routesConstants.verifyOtp, { email: data.email });
    });
  };

  const handleSocialPress = async (provider: string) => {
    if (provider === 'Google') {
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        const { idToken, accessToken } = tokens;
        if (!idToken) {
          Alert.alert('Error', 'Failed to get Google ID token.');
          return;
        }
        managerApiCall(
          socialLogin,
          { provider: 'google', idToken: { token: idToken, accessToken } },
          (res: any) => {
            const token = res?.data?.token || res?.token;
            const user = res?.data?.user || res?.user;
            if (token) {
              dispatch(setToken(token));
            }
            if (user) {
              dispatch(setUserData(user));
            }
            if (user?.isBusiness === false) {
              reset(routesConstants.businessDetails);
            } else {
              reset(routesConstants.bottomTab);
            }
          },
        );
      } catch (error: any) {
        console.log('Google Sign-In error:', error);
      }
    }
  };

  const handleLinkPress = (title: string) => {
    Keyboard.dismiss();
    if (title === 'Privacy Policy') {
      navigate(routesConstants.privacyPolicy);
    } else if (title === 'Terms of Service' || title === 'Terms') {
      navigate(routesConstants.termsOfUse);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      <CustomKeyboardScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          // { paddingBottom: insets.bottom + spacing.l },
        ]}
      >
        {/* Screen Title & Subtitle */}
        <View style={styles.titleContainer}>
          <AppText variant="display" style={styles.title}>
            Create your account.
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Your jobs and quotes, saved to every device.
          </AppText>
        </View>

        {/* Form Fields Stack */}
        <View style={styles.formContainer}>
          <FormInput
            name="name"
            control={control}
            label="Full name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            cursorColor={colors.ink}
          />
          <FormInput
            name="email"
            control={control}
            label="Email address"
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            cursorColor={colors.ink}
          />
          <FormInput
            name="password"
            control={control}
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            cursorColor={colors.ink}
          />
        </View>

        {/* Primary CTA */}
        <CustomButton
          title={'Create account'}
          disabled={!isValid}
          onPress={handleSubmit(handleCreateAccount)}
          style={styles.createBtn}
        />

        {/* Or Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <AppText variant="caption" style={styles.dividerText}>
            OR
          </AppText>
          <View style={styles.line} />
        </View>

        {/* Social Buttons Row */}
        <View style={styles.socialRow}>
          {Platform.OS === 'ios' && (
            <Pressable
              onPress={() => handleSocialPress('Apple')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <AppleIcon fill={colors.ink} />
              <AppText style={styles.socialText}>Apple</AppText>
            </Pressable>
          )}

          <Pressable
            onPress={() => handleSocialPress('Google')}
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.socialButtonPressed,
            ]}
          >
            <GoogleIcon />
            <AppText style={styles.socialText}>Google</AppText>
          </Pressable>
        </View>

        {/* Terms and Privacy policy statement */}
        <View style={styles.termsRow}>
          <AppText variant="caption" style={styles.termsText}>
            By continuing you agree to the{' '}
            <AppText
              onPress={() => handleLinkPress('Terms of Service')}
              style={styles.linkText}
            >
              Terms
            </AppText>{' '}
            and{' '}
            <AppText
              onPress={() => handleLinkPress('Privacy Policy')}
              style={styles.linkText}
            >
              Privacy{'\u00A0'}Policy
            </AppText>
            .
          </AppText>
        </View>

        {/* Switch screen footer */}
        <View style={styles.footerRow}>
          <AppText variant="body" style={styles.footerText}>
            Already have an account?{' '}
            <AppText
              onPress={() => navigate(routesConstants.login)}
              style={styles.footerLink}
            >
              Sign in
            </AppText>
          </AppText>
        </View>
      </CustomKeyboardScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },

  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: spacing.s,
    flexGrow: 1,
  },
  titleContainer: {
    marginBottom: spacing.l,
  },
  title: {
    color: colors.ink,
    fontFamily: fontFamily.heading,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    color: colors.body,
    fontSize: fontSizes.f15,
  },
  formContainer: {
    marginBottom: spacing.m,
  },
  createBtn: {
    marginBottom: spacing.l,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lineSoft,
  },
  dividerText: {
    marginHorizontal: spacing.s,
    color: colors.muted,
    fontFamily: fontFamily.regular,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  socialButtonPressed: {
    backgroundColor: colors.panel,
  },
  socialText: {
    fontFamily: fontFamily.medium,
    color: colors.ink,
    fontSize: fontSizes.f15,
    marginLeft: 8,
  },
  termsRow: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  termsText: {
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 18,
  },
  linkText: {
    color: colors.link,
    textDecorationLine: 'underline',
    fontFamily: fontFamily.medium,
  },
  footerRow: {
    alignItems: 'center',
    paddingBottom: width * 0.05,
  },
  footerText: {
    color: colors.muted,
  },
  footerLink: {
    color: colors.link,
    textDecorationLine: 'underline',
    fontFamily: fontFamily.semiBold,
  },
});

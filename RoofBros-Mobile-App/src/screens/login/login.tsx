import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

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
import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useSocialLoginMutation,
} from '../../redux/services/authApi';
import { setToken, setUserData } from '../../redux/slices/persistedSlice';
import Loader from '../../components/loader';
import { setLoaderOn, setLoaderOff } from '../../helper/commonFunctions';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [socialLogin] = useSocialLoginMutation();

  const handleSignIn = async (data: LoginForm) => {
    managerApiCall(
      login,
      data,
      res => {
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
      errorMsg => {
        if (errorMsg === 'Email not verified') {
          navigate(routesConstants.verifyOtp, { email: data.email });
        }
      },
    );
  };

  const handleForgotPassword = async () => {
    navigate(routesConstants.forgotPassword);
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
        console.log('tokens', tokens);
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
    } else if (provider === 'Apple') {
      try {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        console.log('appleAuthRequestResponse', appleAuthRequestResponse);
        const credentialState = await appleAuth.getCredentialStateForUser(
          appleAuthRequestResponse.user,
        );
        console.log('credentialState', credentialState);
        if (credentialState === appleAuth.State.AUTHORIZED) {
          managerApiCall(
            socialLogin,
            {
              provider: 'apple',
              idToken: {
                token: appleAuthRequestResponse.identityToken,
                accessToken: appleAuthRequestResponse.authorizationCode,
                user: {
                  name: {
                    firstName:
                      appleAuthRequestResponse.fullName?.givenName || '',
                    lastName:
                      appleAuthRequestResponse.fullName?.familyName || '',
                  },
                },
                nonce: appleAuthRequestResponse.nonce,
              },
            },
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
        }
      } catch (error: any) {
        if (error.code === appleAuth.Error.CANCELED) {
          console.log('User canceled Apple Sign in.');
        } else {
          console.log('Apple Sign-In error:', error);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      <CustomKeyboardScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          // { paddingBottom: insets.bottom },
        ]}
        // keyboardShouldPersistTaps="handled"
      >
        {/* Screen Title & Subtitle */}
        <View style={styles.titleContainer}>
          <AppText variant="display" style={styles.title}>
            Welcome back.
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Sign in to your saved jobs and quotes.
          </AppText>
        </View>

        {/* Form Fields Stack */}
        <View style={styles.formContainer}>
          <FormInput
            name="email"
            control={control}
            label="Email"
            placeholder="you@company.com.au"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput
            name="password"
            control={control}
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Forgot Password link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
          activeOpacity={0.7}
          hitSlop={20}
        >
          <AppText style={styles.forgotPasswordText}>Forgot password?</AppText>
        </TouchableOpacity>

        {/* Primary CTA */}
        <CustomButton
          title={'Sign in'}
          disabled={!isValid}
          onPress={handleSubmit(handleSignIn)}
          style={styles.signInBtn}
        />

        {/* Or Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <AppText variant="caption" style={styles.dividerText}>
            or continue with
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

        {/* Switch screen footer */}
        <View style={styles.footerRow}>
          <AppText variant="body" style={styles.footerText}>
            New to RoofBros?{' '}
            <AppText
              onPress={() => navigate(routesConstants.signUp)}
              style={styles.footerLink}
              suppressHighlighting
            >
              Create an account
            </AppText>
          </AppText>
        </View>
      </CustomKeyboardScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
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
    marginBottom: spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.l,
  },
  forgotPasswordText: {
    color: colors.link,
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    textDecorationLine: 'underline',
  },
  signInBtn: {
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
  footerRow: {
    alignItems: 'center',
    marginTop: 'auto',
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

import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { routesConstants } from '../../navigations/routeConstants';
import { goBack, reset } from '../../navigations/navigationServices';
import { spacing, width } from '../../themes/spacing';
import MailIcon from '../../assets/icons/mailIcon';
import Loader from '../../components/loader';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useVerifyForgotOtpMutation,
} from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';

// Close 'X' Button Icon
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={colors.ink}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Green Success Check Badge Icon
const SuccessCheckIcon = () => (
  <View style={styles.successBadge}>
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={colors.success}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

type ForgotPasswordStep =
  | 'request-code'
  | 'enter-code'
  | 'new-password'
  | 'success';

const forgotPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    data => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    },
  );

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const insets = useSafeAreaInsets();

  const [forgotPassword] = useForgotPasswordMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyForgotOtp] = useVerifyForgotOtpMutation();

  // Navigation Steps
  const [step, setStep] = useState<ForgotPasswordStep>('request-code');

  const {
    control,
    watch,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailValue = watch('email');
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');

  // Form values for OTP
  const [code, setCode] = useState('');

  // OTP Validation / Error States
  const [errorStatus, setErrorStatus] = useState<
    'none' | 'incorrect' | 'expired'
  >('none');
  const otpRef = useRef<OtpInputRef>(null);

  // Actions
  const handleSendOTP = () => {
    if (!emailValue || errors.email) return;
    managerApiCall(forgotPassword, { email: emailValue }, () => {
      setCode('');
      setErrorStatus('none');
      otpRef.current?.clear();
      setStep('enter-code');
    });
  };

  const handleVerify = () => {
    if (code.length !== 6) return;
    managerApiCall(
      verifyForgotOtp,
      { email: emailValue, otp: code },
      () => {
        setErrorStatus('none');
        setStep('new-password');
      },
      () => {
        setErrorStatus('incorrect');
      },
    );
  };

  const handleResendCode = () => {
    setCode('');
    setErrorStatus('none');
    otpRef.current?.clear();
    managerApiCall(forgotPassword, { email: emailValue }, () => {});
  };

  const handleResetPassword = () => {
    if (
      !newPasswordValue ||
      errors.newPassword ||
      newPasswordValue !== confirmPasswordValue
    )
      return;
    managerApiCall(
      resetPassword,
      { email: emailValue, otp: code, password: newPasswordValue },
      () => {
        setStep('success');
      },
    );
  };

  const handleBackToSignIn = () => {
    reset(routesConstants.login);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      {/* Dynamic Header Close Row (Success screen does not show Close button) */}
      {step !== 'success' && (
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.closeButton}
            hitSlop={20}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      )}

      <CustomKeyboardScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          step === 'success' && styles.centerScroll,
          {
            paddingTop:
              step === 'success' ? insets.top + spacing.macro : spacing.l,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {step !== 'success' ? (
          <>
            {/* Step 0/1 Headings */}
            <View style={styles.titleContainer}>
              <AppText variant="display" style={styles.title}>
                {step === 'new-password'
                  ? 'Set a new password.'
                  : step === 'request-code'
                  ? 'Reset your password.'
                  : 'Enter the code.'}
              </AppText>
              <AppText variant="body" style={styles.subtitle}>
                {step === 'new-password'
                  ? 'Choose a strong password at least 8 characters.'
                  : step === 'request-code'
                  ? "Enter your email and we'll send a six-digit reset code. Codes expire after 15 minutes."
                  : 'We sent a six-digit code to your email. It expires in 15 minutes.'}
              </AppText>
            </View>

            {/* Step 0: Request Code fields */}
            {step === 'request-code' && (
              <View style={styles.formContainer}>
                <FormInput
                  name="email"
                  control={control}
                  placeholder="you@company.com.au"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<MailIcon color={colors.body} />}
                />
              </View>
            )}

            {/* Step 1: Enter code fields */}
            {step === 'enter-code' && (
              <View style={styles.emailCard}>
                <MailIcon
                  color={colors.muted}
                  size={22}
                  style={styles.mailIcon}
                />
                <View style={styles.emailTextWrapper}>
                  <AppText style={styles.codeSentLabel}>Code sent to</AppText>
                  <AppText style={styles.emailValueText}>
                    {getValues('email') || 'dave@robsonroofing.com.au'}
                  </AppText>
                </View>
              </View>
            )}

            {/* OTP Section (visible on step 1: enter-code) */}
            {step === 'enter-code' && (
              <View style={styles.otpSection}>
                <AppText style={styles.otpSectionLabel}>Reset code</AppText>

                <OtpInput
                  ref={otpRef}
                  numberOfDigits={6}
                  disabled={errorStatus === 'expired'}
                  autoFocus={true}
                  focusColor={colors.ink}
                  blurOnFilled={true}
                  textInputProps={{
                    caretHidden: true,
                    cursorColor: colors.ink,
                  }}
                  onTextChange={text => {
                    setCode(text);
                    if (errorStatus !== 'none') setErrorStatus('none');
                  }}
                  onFocus={() => {
                    if (errorStatus === 'incorrect') {
                      setErrorStatus('none');
                    }
                  }}
                  theme={{
                    inputsContainerStyle: styles.otpBoxesRow,
                    pinCodeContainerStyle: StyleSheet.flatten([
                      styles.otpBox,
                      errorStatus === 'incorrect' && styles.otpBoxError,
                    ]),
                    pinCodeTextStyle: StyleSheet.flatten([
                      styles.otpText,
                      errorStatus === 'incorrect' && styles.otpTextError,
                      errorStatus === 'expired' && styles.otpTextDisabled,
                    ]),
                    focusStickStyle: styles.cursor,
                    focusedPinCodeContainerStyle: StyleSheet.flatten([
                      styles.otpBoxActive,
                    ]),
                    filledPinCodeContainerStyle: StyleSheet.flatten([
                      styles.otpBoxFilled,
                      errorStatus === 'incorrect' && styles.otpBoxError,
                    ]),

                    disabledPinCodeContainerStyle: styles.otpBoxDisabled,
                  }}
                />

                {/* Inline error feedback messages */}
                {step === 'enter-code' && errorStatus === 'incorrect' && (
                  <AppText style={styles.errorText}>
                    That code's incorrect. Check it or resend below.
                  </AppText>
                )}
                {step === 'enter-code' && errorStatus === 'expired' && (
                  <AppText style={styles.errorText}>
                    That code expired. Tap resend to get a new one.
                  </AppText>
                )}

                {/* Resend code option link */}
                {step === 'enter-code' && (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    style={styles.resendContainer}
                    activeOpacity={0.7}
                  >
                    <AppText style={styles.resendLinkText}>Resend code</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Step 2: New Password stacked forms */}
            {step === 'new-password' && (
              <View style={styles.formContainer}>
                <FormInput
                  name="newPassword"
                  control={control}
                  label="New password"
                  placeholder="•••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <FormInput
                  name="confirmPassword"
                  control={control}
                  label="Re-type password"
                  placeholder="•••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Bottom Primary Button CTAs */}
            <View style={styles.buttonContainer}>
              {step === 'request-code' && (
                <CustomButton
                  title="Send OTP"
                  disabled={!emailValue || !!errors.email}
                  onPress={handleSendOTP}
                />
              )}
              {step === 'enter-code' && (
                <CustomButton
                  title="Verify"
                  disabled={code.length !== 6 || errorStatus === 'expired'}
                  onPress={handleVerify}
                />
              )}
              {step === 'new-password' && (
                <CustomButton
                  title="Reset password"
                  disabled={
                    !newPasswordValue ||
                    !!errors.newPassword ||
                    !confirmPasswordValue ||
                    !!errors.confirmPassword
                  }
                  onPress={handleResetPassword}
                />
              )}
            </View>
          </>
        ) : (
          /* Step 3: Success Content View */
          <View style={styles.successWrapper}>
            <View style={styles.successWrapper}>
              <SuccessCheckIcon />
              <AppText variant="display" style={styles.successTitle}>
                Password reset.
              </AppText>
              <AppText variant="body" style={styles.successSubtitle}>
                You're all set. Sign in with your new password.
              </AppText>
            </View>

            <CustomButton
              title="Back to sign in"
              onPress={handleBackToSignIn}
              style={styles.successButton}
            />
          </View>
        )}
      </CustomKeyboardScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ground,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  centerScroll: {
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.ink,
    fontFamily: fontFamily.heading,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    color: colors.body,
    lineHeight: 24,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: spacing.xl,
  },
  mailIcon: {
    marginRight: 14,
  },
  emailTextWrapper: {
    flex: 1,
  },
  codeSentLabel: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.medium,
    color: colors.muted,
    marginBottom: 8,
  },
  emailValueText: {
    fontSize: fontSizes.f18,
    fontFamily: fontFamily.regular,
    color: colors.ink,
  },
  formContainer: {
    marginBottom: spacing.l,
  },
  otpSection: {
    marginBottom: spacing.xl,
  },
  otpSectionLabel: {
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    marginBottom: spacing.xxs,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  otpBox: {
    width: width * 0.13,
    height: width * 0.16,
    backgroundColor: colors.fieldInactive,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  otpBoxActive: {
    backgroundColor: colors.fieldActive,
    borderWidth: 1.5,
    borderColor: colors.fieldInactive,
  },
  otpBoxFilled: {
    backgroundColor: colors.fieldInactive,
  },
  otpBoxDisabled: {
    backgroundColor: colors.fieldInactive,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  otpBoxError: {
    backgroundColor: colors.fieldActive,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  otpText: {
    fontSize: fontSizes.f26,
    fontFamily: fontFamily.heading,
    color: colors.ink,
  },
  otpTextError: {
    color: colors.error,
  },
  otpTextDisabled: {
    color: colors.muted,
  },
  cursor: {
    width: 2,
    height: fontSizes.f26,
    backgroundColor: colors.ink,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.regular,
  },
  resendContainer: {
    alignSelf: 'flex-end',
    marginTop: spacing.s,
  },
  resendLinkText: {
    color: colors.link,
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  successWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  successBadge: {
    width: 90,
    height: 90,
    borderRadius: 90,
    backgroundColor: colors.successTint, // Quiet success green tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  successTitle: {
    color: colors.ink,
    fontFamily: fontFamily.heading,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    color: colors.body,
    fontSize: fontSizes.f16,
    textAlign: 'center',
  },
  successButton: {
    width: '100%',
    marginTop: 'auto',
  },
});

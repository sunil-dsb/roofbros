import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import FlowHeader from '../../components/FlowHeader';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { spacing, width } from '../../themes/spacing';
import MailIcon from '../../assets/icons/mailIcon';
import { navigate, reset, goBack } from '../../navigations/navigationServices';
import { routesConstants } from '../../navigations/routeConstants';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';

import Loader from '../../components/loader';
import { setLoaderOn, setLoaderOff } from '../../helper/commonFunctions';
import {
  useVerifyEmailMutation,
  useSendOtpMutation,
} from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useDispatch } from 'react-redux';
import { setToken, setUserData } from '../../redux/slices/persistedSlice';

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const email = route.params?.email || 'dave@robsonroofing.com.au';
  const password = route.params?.password || '';
  const fullName = route.params?.fullName || '';

  const [otp, setOtp] = useState('');
  const [isError, setIsError] = useState(false);
  const [verifyEmail] = useVerifyEmailMutation();
  const [sendOtp] = useSendOtpMutation();

  const otpRef = useRef<OtpInputRef>(null);

  useEffect(() => {
    managerApiCall(sendOtp, { email }, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) {
      setIsError(true);
      return;
    }
    Keyboard.dismiss();
    managerApiCall(
      verifyEmail,
      { email, otp },
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
      () => {
        setIsError(true);
      },
    );
  };

  const handleResend = async () => {
    Keyboard.dismiss();
    setIsError(false);
    setOtp('');
    otpRef.current?.clear();
    managerApiCall(sendOtp, { email }, () => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      <FlowHeader onBackPress={() => goBack()} style={styles.header} />
      <CustomKeyboardScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Verify your email.
          </AppText>
          <AppText style={styles.subtitle}>
            We sent a six-digit code to your inbox. Enter it to confirm your
            address it's how you'll reset your password later.
          </AppText>

          {/* Email Info Card */}
          <View style={styles.emailCard}>
            <MailIcon color={colors.muted} size={22} style={styles.mailIcon} />
            <View style={styles.emailTextWrapper}>
              <AppText style={styles.codeSentLabel}>Code sent to</AppText>
              <AppText style={styles.emailValueText}>{email}</AppText>
            </View>
          </View>

          <View style={styles.otpSection}>
            <AppText style={styles.otpLabel}>Verification code</AppText>

            <OtpInput
              ref={otpRef}
              numberOfDigits={OTP_LENGTH}
              focusColor={colors.ink}
              blurOnFilled={true}
              textInputProps={{
                caretHidden: true,
                cursorColor: colors.ink,
              }}
              onTextChange={text => {
                setOtp(text);
                if (isError) setIsError(false);
              }}
              theme={{
                inputsContainerStyle: styles.otpInputContainer,
                pinCodeContainerStyle: StyleSheet.flatten([
                  styles.otpBox,
                  isError && styles.otpBoxError,
                ]),
                pinCodeTextStyle: StyleSheet.flatten([
                  styles.otpText,
                  isError && styles.otpBoxError,
                ]),
                focusStickStyle: styles.cursor,
                focusedPinCodeContainerStyle: styles.otpBoxActive,
                filledPinCodeContainerStyle: StyleSheet.flatten([
                  styles.otpBoxFilled,
                  isError && styles.otpBoxError,
                ]),
              }}
            />

            {isError ? (
              <AppText style={styles.errorText}>
                That code's incorrect. Check it or resend below.
              </AppText>
            ) : null}

            <View style={styles.resendContainer}>
              <TouchableOpacity onPress={handleResend}>
                <AppText style={styles.resendText}>Resend code</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CustomKeyboardScrollView>
      <View style={styles.footer}>
        <CustomButton
          title="Verify email"
          onPress={handleVerify}
          disabled={otp.length !== OTP_LENGTH}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    color: colors.body,
    lineHeight: 24,
    marginBottom: spacing.l,
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
  otpSection: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    marginBottom: 8,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpBox: {
    width: width * 0.13,
    height: width * 0.16,
    backgroundColor: colors.fieldInactive,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  otpBoxActive: {
    backgroundColor: colors.fieldActive,
    borderColor: colors.fieldInactive,
  },
  otpBoxFilled: {
    backgroundColor: colors.fieldActive,
    borderColor: colors.fieldInactive,
  },
  otpBoxError: {
    backgroundColor: colors.fieldActive,
    borderColor: colors.error,
    color: colors.error,
  },
  otpText: {
    fontSize: fontSizes.f26,
    fontFamily: fontFamily.heading,
    color: colors.ink,
  },
  cursor: {
    width: 2,
    height: fontSizes.f26,
    backgroundColor: colors.ink,
  },
  errorText: {
    fontSize: fontSizes.f13,
    color: colors.error,
    fontFamily: fontFamily.regular,
    marginBottom: 8,
  },
  resendContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  resendText: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.semiBold,
    color: colors.link,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

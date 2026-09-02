import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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
import FlowHeader from '../../components/FlowHeader';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { useDispatch } from 'react-redux';
import { goBack, reset } from '../../navigations/navigationServices';
import { routesConstants } from '../../navigations/routeConstants';
import CheckIcon from '../../assets/icons/checkIcon';
import { width } from '../../themes/spacing';
import Loader from '../../components/loader';
import { useChangePasswordMutation } from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { DataManager } from '../../helper/dataManager';
import { resetPersistStore } from '../../redux/slices/persistedSlice';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be at most 128 characters')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'New password must contain at least one special character',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [changePassword] = useChangePasswordMutation();

  const { control, handleSubmit, watch, formState: { isValid } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword') || '';
  const currentPassword = watch('currentPassword') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const hasMinLength = newPassword.length >= 8;
  const isDifferent = newPassword.length > 0 && newPassword !== currentPassword;
  const isMatching =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdate = (data: ChangePasswordForm) => {
    managerApiCall(
      changePassword,
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      async () => {
        await DataManager.clearDataManager();
        dispatch(resetPersistStore());
        reset(routesConstants.login);
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      <FlowHeader onBackPress={goBack} />
      <CustomKeyboardScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Change password
          </AppText>
          <AppText style={styles.subtitle}>
            Update your password to keep your account secure.
          </AppText>

          <View style={styles.formGroup}>
            <FormInput
              name="currentPassword"
              control={control}
              label="Current password"
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              cursorColor={colors.ink}
            />

            <FormInput
              name="newPassword"
              control={control}
              label="New password"
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              cursorColor={colors.ink}
            />

            <FormInput
              name="confirmPassword"
              control={control}
              label="Confirm new password"
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              cursorColor={colors.ink}
            />
          </View>

          <View style={styles.rulesCard}>
            <AppText style={styles.rulesHeader}>PASSWORD REQUIREMENTS</AppText>
            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleCheck,
                  hasMinLength && styles.ruleCheckActive,
                ]}
              >
                {hasMinLength && <CheckIcon color={colors.ground} size={11} />}
              </View>
              <AppText
                style={[styles.ruleText, hasMinLength && styles.ruleTextActive]}
              >
                At least 8 characters long
              </AppText>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleCheck,
                  isDifferent && styles.ruleCheckActive,
                ]}
              >
                {isDifferent && <CheckIcon color={colors.ground} size={11} />}
              </View>
              <AppText
                style={[styles.ruleText, isDifferent && styles.ruleTextActive]}
              >
                Different from current password
              </AppText>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[styles.ruleCheck, isMatching && styles.ruleCheckActive]}
              >
                {isMatching && <CheckIcon color={colors.ground} size={11} />}
              </View>
              <AppText
                style={[styles.ruleText, isMatching && styles.ruleTextActive]}
              >
                Passwords match
              </AppText>
            </View>
          </View>
        </View>
      </CustomKeyboardScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title="Update password"
          onPress={handleSubmit(handleUpdate)}
          disabled={!isValid || !isDifferent}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  content: {
    paddingTop: 8,
  },
  title: {
    fontSize: fontSizes.f28,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 22,
  },
  formGroup: {
    gap: 16,
    marginBottom: 24,
  },
  rulesCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 12,
  },
  rulesHeader: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f12,
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fieldInactive,
  },
  ruleCheckActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  ruleText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  ruleTextActive: {
    color: colors.ink,
    fontFamily: fontFamily.medium,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.ground,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingBottom: width * 0.05,
  },
});

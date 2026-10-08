import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import AppModal from '../../components/AppModal';
import StackedInput from '../../components/StackedInput';
import FlowHeader from '../../components/FlowHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { goBack } from '../../navigations/navigationServices';
import TrashIcon from '../../assets/icons/trashIcon';
import WarnIcon from '../../assets/icons/warnIcon';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import {
  setLoaderOn,
  setLoaderOff,
  performLocalLogout,
} from '../../helper/commonFunctions';
import { width } from '../../themes/spacing';
import { useDeleteAccountMutation } from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useSelector } from 'react-redux';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

const DeleteAccount = () => {
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, watch } = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
    },
  });

  const password = watch('password');

  const { userData } = useSelector((state: any) => state.persist);
  // Using a broad check for social provider. Adjust field name if it's different (e.g. social_provider, isSocial)
  const isSocialUser =
    userData?.authProvider === 'google' || userData?.authProvider === 'apple';

  const [deleteAccountApi] = useDeleteAccountMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const confirmDelete = () => {
    setIsModalVisible(true);
  };

  const executeDelete = () => {
    setIsModalVisible(false);
    managerApiCall(
      deleteAccountApi,
      isSocialUser ? {} : { password: password },
      () => {
        performLocalLogout();
      },
      () => {
        // Error handling is managed by managerApiCall automatically
      },
    );
  };

  const handleDelete = (data: DeleteAccountForm) => {
    confirmDelete();
  };

  const handleSocialDelete = () => {
    confirmDelete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onBackPress={goBack} style={styles.header} />
      <CustomKeyboardScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Delete account
          </AppText>
          <AppText style={styles.subtitle}>
            This permanently removes your account and everything in it.
          </AppText>

          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <WarnIcon color={colors.warning} size={18} />
            </View>
            <View style={styles.warningTextContainer}>
              <AppText style={styles.warningText}>
                <AppText style={styles.warningTextBold}>
                  This can't be undone.{' '}
                </AppText>
                Your jobs, quotes, measurements and photos are permanently
                deleted.
              </AppText>
            </View>
          </View>

          {!isSocialUser && (
            <View style={styles.formContainer}>
              <FormInput
                name="password"
                control={control}
                label="Enter your password to confirm"
                secureTextEntry
                autoCapitalize="none"
                placeholder="••••••••"
                style={styles.passwordInput}
              />
            </View>
          )}
        </View>
      </CustomKeyboardScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          variant="dangerOutline"
          title="Delete my account"
          onPress={
            isSocialUser ? handleSocialDelete : handleSubmit(handleDelete)
          }
          disabled={!isSocialUser && !password}
          style={styles.deleteButton}
          iconLeft={<TrashIcon color={colors.error} size={20} />}
        />
        <CustomButton variant="secondary" title="Cancel" onPress={goBack} />
      </View>

      <AppModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Delete Account"
        description={"Are you sure you want to delete your account?\n\nYour account will be scheduled for deletion and permanently removed after 15 days. You can restore your account anytime during this period by simply logging back in."}
      >
        <View style={{ gap: 12, marginTop: 12 }}>
          <CustomButton
            variant="dangerOutline"
            title="Delete"
            onPress={executeDelete}
          />
          <CustomButton
            variant="primary"
            title="Cancel"
            onPress={() => setIsModalVisible(false)}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  );
};

export default DeleteAccount;

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
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 24,
  },
  warningCard: {
    backgroundColor: colors.warningTint,
    borderWidth: 1,
    borderColor: '#D49B5A', // Approx border color for warning tint
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.regular,
    color: colors.warning,
    lineHeight: 20,
  },
  warningTextBold: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.semiBold,
    color: colors.warning,
  },
  formContainer: {
    marginTop: 8,
  },
  passwordInput: {
    backgroundColor: colors.fieldInactive, // Match image grey bg
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    borderTopWidth: 0,
    gap: 12,
    paddingBottom: width * 0.05,
  },
  deleteButton: {
    // Add specific styling if needed, but dangerOutline handles most of it
  },
});

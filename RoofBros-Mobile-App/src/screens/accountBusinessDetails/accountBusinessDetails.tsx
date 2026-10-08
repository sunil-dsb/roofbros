import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import AppText from '../../components/AppText';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import BackIcon from '../../assets/icons/backIcon';
import MailIcon from '../../assets/icons/mailIcon';
import { goBack } from '../../navigations/navigationServices';
import FormInput from '../../components/FormInput';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { width, spacing } from '../../themes/spacing';

const accountBusinessDetailsSchema = z.object({
  fullName: z.string().optional(),
  businessName: z.string().min(1, 'Business name is required'),
  abn: z.string().min(1, 'ABN is required'),
});

type AccountBusinessDetailsForm = z.infer<typeof accountBusinessDetailsSchema>;

const AccountBusinessDetails = () => {
  const { userData } = useSelector((state: any) => state.persist);
  console.log('userData', userData);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<AccountBusinessDetailsForm>({
    resolver: zodResolver(accountBusinessDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: userData?.name || userData?.fullName || '',
      businessName: userData?.businessName || '',
      abn: userData?.abn || '',
    },
  });

  const handleSave = async (data: AccountBusinessDetailsForm) => {};

  return (
    <SafeAreaView style={styles.container}>
      <CustomKeyboardScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Back Button */}
        <TouchableOpacity
          onPress={() => goBack()}
          style={styles.backCircleBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon color={colors.ink} size={20} />
        </TouchableOpacity>

        <AppText variant="title" style={styles.title}>
          Business details
        </AppText>
        <AppText style={styles.subtitle}>
          These print on every quote and delivery docket.
        </AppText>

        <View style={styles.formContainer}>
          <FormInput
            name="fullName"
            control={control}
            label="Full name"
            placeholder="Enter your full name"
            editable={false}
          />
          <FormInput
            name="businessName"
            control={control}
            label="Business name"
            placeholder="Enter business name"
            editable={false}
          />
          <FormInput
            name="abn"
            control={control}
            label="ABN"
            placeholder="Enter ABN"
            keyboardType="numeric"
            editable={false}
          />
        </View>

        {/* Email Card (Locked sign-in info) */}
        <View style={styles.emailCard}>
          <MailIcon color={colors.muted} size={20} style={styles.emailIcon} />
          <View style={styles.emailTextContainer}>
            <AppText style={styles.emailCaption}>
              Email (sign-in) · ask support to change
            </AppText>
            <AppText style={styles.emailValue}>{userData?.email || ''}</AppText>
          </View>
        </View>
      </CustomKeyboardScrollView>
    </SafeAreaView>
  );
};

export default AccountBusinessDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexGrow: 1,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f28,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.regular,
    color: colors.body,
    marginBottom: 24,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 16,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    marginBottom: 24,
  },
  emailIcon: {
    marginTop: 2,
  },
  emailTextContainer: {
    flex: 1,
  },
  emailCaption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.muted,
    marginBottom: 8,
  },
  emailValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f18,
    color: colors.ink,
  },
});

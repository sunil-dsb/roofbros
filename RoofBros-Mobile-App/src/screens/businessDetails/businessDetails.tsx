import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppText from '../../components/AppText';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import CheckIcon from '../../assets/icons/checkIcon';
import CloseIcon from '../../assets/icons/closeIcon';
import { goBack, navigate, reset } from '../../navigations/navigationServices';
import { routesConstants } from '../../navigations/routeConstants';
import FormInput from '../../components/FormInput';
import StackedInput from '../../components/StackedInput';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLazyGetBusinessDetailsQuery,
  useUpdateBusinessDetailsMutation,
} from '../../redux/services/authApi';
import { setUserData } from '../../redux/slices/persistedSlice';
import { setLoaderOn, setLoaderOff } from '../../helper/commonFunctions';
import { width } from '../../themes/spacing';
import Loader from '../../components/loader';
import { managerApiCall } from '../../helper/manageApiCallFun';

const businessDetailsSchema = z.object({
  abn: z
    .string()
    .min(1, 'ABN is required')
    .refine(
      val => val.replace(/\D/g, '').length === 11,
      'ABN must be 11 digits',
    ),
  businessName: z.string().min(1, 'Business name is required'),
});

type BusinessDetailsForm = z.infer<typeof businessDetailsSchema>;

const BusinessDetails = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isValid, errors },
  } = useForm<BusinessDetailsForm>({
    resolver: zodResolver(businessDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      abn: '',
      businessName: '',
    },
  });

  const abnValue = watch('abn');
  const cleanAbn = abnValue.replace(/\D/g, '');
  const lastFetchedAbn = useRef('');

  const isAbnValid = cleanAbn.length === 11 && !errors.abn;

  const { userData } = useSelector((state: any) => state.persist);
  const [getBusinessDetails, { isFetching: isFetchingName }] =
    useLazyGetBusinessDetailsQuery();
  const [updateBusinessDetails] = useUpdateBusinessDetailsMutation();
  const [abnApiError, setAbnApiError] = useState(false);

  const fetchBusinessDetails = useCallback(() => {
    setAbnApiError(false);
    managerApiCall(
      getBusinessDetails,
      cleanAbn,
      (res: any) => {
        const fetchedName =
          res?.data?.EntityName ||
          (Array.isArray(res?.data?.BusinessName) &&
            res?.data?.BusinessName[0]) ||
          res?.data?.BusinessName ||
          res?.data?.name ||
          res?.data?.businessName ||
          res?.data?.entityName;
        if (fetchedName) {
          setValue('businessName', fetchedName, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          trigger();
        } else {
          setAbnApiError(true);
        }
      },
      () => {
        setAbnApiError(true);
      },
      true,
    );
  }, [cleanAbn, getBusinessDetails, setValue, trigger]);

  useEffect(() => {
    if (cleanAbn.length === 11 && cleanAbn !== lastFetchedAbn.current) {
      lastFetchedAbn.current = cleanAbn;
      fetchBusinessDetails();
    }
  }, [cleanAbn, fetchBusinessDetails]);

  const handleSave = async (data: BusinessDetailsForm) => {
    const payload = {
      abn: data.abn,
      businessName: data.businessName,
    };
    managerApiCall(
      updateBusinessDetails,
      payload,
      (res: any) => {
        if (res?.data) {
          dispatch(setUserData(res.data));
        }
        reset(routesConstants.welcomeFirstRun);
      },
      () => {},
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader />
      <CustomKeyboardScrollView contentContainerStyle={styles.scrollContainer}>
        <AppText variant="display" style={styles.title}>
          Set up your business.
        </AppText>
        <AppText style={styles.subtitle}>
          Just once. This prints on every quote and delivery docket.
        </AppText>

        <View style={styles.formContainer}>
          <FormInput
            name="abn"
            control={control}
            label="ABN"
            placeholder="Enter your ABN"
            keyboardType="numeric"
            maxLength={11}
            rightElement={
              isAbnValid ? (
                abnApiError ? (
                  <CloseIcon color={colors.error} size={20} />
                ) : (
                  <CheckIcon color={colors.success} size={20} />
                )
              ) : undefined
            }
          />
          <FormInput
            name="businessName"
            control={control}
            label="Business name"
            placeholder="Filled from your ABN"
            editable={false}
            rightElement={
              isFetchingName ? (
                <ActivityIndicator color={colors.ink} size="small" />
              ) : abnApiError ? (
                <TouchableOpacity onPress={fetchBusinessDetails}>
                  <AppText
                    style={{ color: colors.error, fontSize: fontSizes.f14 }}
                  >
                    Retry
                  </AppText>
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* {!isError && isValid && ( */}
        <AppText style={styles.infoText}>
          ABN checked against the free ABN Lookup register we filled your
          business name from it. Registered for GST.
        </AppText>
        {/* )} */}
      </CustomKeyboardScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title="Save & continue"
          disabled={!isValid}
          onPress={handleSubmit(handleSave)}
        />
      </View>
    </SafeAreaView>
  );
};

export default BusinessDetails;

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
  title: {
    fontFamily: fontFamily.heading,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    marginBottom: 24,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 24,
  },
  infoText: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,

    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

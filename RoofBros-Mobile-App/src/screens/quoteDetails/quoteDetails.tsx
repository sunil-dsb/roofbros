import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { updateQuoteData, resetQuoteData, setCurrentJob } from '../../redux/slices/globalSlice';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { spacing, width } from '../../themes/spacing';
import StackedInput from '../../components/StackedInput';
import { managerApiCall } from '../../helper/manageApiCallFun';
import {
  useCalculateMaterialMutation,
  useCreateJobMutation,
  useCreateJobQuoteMutation,
  useLazyGetSingleJobQuoteDetailQuery,
} from '../../redux/services/homeApi';

const formatKey = (str: string) => {
  let formatted = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  formatted = formatted.replace(/_/g, ' ');
  formatted = formatted.toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Helper to map UI quote fields
const mapQuoteDataForUI = (rawData: any) => {
  const uiData: any = {};
  if (rawData.totalTiles !== undefined) uiData.totalTiles = rawData.totalTiles;
  if (rawData.topCoatBuckets !== undefined)
    uiData.topCoatBuckets = rawData.topCoatBuckets;
  if (rawData.primer !== undefined) uiData.primer = rawData.primer;
  if (rawData.primerType !== undefined) uiData.primerType = rawData.primerType;
  return uiData;
};

const QuoteDetails = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const fromQuotesList = route.params?.fromQuotesList;
  const quoteId = route.params?.quote?.id;

  const [getSingleQuote] = useLazyGetSingleJobQuoteDetailQuery();
  const dispatch = useDispatch();
  const [apiQuoteData, setApiQuoteData] = useState<any>({});
  const [rawQuoteData, setRawQuoteData] = useState<any>(
    route.params?.quote || {},
  );

  const globalQuoteData = useSelector(
    (state: RootState) => state.global.quoteData,
  );

  const currentJob = useSelector((state: RootState) => state.global.currentJob);

  // Extract info from either global state or the fresh quote API data
  const address = fromQuotesList
    ? currentJob?.address || rawQuoteData?.job?.address || '14 Banksia St, Ryde'
    : globalQuoteData?.address || '14 Banksia St, Ryde';

  const jobType = fromQuotesList
    ? rawQuoteData?.jobType || 'Restoration'
    : globalQuoteData?.jobType || 'Restoration';

  const [calculateMaterial] = useCalculateMaterialMutation();
  const [createJob] = useCreateJobMutation();
  const [createJobQuote] = useCreateJobQuoteMutation();

  React.useEffect(() => {
    if (fromQuotesList) {
      const fallbackData = route.params?.quote || {};

      // Setup fallback first
      if (fallbackData && Object.keys(fallbackData).length > 0) {
        setApiQuoteData(mapQuoteDataForUI(fallbackData));
      }

      if (quoteId) {
        managerApiCall(
          getSingleQuote,
          quoteId,
          (res: any) => {
            const rawData = res?.data || res || {};
            if (rawData && Object.keys(rawData).length > 0) {
              setRawQuoteData(rawData);
              setApiQuoteData(mapQuoteDataForUI(rawData));
            }
          },
          (err: any) => console.log('Failed to fetch single quote detail', err),
        );
      }
      return;
    }

    if (!globalQuoteData || Object.keys(globalQuoteData).length === 0) {
      return;
    }

    const rawJobType =
      globalQuoteData?.jobType?.toLowerCase() === 'restoration' ||
      globalQuoteData?.jobType?.toLowerCase() === 'roof restoration'
        ? 'roof restoration'
        : 'new roof installation';

    const payload = {
      jobType: rawJobType,
      tileTypeId: globalQuoteData?.tileTypeId || '',
      tileProfileId: globalQuoteData?.tileProfileId || '',
      area_sq_mt: Number(globalQuoteData?.area_sq_mt) || 0,
    };

    managerApiCall(
      calculateMaterial,
      payload,
      (res: any) => {
        setApiQuoteData(res.data || res);
      },
      (err: any) => {
        console.log('Error fetching material calculation:', err);
      },
    );
  }, [
    globalQuoteData,
    fromQuotesList,
    quoteId,
    getSingleQuote,
    route.params?.quote,
  ]);

  const handleNext = () => {
    if (fromQuotesList) {
      navigate(routesConstants.deliveryRequest, {
        quoteItem: { rawQuote: rawQuoteData },
      });
    } else {
      const rawJobType =
        globalQuoteData?.jobType?.toLowerCase() === 'restoration' ||
        globalQuoteData?.jobType?.toLowerCase() === 'roof restoration'
          ? 'roof restoration'
          : 'new roof installation';

      if (globalQuoteData?.existingJobId) {
        const createJobQuotePayload = {
          jobType: rawJobType,
          tileTypeId: globalQuoteData?.tileTypeId || '',
          tileProfileId: globalQuoteData?.tileProfileId || '',
          tileColorId: globalQuoteData?.tileColorId || '',
          area_sq_mt: Number(globalQuoteData?.area_sq_mt) || 0,
          topCoatBuckets: Number(apiQuoteData?.['top coat buckets'] || apiQuoteData?.topCoatBuckets) || 0,
          primerType: globalQuoteData?.primerType || 'Terracotta Primer',
          primer: Number(apiQuoteData?.primer) || 0,
          totalTiles: Number(apiQuoteData?.totalTiles) || 0,
        };

        managerApiCall(
          createJobQuote,
          { id: globalQuoteData.existingJobId, body: createJobQuotePayload },
          (res: any) => {
            const resData = res?.data || res || {};
            const qNum = resData?.quoteNumber || resData?.activeQuote?.quoteNumber || 'Q-XXX';
            const price = resData?.totalPrice || resData?.activeQuote?.totalPrice || 'TBD';
            
            dispatch(resetQuoteData());
            navigate(routesConstants.quoteSaved, {
              quoteNumber: qNum,
              price: price,
              address: address,
              rawQuote: resData,
            });
          },
          (err: any) => {
            console.log('Error creating job quote:', err);
          },
        );
      } else {
        const createJobPayload = {
          jobType: rawJobType,
          address: globalQuoteData?.address || '',
          area_sq_mt: Number(globalQuoteData?.area_sq_mt) || 0,
          confidence: Number(globalQuoteData?.confidence) || 0,
          pitch: Number(globalQuoteData?.pitch) || 0,
          tilesize: Number(globalQuoteData?.tilesize) || 0,
          totalTiles: Number(apiQuoteData?.totalTiles) || 0,
          area_square: Number(globalQuoteData?.area_square) || 1,
          roofImage: globalQuoteData?.roofImage || '',
          tileTypeId: globalQuoteData?.tileTypeId || '',
          tileProfileId: globalQuoteData?.tileProfileId || '',
          tileColorId: globalQuoteData?.tileColorId || '',
          'top coat buckets': apiQuoteData?.['top coat buckets'] || 0,
          primer: apiQuoteData?.primer || 0,
          jobStatus: 'quoted',
          additionalNotes: globalQuoteData?.additionalNotes || '',
          urgent: globalQuoteData?.urgent || false,
        };

        managerApiCall(
          createJob,
          createJobPayload,
          (res: any) => {
            const resData = res?.data || res || {};
            const qNum = resData?.quoteNumber || resData?.activeQuote?.quoteNumber || 'Q-XXX';
            const price = resData?.totalPrice || resData?.activeQuote?.totalPrice || 'TBD';
            
            dispatch(setCurrentJob(resData));
            dispatch(resetQuoteData());
            navigate(routesConstants.quoteSaved, {
              quoteNumber: qNum,
              price: price,
              address: address,
              rawQuote: resData,
            });
          },
          (err: any) => {
            console.log('Error creating job:', err);
          },
        );
      }
    }
  };

  const buttonTitle = fromQuotesList ? 'Request delivery' : 'Save quote';

  return (
    <SafeAreaView style={styles.container}>
      {fromQuotesList ? (
        <FlowHeader onBackPress={() => goBack()} />
      ) : (
        <FlowHeader
          onBackPress={() => goBack()}
          onClosePress={() => popToTop()}
          currentStep={6}
          totalSteps={6}
        />
      )}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <AppText variant="title" style={styles.title}>
          Quote
        </AppText>
        <AppText style={styles.subtitle}>
          {`${jobType.charAt(0).toUpperCase() + jobType.slice(1)}`}
        </AppText>
        <AppText style={[styles.subtitle, { marginBottom: 16 }]}>
          {address}
        </AppText>

        <FlashList<any>
          data={Object.entries(apiQuoteData)}
          style={styles.content}
          getItemType={() => 'item'}
          ItemSeparatorComponent={() => (
            <View style={styles.cardItem}>
              <View style={styles.divider} />
            </View>
          )}
          renderItem={({ item }: { item: any }) => {
            const [key, value] = item;
            const formattedKey = formatKey(key);
            return (
              <View style={[styles.lineItem]}>
                <View style={styles.itemTextCol}>
                  <AppText style={styles.itemName}>{formattedKey}</AppText>
                </View>
                <View style={styles.itemValueCol}>
                  <AppText
                    style={{
                      fontSize: fontSizes.f16,
                      fontFamily: fontFamily.medium,
                      textAlign: 'right',
                    }}
                  >
                    {String(value)}
                  </AppText>
                </View>
              </View>
            );
          }}
        />
      </View>

      <View style={[styles.footer]}>
        <CustomButton title={buttonTitle} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
};

export default QuoteDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginBottom: spacing.s,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 24,
    lineHeight: 24,
  },
  cardTop: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  cardItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  cardBottom: {
    backgroundColor: colors.panel,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f12,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineSoft,
    marginVertical: 4,
  },
  itemTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  itemDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    marginTop: 4,
  },
  itemValueCol: {
    alignItems: 'flex-end',
  },
  qtyInput: {
    width: width * 0.2,
    height: width * 0.1,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
  itemPriceBold: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
    fontSize: fontSizes.f13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8, // slight inset
  },
  totalItems: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.ink,
  },
  totalGst: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.ink,
    marginTop: 2,
  },
  totalPrice: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f28,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

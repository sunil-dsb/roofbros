import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { updateQuoteData } from '../../redux/slices/globalSlice';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import WarnIcon from '../../assets/icons/warnIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { width } from '../../themes/spacing';
import { useGetNearmapRoofDetailsQuery } from '../../redux/services/homeApi';
import { getImageUrl } from '../../helper/commonFunctions';
import RoofOverlay from '../../components/RoofOverlay';

const ShimmerLoader = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.muted, opacity },
      ]}
    />
  );
};

const MeasurementReview = () => {
  const globalQuoteData = useSelector(
    (state: RootState) => state.global.quoteData,
  );
  const jobType = globalQuoteData?.jobType || 'restoration';
  const address = globalQuoteData?.address || '';

  const dispatch = useDispatch();

  // Pulls instantly from RTK Query cache!
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetNearmapRoofDetailsQuery(address, {
    skip: !address,
  });
  const isLoadingData = isLoading || isFetching;

  const roofDetails = apiResponse?.data || {
    area_sq_mt: '230',
    pitch: '22.4',
    tilesize: '4096',
    totalTiles: '3487',
    roofImage: null,
    confidence: 98,
  };
  const isEdited = false;

  // Use confidence from API if available
  const confidence = roofDetails.confidence
    ? Math.round(roofDetails.confidence)
    : isEdited
    ? 98
    : 78;
  const isLowConfidence = confidence < 80;

  const handleNext = () => {
    dispatch(
      updateQuoteData({
        area_sq_mt: Number(roofDetails.area_sq_mt) || 0,
        pitch: Number(roofDetails.pitch) || 0,
        tilesize: Number(roofDetails.tilesize) || 0,
        totalTiles: Number(roofDetails.totalTiles) || 0,
        confidence: confidence || 0,
        roofImage: roofDetails.roofImage || '',
      }),
    );
    if (jobType === 'restoration') {
      navigate(routesConstants.existingRoof, { jobType, flow: 'newJob' });
    } else {
      navigate(routesConstants.chooseTile, { jobType, flow: 'newJob' });
    }
  };

  const handleAdjust = () => {
    navigate(routesConstants.adjustOutline, { roofDetails, jobType, address });
  };
  const imageUrl = roofDetails.roofImage
    ? (getImageUrl(roofDetails.roofImage) as any)?.uri
    : null;
  const apiBbox: string | undefined = roofDetails.bbox;
  const geometry = roofDetails.geometry;

  // Use the API bbox for projection as it corresponds to the image bounds
  const bbox: string | undefined = apiBbox;

  const hasOverlay =
    imageUrl &&
    bbox &&
    geometry?.type === 'Polygon' &&
    geometry?.coordinates?.length > 0;

  const MAP_HEIGHT = width * 0.7;

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()}
        currentStep={4}
        totalSteps={6}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Measurement
        </AppText>

        <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
          <View style={styles.mapPlaceholder}>
            {isLoadingData && !hasOverlay ? (
              <ShimmerLoader />
            ) : hasOverlay ? (
              <RoofOverlay
                imageUrl={imageUrl!}
                bbox={bbox!}
                geometry={geometry}
                imageWidth={width * 0.9}
                imageHeight={MAP_HEIGHT}
              />
            ) : roofDetails.roofImage ? (
              <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                {/* fallback plain image when no geometry */}
              </View>
            ) : null}
            <View style={[StyleSheet.absoluteFill, styles.mapOverlay]}>
              <View
                style={[
                  styles.mapPill,
                  isLowConfidence && styles.mapPillWarning,
                ]}
              >
                <AppText style={styles.mapPillText}>
                  {confidence}% confidence
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {isLowConfidence && (
          <View style={styles.warningBanner}>
            <View style={styles.warningIcon}>
              <WarnIcon color="#B45309" size={20} />
            </View>
            <AppText style={styles.warningText}>
              <AppText style={styles.warningTextBold}>
                Low confidence ({confidence}%).
              </AppText>{' '}
              Trees or shadow may be hiding edges. Check the outline against the
              image before you quote: a wrong area throws off the whole price.
            </AppText>
          </View>
        )}

        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={[styles.gridItem]}>
              <AppText variant="data">
                {roofDetails.area_sq_mt}
                <AppText style={styles.unit}> m²</AppText>
              </AppText>
              <AppText style={styles.gridLabel}>ROOF AREA</AppText>
            </View>
            <View style={[styles.gridItem]}>
              <AppText variant="data">
                {roofDetails.pitch ? Number(roofDetails.pitch).toFixed(2) : '-'}
                <AppText style={styles.unit}>°</AppText>
              </AppText>
              <AppText style={styles.gridLabel}>PITCH</AppText>
            </View>
          </View>
          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View style={[styles.gridItem]}>
              <AppText variant="data">{roofDetails.tilesize}</AppText>
              <AppText style={styles.gridLabel}>TILE SIZE</AppText>
            </View>
            <View style={styles.gridItem}>
              <AppText variant="data">{roofDetails.totalTiles}</AppText>
              <AppText style={styles.gridLabel}>TOTAL TILES</AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title={
            // isLowConfidence
            //   ? 'Adjust measurement'
            //   :
            jobType === 'restoration' ? 'Choose coating' : 'Choose tile'
          }
          onPress={
            // isLowConfidence ?
            // handleAdjust:
            handleNext
          }
          style={styles.primaryFooterBtn}
        />
        {/* <CustomButton
          title={
            isLowConfidence ? 'Use these figures anyway' : 'Adjust measurement'
          }
          onPress={isLowConfidence ? handleNext : handleAdjust}
          variant="secondary"
        /> */}
      </View>
    </SafeAreaView>
  );
};

export default MeasurementReview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,

    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 24,
  },
  mapContainer: {
    height: width * 0.7,
    backgroundColor: colors.lineSoft,
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    // backgroundColor: '#b0c4de',
  },
  mapOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  mapPill: {
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  mapPillWarning: {
    backgroundColor: '#B45309', // Warning color
  },
  mapPillText: {
    color: colors.ground,
    fontSize: fontSizes.f13,
    fontFamily: fontFamily.medium,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warningTint, // amber-100
    borderWidth: 1,
    borderColor: colors.warning, // amber-300
    padding: 16,
    marginBottom: 24,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    color: '#92400E', // amber-800
    fontSize: fontSizes.f14,
    lineHeight: 20,
  },
  warningTextBold: {
    fontFamily: fontFamily.semiBold,
    color: '#92400E',
  },
  grid: {
    backgroundColor: colors.surface,
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unit: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink, // Note: the design has units slightly smaller
  },
  gridLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f12,
    color: colors.ink,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
  primaryFooterBtn: {
    marginBottom: 12,
  },
});

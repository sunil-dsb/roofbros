import React, { useRef, useState, useCallback, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import { useLazyGetNearmapRoofDetailsQuery } from '../../redux/services/homeApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import AppText from '../../components/AppText';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import FlowHeader from '../../components/FlowHeader';
import CheckIcon from '../../assets/icons/checkIcon';
import { appImages } from '../../themes/appImages';
import { Image } from 'react-native';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { width } from '../../themes/spacing';

const Measuring = () => {
  const navigation = useNavigation();
  const globalQuoteData = useSelector(
    (state: RootState) => state.global.quoteData,
  );
  const jobType = globalQuoteData?.jobType || 'restoration';
  const address = globalQuoteData?.address || '14 Banksia St, Ryde';
  const mapLocation = globalQuoteData?.mapLocation || {
    latitude: -33.8688,
    longitude: 151.2093,
  };
  const [getNearmapRoofDetails] = useLazyGetNearmapRoofDetailsQuery();

  const scannerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [timelineStep, setTimelineStep] = useState(1);
  const line1Progress = useRef(new Animated.Value(0)).current;
  const line2Progress = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      // Reset state for when returning to this screen
      setTimelineStep(1);
      scannerAnim.setValue(0);
      progressAnim.setValue(0);
      line1Progress.setValue(0);
      line2Progress.setValue(0);
      pulseScale.setValue(1);
      pulseOpacity.setValue(1);

      // Start scanner animation
      const scannerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scannerAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scannerAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
      scannerLoop.start();

      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      let apiPromise: any = null;
      let isAborted = false;

      const runMeasurementProcess = async () => {
        // Start progress up to 50% while locating
        Animated.timing(progressAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }).start();

        Animated.timing(line1Progress, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        // Step 1: Locating (fetch API using managerApiCall)
        managerApiCall(
          async payload => {
            apiPromise = getNearmapRoofDetails(payload);
            const response = await apiPromise;
            // Intercept abort to prevent managerApiCall from showing an error toast
            if (isAborted) {
              return { data: { success: true, message: '' } };
            }
            return response;
          },
          address,
          async resData => {
            if (!mounted || !navigation.isFocused()) return;

            // Step 2: Tracing (simulate delay for visual effect)
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setTimelineStep(2);

            Animated.timing(progressAnim, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: false,
            }).start();

            Animated.timing(line2Progress, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }).start();

            await new Promise(r => setTimeout(() => r(null), 1200));
            if (!mounted || !navigation.isFocused()) return;

            // Step 3: Calculating
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setTimelineStep(3);

            Animated.timing(progressAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }).start();

            await new Promise(r => setTimeout(() => r(null), 1000));
            if (!mounted || !navigation.isFocused()) return;

            // Navigate with result
            navigate(routesConstants.measurementReview);
          },
          error => {
            console.error('Measurement API Error:', error);
            if (mounted && navigation.isFocused()) {
              goBack();
            }
          },
          'skipLoader',
        );
      };

      runMeasurementProcess();

      return () => {
        mounted = false;
        isAborted = true;
        if (apiPromise) {
          apiPromise.abort();
        }
        scannerLoop.stop();
        pulseLoop.stop();
      };
    }, [
      scannerAnim,
      progressAnim,
      line1Progress,
      line2Progress,
      pulseScale,
      pulseOpacity,
      address,
      jobType,
      getNearmapRoofDetails,
    ]),
  );

  const scannerTranslateY = scannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240], // Map height is 240
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()}
        currentStep={3} // It's still on step 2 (measuring is part of the "Measure" phase)
        totalSteps={6}
      />

      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Measuring...
        </AppText>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapPlaceholder}
            initialRegion={{
              latitude: mapLocation.latitude,
              longitude: mapLocation.longitude,
              latitudeDelta: 0.0003,
              longitudeDelta: 0.0003,
            }}
            mapType="satellite"
            showsUserLocation={false}
            showsCompass={false}
            scrollEnabled={false}
            zoomEnabled={false}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.5)' },
            ]}
          />
          <View style={styles.addressPill}>
            <AppText style={styles.addressPillText}>{address}</AppText>
          </View>
          <Animated.View
            style={[
              styles.scannerGlowContainer,
              { transform: [{ translateY: scannerTranslateY }] },
            ]}
          >
            <Svg width="100%" height={36} style={{ position: 'absolute' }}>
              <Defs>
                <LinearGradient id="scanBeam" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                  <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <Stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="36"
                fill="url(#scanBeam)"
              />
            </Svg>
            <View style={styles.scannerCoreLine} />
          </Animated.View>
        </View>
        <View style={styles.mapProgressBackground}>
          <Animated.View
            style={[styles.mapProgressFill, { width: progressWidth }]}
          />
        </View>
        <View style={styles.timelineContainer}>
          {/* Step 1: Locating */}
          <View style={styles.timelineRow}>
            <View style={styles.iconCol}>
              {timelineStep > 1 ? (
                <AnimatedCheckCircle />
              ) : (
                <AnimatedTargetCircle
                  pulseScale={pulseScale}
                  pulseOpacity={pulseOpacity}
                />
              )}
              <View style={styles.lineContainer}>
                <Animated.View
                  style={[
                    styles.lineFill,
                    {
                      height: line1Progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.textCol}>
              <AppText
                style={
                  timelineStep > 1
                    ? styles.stepTextActive
                    : styles.stepTextCurrent
                }
              >
                Locating your roof
              </AppText>
            </View>
          </View>

          {/* Step 2: Tracing */}
          <View style={styles.timelineRow}>
            <View style={styles.iconCol}>
              {timelineStep > 2 ? (
                <AnimatedCheckCircle />
              ) : timelineStep === 2 ? (
                <AnimatedTargetCircle
                  pulseScale={pulseScale}
                  pulseOpacity={pulseOpacity}
                />
              ) : (
                <View style={styles.inactiveCircle} />
              )}
              <View style={styles.lineContainer}>
                <Animated.View
                  style={[
                    styles.lineFill,
                    {
                      height: line2Progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.textCol}>
              <AppText
                style={
                  timelineStep > 2
                    ? styles.stepTextActive
                    : timelineStep === 2
                    ? styles.stepTextCurrent
                    : styles.stepTextInactive
                }
              >
                Tracing roof edges...
              </AppText>
            </View>
          </View>

          {/* Step 3: Calculating */}
          <View style={styles.timelineRow}>
            <View style={styles.iconCol}>
              {timelineStep === 3 ? (
                <AnimatedTargetCircle
                  pulseScale={pulseScale}
                  pulseOpacity={pulseOpacity}
                />
              ) : (
                <View style={styles.inactiveCircle} />
              )}
            </View>
            <View style={styles.textCol}>
              <AppText
                style={
                  timelineStep === 3
                    ? styles.stepTextCurrent
                    : styles.stepTextInactive
                }
              >
                Calculating area and pitch
              </AppText>
              <AppText style={styles.description}>
                The outline draws itself on your roof as we trace it. Every edge
                you see is measured.
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const AnimatedCheckCircle = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.checkCircle,
        { transform: [{ scale: anim }], opacity: anim },
      ]}
    >
      <CheckIcon color={colors.ground} size={14} />
    </Animated.View>
  );
};

const AnimatedTargetCircle = ({ pulseScale, pulseOpacity }: any) => {
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mountAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [mountAnim]);

  return (
    <Animated.View
      style={[
        styles.targetContainer,
        { transform: [{ scale: mountAnim }], opacity: mountAnim },
      ]}
    >
      <Animated.View
        style={[
          styles.targetPulse,
          { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
        ]}
      />
      <View style={styles.targetCircle}>
        <View style={styles.targetInnerCircle} />
      </View>
    </Animated.View>
  );
};

export default Measuring;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 24,
  },
  mapContainer: {
    height: 240,
    width: '100%',
    backgroundColor: colors.lineSoft,
    marginBottom: 32,
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mapProgressBackground: {
    height: 3,
    backgroundColor: colors.line,
  },
  mapProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  addressPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    maxWidth: width * 0.8,
  },
  addressPillText: {
    color: colors.ground,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  scannerGlowContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 36,
    marginTop: -18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  scannerCoreLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  timelineContainer: {
    marginVertical: 32,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  iconCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  textCol: {
    paddingBottom: 24, // spacing between steps
  },
  targetContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ground,
  },
  targetInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  inactiveCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  lineContainer: {
    width: 2,
    height: 45,
    backgroundColor: colors.line,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  lineFill: {
    width: '100%',
    backgroundColor: colors.success,
  },
  stepTextActive: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginTop: 2,
  },
  stepTextCurrent: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginTop: 2,
  },
  stepTextInactive: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.muted,
    marginTop: 2,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
    marginRight: 30,
  },
});

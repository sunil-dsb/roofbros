import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing } from '../../themes/spacing';
import { appImages } from '../../themes/appImages';
import { routesConstants } from '../../navigations/routeConstants';
import { navigate, resetToRoute } from '../../navigations/navigationServices';
import CloseIcon from '../../assets/icons/closeIcon';
import CheckIcon from '../../assets/icons/checkIcon';
import ArrowRightIcon from '../../assets/icons/arrowRightIcon';

const { width } = Dimensions.get('window');

const carouselData = [
  {
    id: 'c1',
    image: appImages.ba1After,
    caption: 'Satellite-accurate roof measurements.',
  },
  {
    id: 'c2',
    image: appImages.ba2After,
    caption: 'Dozens of recycled tile colours.',
  },
  {
    id: 'c3',
    image: appImages.ba3After,
    caption: 'Delivery Australia-wide, straight to site.',
  },
];

const tourSteps = [
  {
    id: 1,
    title: 'Measure',
    description:
      'Drop a pin on the address and we’ll trace the roofline for you.',
  },
  {
    id: 2,
    title: 'Quote',
    description: 'Get an instant price based on your roof’s measurements.',
  },
  {
    id: 3,
    title: 'Preview colour',
    description:
      'See how different recycled tile colours look on your actual roof.',
  },
  {
    id: 4,
    title: 'Request delivery',
    description: 'Choose a date and we’ll deliver straight to site.',
  },
];

interface FadeCarouselSlideProps {
  item: (typeof carouselData)[0];
  index: number;
  activeIndex: number;
}

const FadeCarouselSlide = ({
  item,
  index,
  activeIndex,
}: FadeCarouselSlideProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(activeIndex === index ? 1 : 0, {
      duration: 800,
    });
  }, [activeIndex, index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents={activeIndex === index ? 'auto' : 'none'}
    >
      <Image source={item.image} style={styles.carouselImg} />

      {/* Visual Gradient Overlay (corresponds to ::after stylesheet rules) */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient
              id={`carGrad-${index}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#100b07" stopOpacity="0.92" />
              <Stop offset="32%" stopColor="#100b07" stopOpacity="0.6" />
              <Stop offset="62%" stopColor="#100b07" stopOpacity="0.05" />
              <Stop offset="78%" stopColor="#100b07" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#carGrad-${index})`}
          />
        </Svg>
      </View>

      {/* Overlaid caption text */}
      <AppText style={styles.carouselCaption}>{item.caption}</AppText>
    </Animated.View>
  );
};

interface CarouselDotProps {
  index: number;
  length: number;
  progress: SharedValue<number>;
}

const CarouselDot = ({ index, length, progress }: CarouselDotProps) => {
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    if (index === 0 && progress.value > length - 0.5) {
      inputRange = [length - 1, length, length + 1];
    }

    const widthValue = interpolate(
      progress.value,
      inputRange,
      [8, 24, 8],
      'clamp',
    );
    const opacityValue = interpolate(
      progress.value,
      inputRange,
      [0.45, 1, 0.45],
      'clamp',
    );
    return {
      width: widthValue,
      opacity: opacityValue,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        {
          backgroundColor: colors.link,
        },
      ]}
    />
  );
};

interface TourDotProps {
  index: number;
  progress: SharedValue<number>;
}

const TourDot = ({ index, progress }: TourDotProps) => {
  const animStyle = useAnimatedStyle(() => {
    const widthValue = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [8, 24, 8],
      'clamp',
    );
    const opacityValue = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0.35, 1, 0.35],
      'clamp',
    );
    return {
      width: widthValue,
      opacity: opacityValue,
    };
  });

  return (
    <Animated.View
      style={[
        styles.tourDot,
        animStyle,
        {
          backgroundColor: colors.link,
        },
      ]}
    />
  );
};

const WelcomeFirstRun = () => {
  const insets = useSafeAreaInsets();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(0);

  const carouselProgress = useSharedValue(0);
  const tourProgress = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselIndex === 0 && carouselProgress.value > 1.5) {
      carouselProgress.value = withTiming(
        carouselData.length,
        { duration: 600 },
        finished => {
          if (finished) {
            carouselProgress.value = 0;
          }
        },
      );
    } else {
      carouselProgress.value = withTiming(carouselIndex, { duration: 600 });
    }
  }, [carouselIndex, carouselProgress]);

  const handleTourScroll = (event: any) => {
    const cardWidth = 260 + 12; // card width (260) + gap (12)
    const offset = event.nativeEvent.contentOffset.x;
    tourProgress.value = offset / cardWidth;

    const index = Math.round(offset / cardWidth);
    if (index !== tourIndex && index >= 0 && index < tourSteps.length) {
      setTourIndex(index);
    }
  };

  const dismissFirstRun = () => {
    navigate(routesConstants.bottomTab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: spacing.s,
            paddingBottom: insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header close button aligned with design */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={dismissFirstRun}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <CloseIcon stroke={colors.ink} width={20} height={20} />
          </TouchableOpacity>
        </View>
        <AppText variant="display" style={styles.greeting}>
          Welcome, Dave.
        </AppText>

        {/* Carousel Showcase Section */}
        <View style={styles.carouselContainer}>
          {carouselData.map((item, index) => (
            <FadeCarouselSlide
              key={item.id}
              item={item}
              index={index}
              activeIndex={carouselIndex}
            />
          ))}

          {/* Pagination Indicators - Absolute overlaid on bottom right of the image */}
          <View style={styles.dotsContainer}>
            {carouselData.map((_, i) => (
              <CarouselDot
                key={i}
                index={i}
                length={carouselData.length}
                progress={carouselProgress}
              />
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.sectionContainer}>
          <AppText style={styles.sectionLabel}>How it works</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tourTrack}
            snapToInterval={272} // 260 width + 12 gap
            decelerationRate="fast"
            onScroll={handleTourScroll}
            scrollEventThrottle={16}
          >
            {tourSteps.map(step => (
              <View key={step.id} style={styles.tourCard}>
                {/* Step badge with red corner ticks */}
                <View style={styles.tourBadge}>
                  <AppText style={styles.tourBadgeText}>{step.id}</AppText>
                  <View style={[styles.cornerTick, styles.tickTL]} />
                  <View style={[styles.cornerTick, styles.tickTR]} />
                  <View style={[styles.cornerTick, styles.tickBL]} />
                  <View style={[styles.cornerTick, styles.tickBR]} />
                </View>

                {/* Card title with inline arrow for subsequent steps */}
                <View style={styles.tourTitleRow}>
                  {step.id > 1 && (
                    <View style={styles.tourArrowInline}>
                      <ArrowRightIcon
                        stroke={colors.accent}
                        width={14}
                        height={14}
                        strokeWidth={2.5}
                      />
                    </View>
                  )}
                  <AppText variant="heading" style={styles.tourTitle}>
                    {step.title}
                  </AppText>
                </View>

                <AppText variant="body" style={styles.tourDesc}>
                  {step.description}
                </AppText>
              </View>
            ))}
          </ScrollView>

          {/* Tour Pagination Indicators - aligned left beneath the track */}
          <View style={styles.tourDotsContainer}>
            {tourSteps.map((_, i) => (
              <TourDot key={i} index={i} progress={tourProgress} />
            ))}
          </View>
        </View>

        {/* Sample List Showcase */}
        <View style={styles.sectionContainer}>
          <AppText style={styles.sectionLabel}>
            What your jobs list will look like
          </AppText>
          <View style={styles.sampleJobsList}>
            {/* Card 1: Requested */}
            <View style={styles.jobCard}>
              <Image source={appImages.ba1Before} style={styles.jobCardThumb} />
              <View style={styles.jobCardInfo}>
                <AppText style={styles.jobCardTitle}>
                  21 Hume Hwy, Chull...
                </AppText>
                <AppText style={styles.jobCardSubtitle}>
                  Delivery requested ·
                </AppText>
                <AppText style={styles.jobCardSubtitle}>today</AppText>
              </View>
              <View style={styles.jobCardStatusContainer}>
                <View style={[styles.statusBadge, styles.badgeRequested]}>
                  <AppText
                    style={[styles.statusText, { color: colors.warning }]}
                  >
                    REQUESTED
                  </AppText>
                </View>
                <AppText style={styles.jobCardPrice}>$9,480</AppText>
              </View>
            </View>

            {/* Card 2: Quoted */}
            <View style={styles.jobCard}>
              <Image source={appImages.ba2Before} style={styles.jobCardThumb} />
              <View style={styles.jobCardInfo}>
                <AppText style={styles.jobCardTitle}>
                  14 Banksia St, Ryde
                </AppText>
                <AppText style={styles.jobCardSubtitle}>
                  Restoration · New Install
                </AppText>
              </View>
              <View style={styles.jobCardStatusContainer}>
                <View style={[styles.statusBadge, styles.badgeQuotedBlue]}>
                  <AppText style={[styles.statusText, { color: colors.link }]}>
                    QUOTED
                  </AppText>
                  <View style={styles.warningDot} />
                </View>
                <AppText style={styles.jobCardPrice}>2 quotes</AppText>
              </View>
            </View>

            {/* Card 3: Delivered */}
            <View style={styles.jobCard}>
              <Image source={appImages.ba3After} style={styles.jobCardThumb} />
              <View style={styles.jobCardInfo}>
                <AppText style={styles.jobCardTitle}>
                  3 Coral Ave, Cronulla
                </AppText>
                <AppText style={styles.jobCardSubtitle}>
                  Elabana · New Install
                </AppText>
              </View>
              <View style={styles.jobCardStatusContainer}>
                <View style={[styles.statusBadge, styles.badgeDelivered]}>
                  <AppText
                    style={[styles.statusText, { color: colors.success }]}
                  >
                    DELIVERED
                  </AppText>
                </View>
                <AppText style={styles.jobCardPrice}>$24,120</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustContainer}>
          <View style={styles.trustRow}>
            <CheckIcon
              color={colors.success}
              width={20}
              height={20}
              strokeWidth={2}
            />
            <AppText style={styles.trustText}>
              Powered by Nearmap satellite imagery
            </AppText>
          </View>
          <View style={styles.trustRow}>
            <CheckIcon
              color={colors.success}
              width={20}
              height={20}
              strokeWidth={2}
            />
            <AppText style={styles.trustText}>
              Australian tile profiles built in
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA Button Container */}
      <View style={[styles.fixedBottomContainer]}>
        <CustomButton
          title="Measure your first roof"
          onPress={() => resetToRoute(routesConstants.newJob)}
          style={styles.ctaButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeFirstRun;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.s,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.ink, // --line-ink (#2D2012)
    backgroundColor: colors.ground, // --surface (#FFFFFF)
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: spacing.s,
  },
  greeting: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    color: colors.ink,
    marginBottom: spacing.s,
  },
  carouselContainer: {
    width: '100%',
    height: 220,
    marginBottom: spacing.l,
    position: 'relative',
  },
  carouselSlide: {
    width: width - spacing.m * 2,
    height: 220,
    borderRadius: 0, // flat boundaries
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselCaption: {
    position: 'absolute',
    left: 14,
    right: 56, // leave gap on right for overlay dots
    bottom: 13,
    color: colors.ground,
    fontSize: fontSizes.f17, // t-heading
    fontFamily: fontFamily.medium,
    lineHeight: 24,
    zIndex: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 17,
    right: 14,
    zIndex: 2,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.link,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // --line-soft translucent
  },
  sectionContainer: {
    marginBottom: spacing.s,
  },
  sectionLabel: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.semiBold,
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  tourTrack: {
    paddingRight: spacing.m,
    gap: 12,
  },
  tourCard: {
    width: 260,
    backgroundColor: colors.ground, // Powder (#ECF1F4) panels
    padding: spacing.m,
    borderRadius: 0, // Spec: 0 = structure radius
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  tourBadge: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: colors.ground,
  },
  tourBadgeText: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f15, // caption (13px)
    color: colors.ink,
  },
  cornerTick: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: colors.accent,
  },
  tickTL: { top: -2, left: -2 },
  tickTR: { top: -2, right: -2 },
  tickBL: { bottom: -2, left: -2 },
  tickBR: { bottom: -2, right: -2 },
  tourTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tourArrowInline: {
    marginRight: 6,
  },
  tourTitle: {
    fontSize: fontSizes.f18, // --t-heading
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  tourDesc: {
    fontSize: fontSizes.f16, // --t-body
    fontFamily: fontFamily.regular,
    color: colors.body,
    lineHeight: 20,
  },
  tourDotsContainer: {
    flexDirection: 'row',
    marginTop: spacing.s,
    justifyContent: 'flex-start',
  },
  tourDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  tourDotActive: {
    width: 24,
    backgroundColor: colors.link,
  },
  tourDotInactive: {
    width: 8,
    backgroundColor: colors.lineSoft,
  },
  sampleJobsList: {
    width: '100%',
  },
  jobCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    marginBottom: spacing.s,
    borderRadius: 0,
  },
  jobCardThumb: {
    width: 56,
    height: 56,
    resizeMode: 'cover',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  jobCardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  jobCardTitle: {
    fontSize: fontSizes.f15, // --t-body
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  jobCardSubtitle: {
    fontSize: fontSizes.f13, // --t-caption
    fontFamily: fontFamily.regular,
    color: colors.muted,
    marginTop: 2,
  },
  jobCardStatusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999, // pill
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeMeasured: {
    backgroundColor: colors.panel,
  },
  badgeRequested: {
    backgroundColor: '#FBEEDC', // --warn-tint
  },
  badgeQuoted: {
    backgroundColor: '#FBEEDC', // --warn-tint
  },
  badgeQuotedBlue: {
    backgroundColor: '#E3ECF9', // light blue tint
  },
  badgeDelivered: {
    backgroundColor: colors.successTint,
  },
  statusText: {
    fontSize: fontSizes.f11, // --t-micro
    fontFamily: fontFamily.semiBold,
    letterSpacing: 11 * 0.05, // +5%
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginLeft: 5,
  },
  jobCardPrice: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.heading,
    color: colors.ink,
    marginTop: 4,
  },
  trustContainer: {
    gap: spacing.s,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: fontSizes.f14, // --t-caption
    fontFamily: fontFamily.regular,
    color: colors.body,
    marginLeft: spacing.xs,
  },
  ctaButton: {
    width: '100%',
  },
  fixedBottomContainer: {
    paddingHorizontal: 20,
    paddingTop: spacing.s,
    backgroundColor: colors.ground,
    borderTopWidth: 1,
    borderColor: colors.lineSoft,
    paddingBottom: width * 0.05,
  },
});

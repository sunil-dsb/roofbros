import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  SharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import fontSizes from '../../themes/fontSizes';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { navigate } from '../../navigations/navigationServices';
import { appImages } from '../../themes/appImages';
import { width, height, spacing } from '../../themes/spacing';
import CompareIcon from '../../assets/icons/compareIcon';

const slidesData = [
  {
    id: 'slide1',
    before: appImages.ba1Before,
    after: appImages.ba1After,
    title: 'From tired to transformed.',
    description:
      'Measure a roof, quote it, and preview the new tile colour on the real thing.',
  },
  {
    id: 'slide2',
    before: appImages.ba2Before,
    after: appImages.ba2After,
    title: 'See it before you commit.',
    description:
      'Preview dozens of recycled tile colours on your own roof photo.',
  },
  {
    id: 'slide3',
    before: appImages.ba3Before,
    after: appImages.ba3After,
    title: 'Delivered, not just quoted.',
    description:
      'Book recycled-tile delivery or pickup, all from the same app.',
  },
];

const DragIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 7L3 12L8 17M16 7L21 12L16 17"
      stroke={colors.ink}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface BeforeAfterSliderProps {
  beforeImage: any;
  afterImage: any;
  isDragging: (dragging: boolean) => void;
  insets: any;
}

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  isDragging,
  insets,
}: BeforeAfterSliderProps) => {
  const splitX = useSharedValue(width / 2);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(isDragging)(true);
    })
    .onUpdate(event => {
      splitX.value = Math.max(0, Math.min(width, event.x));
    })
    .onEnd(() => {
      runOnJS(isDragging)(false);
    });

  const beforeContainerStyle = useAnimatedStyle(() => ({
    width: splitX.value,
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: splitX.value }],
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <View style={styles.sliderContainer}>
        {/* After Image (Bottom Layer, always visible on the right) */}
        <View style={StyleSheet.absoluteFill}>
          <Animated.Image
            source={afterImage}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>

        {/* Before Image (Top Layer, Clipped via Width, visible on the left) */}
        <Animated.View
          style={[
            { position: 'absolute', top: 0, left: 0, bottom: 0 },
            beforeContainerStyle,
            styles.beforeWrapper,
          ]}
        >
          <Animated.Image
            source={beforeImage}
            style={{ width: width, height: height }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* BEFORE & AFTER Pills - Fixed size, unclipped overlay */}
        <View
          style={[
            styles.pill,
            styles.beforePill,
            { top: insets.top + spacing.s },
          ]}
          pointerEvents="none"
        >
          <AppText style={styles.pillText}>BEFORE</AppText>
        </View>
        <View
          style={[
            styles.pill,
            styles.afterPill,
            { top: insets.top + spacing.s },
          ]}
          pointerEvents="none"
        >
          <AppText style={styles.pillText}>AFTER</AppText>
        </View>

        {/* Divider Line (On top of badges) */}
        <Animated.View style={[styles.dividerLine, dividerStyle]} />

        {/* Center Drag Handle (On top of badges) */}
        <Animated.View style={[styles.handleCircle, dividerStyle]}>
          {/* <DragIcon /> */}
          <CompareIcon color={colors.accent} size={17} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

interface PaginationItemProps {
  index: number;
  length: number;
  animValue: SharedValue<number>;
}

const PaginationItem = ({ index, length, animValue }: PaginationItemProps) => {
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    const outputRange = [8, 24, 8];

    if (index === 0 && animValue.value > length - 0.5) {
      inputRange = [length - 1, length, length + 1];
    }

    const widthValue = interpolate(
      animValue.value,
      inputRange,
      outputRange,
      'clamp',
    );

    const opacityValue = interpolate(
      animValue.value,
      inputRange,
      [0.25, 1, 0.25],
      'clamp',
    );

    return {
      width: widthValue,
      opacity: opacityValue,
    };
  }, [animValue, index, length]);

  return <Animated.View style={[styles.dot, animStyle]} />;
};

const FadeSlide = ({
  item,
  index,
  activeIndex,
  setIsDragging,
  insets,
}: {
  item: (typeof slidesData)[0];
  index: number;
  activeIndex: number;
  setIsDragging: (dragging: boolean) => void;
  insets: any;
}) => {
  const opacity = useSharedValue(index === 0 ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(activeIndex === index ? 1 : 0, {
      duration: 800,
    });
  }, [activeIndex, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents={activeIndex === index ? 'auto' : 'none'}
    >
      <BeforeAfterSlider
        beforeImage={item.before}
        afterImage={item.after}
        isDragging={setIsDragging}
        insets={insets}
      />
    </Animated.View>
  );
};

const Welcome = () => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const progressValue = useSharedValue<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoPlay) {
      interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % slidesData.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    if (activeIndex === 0 && progressValue.value > 1.5) {
      progressValue.value = withTiming(
        slidesData.length,
        { duration: 600 },
        finished => {
          if (finished) {
            progressValue.value = 0;
          }
        },
      );
    } else {
      progressValue.value = withTiming(activeIndex, { duration: 600 });
    }
  }, [activeIndex]);

  const handleGetStarted = () => {
    navigate(routesConstants.signUp);
  };

  const handleLogin = () => {
    navigate(routesConstants.login);
  };

  const setIsDragging = (dragging: boolean) => {
    setAutoPlay(!dragging);
  };

  const currentSlide = slidesData[activeIndex];

  return (
    <View style={styles.container}>
      {/* Onboarding Carousel Background */}
      <View style={{ width: width, height: height }}>
        {slidesData.map((item, index) => (
          <FadeSlide
            key={item.id}
            item={item}
            index={index}
            activeIndex={activeIndex}
            setIsDragging={setIsDragging}
            insets={insets}
          />
        ))}
      </View>

      {/* Gradient Fade Overlay at the bottom of the carousel */}
      <View style={styles.gradientOverlay}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.ground} stopOpacity="0" />
              <Stop offset="50%" stopColor={colors.ground} stopOpacity="0.85" />
              <Stop offset="60%" stopColor={colors.ground} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>

      {/* Bottom Content Sheet (Transparent overlaid layout) */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + width * 0.05 },
        ]}
      >
        {/* Pagination Indicators */}
        <View style={styles.paginationContainer}>
          {slidesData.map((_, index) => (
            <PaginationItem
              key={index}
              index={index}
              length={slidesData.length}
              animValue={progressValue}
            />
          ))}
        </View>

        {/* Dynamic Onboarding Copy */}
        <AppText variant="display" style={styles.title}>
          {currentSlide.title}
        </AppText>
        <AppText variant="body" style={styles.description}>
          {currentSlide.description}
        </AppText>

        {/* CTAs */}
        <CustomButton
          title="Get started"
          variant="primary"
          onPress={handleGetStarted}
          style={styles.ctaButton}
        />

        <View style={styles.loginRow}>
          <AppText variant="caption" style={styles.loginText}>
            Already have an account?{' '}
          </AppText>
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
            <AppText variant="caption" style={styles.loginLink}>
              Sign in
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sliderContainer: {
    width: width,
    height: height,
  },
  beforeWrapper: {
    overflow: 'hidden',
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.ground,
    left: 0,
    zIndex: 10,
  },
  handleCircle: {
    position: 'absolute',
    top: '38%',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.ground,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    left: -23,
    zIndex: 10,
  },
  pill: {
    position: 'absolute',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(20, 14, 10, 0.78)',
    zIndex: 2,
  },
  beforePill: {
    left: 16,
  },
  afterPill: {
    right: 16,
  },
  pillText: {
    color: colors.ground,
    fontSize: fontSizes.f11,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.48,
    pointerEvents: 'none', // Allow touch gestures to pass through to the slider
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: spacing.m,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.link,
    marginHorizontal: 3,
  },
  title: {
    marginBottom: spacing.xs,
    color: colors.ink,
  },
  description: {
    color: colors.body,
    marginBottom: spacing.l,
  },
  ctaButton: {
    width: '100%',
    marginBottom: spacing.m,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.muted,
  },
  loginLink: {
    color: colors.link,
    fontFamily: fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
});

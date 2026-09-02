import React, { useState, useEffect, useRef } from 'react';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useLazyGetTileColorsQuery } from '../../redux/services/authApi';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { navigate, goBack } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import AppModal from '../../components/AppModal';
import SegmentedControl from '../../components/SegmentedControl';
import CheckIcon from '../../assets/icons/checkIcon';
import CompareIcon from '../../assets/icons/compareIcon';
import FastImage from '@d11/react-native-fast-image';
import { getImageUrl } from '../../helper/commonFunctions';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { width, spacing } from '../../themes/spacing';

const COLORS = [
  { id: '1', hex: '#3A3A3A', name: 'Titan Gloss' },
  { id: '2', hex: '#4A4C50', name: 'Bedrock' },
  { id: '3', hex: '#5E534B', name: 'Chocolate' },
  { id: '4', hex: '#A34229', name: 'Terracotta' },
  { id: '5', hex: '#877B6D', name: 'Taupe' },
];

const SkeletonItem = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <RNAnimated.View
      style={[
        style,
        {
          backgroundColor: colors.border || '#E0E3E7',
          opacity: pulseAnim,
        },
      ]}
    />
  );
};

const CompareColours = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const initialMode = route.params?.initialMode || 'One colour';

  const [mode, setMode] = useState(initialMode);

  const hasProfileId = !!route.params?.profileId;

  const [getTileColors] = useLazyGetTileColorsQuery();
  const [colorsList, setColorsList] = useState<any[]>(
    hasProfileId ? [] : COLORS,
  );
  const [isLoadingColours, setIsLoadingColours] = useState(hasProfileId);
  const coloursFadeAnim = useRef(new RNAnimated.Value(0)).current;

  const [selectedColor1, setSelectedColor1] = useState<any>(
    hasProfileId ? null : COLORS[0],
  );
  const [selectedColor2, setSelectedColor2] = useState<any>(
    hasProfileId ? null : COLORS[1],
  );
  const [showColourModal, setShowColourModal] = useState(false);

  useEffect(() => {
    const profileId = route.params?.profileId;
    if (profileId) {
      setIsLoadingColours(true);
      coloursFadeAnim.setValue(0);
      managerApiCall(
        getTileColors,
        profileId,
        (res: any) => {
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.tiles)
            ? res.tiles
            : Array.isArray(res?.colors)
            ? res.colors
            : Array.isArray(res)
            ? res
            : [];
          if (list.length > 0) {
            setColorsList(list);
            setSelectedColor1(list[0]);
            setSelectedColor2(list.length > 1 ? list[1] : list[0]);
          } else {
            setColorsList(COLORS);
            setSelectedColor1(COLORS[0]);
            setSelectedColor2(COLORS[1]);
          }
          setIsLoadingColours(false);
          RNAnimated.timing(coloursFadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();
        },
        () => {
          setColorsList(COLORS);
          setSelectedColor1(COLORS[0]);
          setSelectedColor2(COLORS[1]);
          setIsLoadingColours(false);
        },
        true,
      );
    }
  }, [route.params?.profileId]);

  // Animated opacity driving the texture fade: 1 = tile visible, 0 = plain colour
  const textureOpacity = useSharedValue(1);
  // Pill label crossfade: 1 = 'Hold to see original', 0 = 'Release to restore'
  const pillLabelOpacity1 = useSharedValue(1);
  const pillLabelOpacity2 = useSharedValue(0);

  const handleHoldStart = () => {
    textureOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    pillLabelOpacity1.value = withTiming(0, { duration: 200 });
    pillLabelOpacity2.value = withTiming(1, { duration: 200 });
  };

  const handleHoldEnd = () => {
    textureOpacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
    pillLabelOpacity1.value = withTiming(1, { duration: 200 });
    pillLabelOpacity2.value = withTiming(0, { duration: 200 });
  };

  const pillLabel1Style = useAnimatedStyle(() => ({
    opacity: pillLabelOpacity1.value,
  }));
  const pillLabel2Style = useAnimatedStyle(() => ({
    opacity: pillLabelOpacity2.value,
  }));

  const CONTAINER_WIDTH = width - 28;
  const splitX = useSharedValue(CONTAINER_WIDTH / 2);

  const dragGesture = Gesture.Pan().onUpdate(event => {
    splitX.value = Math.max(30, Math.min(CONTAINER_WIDTH - 30, event.x));
  });

  const leftHalfStyle = useAnimatedStyle(() => ({
    width: splitX.value,
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: splitX.value }],
  }));

  const handleSave = () => {
    navigate(routesConstants.quoteDetails);
  };

  const handleBuildQuotePress = () => {
    if (mode === 'Compare two') {
      setShowColourModal(true);
    } else {
      handleSave();
    }
  };

  const handleSelectColourForQuote = (color: any) => {
    setShowColourModal(false);
    handleSave();
  };

  const buttonTitle =
    mode === 'One colour' && selectedColor1?.name
      ? `Build quote in ${selectedColor1.name}`
      : 'Build quote';

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onBackPress={() => goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.headerTitle}>
          Try a colour
        </AppText>
        <View style={styles.segmentedContainer}>
          <SegmentedControl
            options={['One colour', 'Compare two']}
            selectedValue={mode}
            onValueChange={setMode}
          />
        </View>

        {isLoadingColours ? (
          <View>
            <SkeletonItem style={styles.texturePlaceholder} />
            <View style={styles.detailsContainer}>
              <SkeletonItem style={styles.nameSkeleton} />
            </View>
            <View style={styles.swatchRow}>
              {[1, 2, 3, 4, 5].map(key => (
                <SkeletonItem key={key} style={styles.swatchSkeleton} />
              ))}
            </View>
          </View>
        ) : (
          <RNAnimated.View
            style={{
              opacity: coloursFadeAnim,
              transform: [
                {
                  translateY: coloursFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            {mode === 'One colour' ? (
              <View>
                <Pressable
                  onPressIn={handleHoldStart}
                  onPressOut={handleHoldEnd}
                >
                  <View
                    style={[
                      styles.texturePlaceholder,
                      {
                        backgroundColor:
                          selectedColor1.hexCode ||
                          selectedColor1.color ||
                          selectedColor1.hex ||
                          '#373838',
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFill,
                        { opacity: textureOpacity },
                      ]}
                    >
                      <FastImage
                        source={getImageUrl(selectedColor1.imageUrl)}
                        style={StyleSheet.absoluteFill}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </Animated.View>
                    <View style={styles.holdPill}>
                      <Animated.Text
                        style={[styles.holdPillText, pillLabel1Style]}
                      >
                        Hold to see original
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          styles.holdPillText,
                          styles.holdPillTextOverlay,
                          pillLabel2Style,
                        ]}
                      >
                        Release to restore
                      </Animated.Text>
                    </View>
                  </View>
                </Pressable>

                <View style={styles.detailsContainer}>
                  <AppText style={styles.colorName}>
                    {selectedColor1.name}
                  </AppText>
                  {/* <AppText style={styles.colorDesc}>
                    Terracotta · raised profile · in stock at the yard
                  </AppText> */}
                </View>

                <View style={styles.swatchRow}>
                  {colorsList.map(c => {
                    const isSelected = selectedColor1?.id === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.swatchWrapper,
                          isSelected && styles.swatchWrapperSelected,
                        ]}
                        onPress={() => setSelectedColor1(c)}
                      >
                        <View
                          style={[
                            styles.swatch,
                            {
                              backgroundColor:
                                c.hexCode || c.color || c.hex || '#373838',
                            },
                          ]}
                        >
                          {isSelected && (
                            <CheckIcon color={colors.ground} size={15} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View>
                <GestureDetector gesture={dragGesture}>
                  <View style={styles.compareContainer}>
                    {/* Right half  full width base */}
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor:
                            selectedColor2.hexCode ||
                            selectedColor2.color ||
                            selectedColor2.hex ||
                            '#373838',
                        },
                      ]}
                    >
                      <FastImage
                        source={getImageUrl(selectedColor2.imageUrl)}
                        style={StyleSheet.absoluteFill}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                    {/* Left half  clipped by width */}
                    <Animated.View
                      style={[styles.compareClippedHalf, leftHalfStyle]}
                    >
                      <View
                        style={[
                          styles.compareHalfTexture,
                          {
                            backgroundColor:
                              selectedColor1.hexCode ||
                              selectedColor1.color ||
                              selectedColor1.hex ||
                              '#373838',
                          },
                        ]}
                      >
                        <FastImage
                          source={getImageUrl(selectedColor1.imageUrl)}
                          style={StyleSheet.absoluteFill}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </View>
                    </Animated.View>

                    <Animated.View
                      style={[styles.compareDivider, dividerStyle]}
                    >
                      <View style={styles.compareIconBtn}>
                        <CompareIcon color={colors.accent} size={17} />
                      </View>
                    </Animated.View>
                  </View>
                </GestureDetector>

                <View style={styles.compareTextRow}>
                  <View style={styles.compareTextLeft}>
                    <AppText style={styles.colorNameSmall}>
                      {selectedColor1.name}
                    </AppText>
                    <AppText style={styles.colorDescSmall}>left</AppText>
                  </View>

                  <View style={styles.compareTextRight}>
                    <AppText style={styles.colorNameSmallRight}>
                      {selectedColor2.name}
                    </AppText>
                    <AppText style={styles.colorDescSmallRight}>right</AppText>
                  </View>
                </View>

                <View style={styles.compareSection}>
                  <AppText style={styles.sectionLabel}>Left</AppText>
                  <View style={styles.swatchRow}>
                    {colorsList.map(c => {
                      const isSelected = selectedColor1?.id === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.swatchWrapperSmall,
                            isSelected && styles.swatchWrapperSelectedSmall,
                          ]}
                          onPress={() => setSelectedColor1(c)}
                        >
                          <View
                            style={[
                              styles.swatch,
                              {
                                backgroundColor:
                                  c.hexCode || c.color || c.hex || '#373838',
                              },
                            ]}
                          >
                            {isSelected && (
                              <CheckIcon color={colors.ground} size={15} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.compareSection}>
                  <AppText style={styles.sectionLabel}>Right</AppText>
                  <View style={styles.swatchRow}>
                    {colorsList.map(c => {
                      const isSelected = selectedColor2?.id === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.swatchWrapperSmall,
                            isSelected && styles.swatchWrapperSelectedSmall,
                          ]}
                          onPress={() => setSelectedColor2(c)}
                        >
                          <View
                            style={[
                              styles.swatch,
                              {
                                backgroundColor:
                                  c.hexCode || c.color || c.hex || '#373838',
                              },
                            ]}
                          >
                            {isSelected && (
                              <CheckIcon color={colors.ground} size={15} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </RNAnimated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompareColours;

const SWATCH_COLUMNS = 7;
const SWATCH_GAP = 8;
const SWATCH_PADDING = 40; // 20 on each side
const SWATCH_SIZE =
  (width - SWATCH_PADDING - SWATCH_GAP * (SWATCH_COLUMNS - 1)) / SWATCH_COLUMNS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  headerTitle: {
    marginBottom: 15,
    fontSize: fontSizes.f28,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  segmentedContainer: {
    marginBottom: 24,
  },
  texturePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    marginBottom: 24,
  },
  holdPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  holdPillText: {
    color: colors.ground,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  holdPillTextOverlay: {
    position: 'absolute',
    top: 6,
    right: 12,
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  colorName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f18,
    color: colors.ink,
    // marginBottom: 4,
    textAlign: 'center',
  },
  colorDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    textAlign: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SWATCH_GAP,
  },
  swatchWrapper: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchWrapperSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  swatch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSkeleton: {
    width: 160,
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  descSkeleton: {
    width: 220,
    height: 14,
    borderRadius: 4,
  },
  swatchSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },

  // Compare Mode Styles
  compareContainer: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  compareClippedHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  compareHalf: {
    flex: 1,
  },
  compareHalfTexture: {
    width: width - 28,
    height: width - 28,
  },
  compareDivider: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.ground,
    marginLeft: -1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  compareIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  compareTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  compareTextLeft: {
    alignItems: 'flex-start',
  },
  compareTextRight: {
    alignItems: 'flex-end',
  },
  colorNameSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 4,
  },
  colorDescSmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  colorNameSmallRight: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    textAlign: 'right',
    marginBottom: 4,
  },
  colorDescSmallRight: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    textAlign: 'right',
  },
  compareSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.muted,
    marginBottom: 12,
    textAlign: 'center',
  },
  swatchRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swatchWrapperSmall: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchWrapperSelectedSmall: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: spacing.s,
    backgroundColor: colors.ground,
  },
  modalOptionList: {
    gap: 12,
    marginTop: 8,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 16,
  },
  modalSwatch: {
    width: 44,
    height: 44,
    marginRight: 14,
  },
  modalTextCol: {
    flex: 1,
  },
  modalColorTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  modalColorSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
    marginTop: 2,
  },
  modalPositionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useLazyGetTileColorsQuery } from '../../redux/services/authApi';
import { useCalculateMaterialMutation } from '../../redux/services/homeApi';
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
import { useSelector, useDispatch } from 'react-redux';
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
import AppModal from '../../components/AppModal';
import SegmentedControl from '../../components/SegmentedControl';
import CheckIcon from '../../assets/icons/checkIcon';
import CompareIcon from '../../assets/icons/compareIcon';
import FastImage from '@d11/react-native-fast-image';
import TileTexture from '../../components/TileTexture';
import { getImageUrl } from '../../helper/commonFunctions';
import { colors } from '../../themes/colors';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { spacing, width } from '../../themes/spacing';
import { Spacer } from '../../components';

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

// Renders the colour's real tile image when available, falling back to the
// SVG tile pattern (TileTexture) when the colour has no imageUrl.
const ColorSurface = ({
  colorObj,
  style,
  textureOpacity,
  children,
}: {
  colorObj: any;
  style?: any;
  textureOpacity?: any;
  children?: React.ReactNode;
}) => {
  const bgColor =
    colorObj?.hexCode || colorObj?.color || colorObj?.hex || '#373838';

  if (colorObj?.imageUrl) {
    return (
      <View style={[style, { backgroundColor: bgColor }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            textureOpacity ? { opacity: textureOpacity } : null,
          ]}
        >
          <FastImage
            source={getImageUrl(colorObj.imageUrl)}
            style={StyleSheet.absoluteFill}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
        {children}
      </View>
    );
  }

  return (
    <TileTexture color={bgColor} style={style} textureOpacity={textureOpacity}>
      {children}
    </TileTexture>
  );
};

const TryOnRoof = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const initialMode = route.params?.initialMode || 'One colour';

  const [mode, setMode] = useState(initialMode);

  const [getTileColors] = useLazyGetTileColorsQuery();
  const [calculateMaterial, { isLoading: isCalculating }] =
    useCalculateMaterialMutation();

  const [colorsList, setColorsList] = useState<any[]>([]);
  const [isLoadingColours, setIsLoadingColours] = useState(true);
  const coloursFadeAnim = useRef(new RNAnimated.Value(0)).current;

  const [selectedColor1, setSelectedColor1] = useState<any>(null);
  const [selectedColor2, setSelectedColor2] = useState<any>(null);
  const [showColourModal, setShowColourModal] = useState(false);

  useEffect(() => {
    const profileId = route.params?.profileId;
    const colorId = route.params?.colorId;
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
        setColorsList(list);
        if (list.length > 0) {
          const preselected = colorId
            ? list.find((c: any) => c.id === colorId)
            : null;
          setSelectedColor1(preselected || list[0]);
          setSelectedColor2(list.length > 1 ? list[1] : list[0]);
        }
        setIsLoadingColours(false);
        RNAnimated.timing(coloursFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setColorsList([]);
        setIsLoadingColours(false);
      },
      true,
    );
  }, [route.params?.profileId, route.params?.colorId]);

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

  const quoteData = useSelector((state: RootState) => state.global.quoteData);
  const area_sq_mt = quoteData?.area_sq_mt;
  const jobType = quoteData?.jobType || 'restoration';
  const dispatch = useDispatch();

  const handleSave = (colorObj: any) => {
    dispatch(
      updateQuoteData({
        tileColorId: colorObj?.id,
        tileTypeId: route.params?.tileTypeId,
        tileProfileId: route.params?.profileId,
      }),
    );
    navigate(routesConstants.quoteDetails);
  };

  const handleBuildQuotePress = () => {
    if (mode === 'Compare two') {
      setShowColourModal(true);
    } else {
      handleSave(selectedColor1);
    }
  };

  const handleSelectColourForQuote = (color: any) => {
    setShowColourModal(false);
    handleSave(color);
  };

  const buttonTitle =
    mode === 'One colour' && selectedColor1?.name
      ? `Build quote in ${selectedColor1.name}`
      : 'Build quote';

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onClosePress={() => goBack()} skipDiscardModal />

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
              <SkeletonItem style={styles.descSkeleton} />
            </View>
            <View style={styles.swatchRow}>
              {[1, 2, 3, 4, 5].map(key => (
                <SkeletonItem key={key} style={styles.swatchSkeleton} />
              ))}
            </View>
          </View>
        ) : colorsList.length === 0 ? (
          <AppText style={styles.colorDesc}>
            No colours available for this profile.
          </AppText>
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
                <ColorSurface
                  colorObj={selectedColor1}
                  style={styles.texturePlaceholder}
                />

                <View style={styles.detailsContainer}>
                  <AppText style={styles.colorName}>
                    {selectedColor1.name}
                  </AppText>
                  <AppText style={styles.colorDesc}>
                    Monier · 15-year rating
                  </AppText>
                </View>

                <View style={styles.swatchRow}>
                  {colorsList.map(c => {
                    const isActive = selectedColor1?.id === c.id;

                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.swatchWrapper,
                          isActive && styles.swatchWrapperSelected,
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
                          {isActive && (
                            <CheckIcon color={colors.ground} size={16} />
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
                    <ColorSurface
                      colorObj={selectedColor2}
                      style={StyleSheet.absoluteFill}
                    />
                    {/* Left half  clipped by width */}
                    <Animated.View
                      style={[
                        {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          overflow: 'hidden',
                        },
                        leftHalfStyle,
                      ]}
                    >
                      <ColorSurface
                        colorObj={selectedColor1}
                        style={styles.compareHalfTexture}
                      />
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
                            styles.swatchWrapper,
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
                            styles.swatchWrapper,
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

      <View style={[styles.footer]}>
        <CustomButton title={buttonTitle} onPress={handleBuildQuotePress} />
      </View>

      <AppModal
        visible={showColourModal}
        onClose={() => setShowColourModal(false)}
        title="Which colour goes on the quote?"
        type="bottom"
      >
        <View
          style={[
            styles.modalOptionList,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {[
            { color: selectedColor1, label: 'left' },
            { color: selectedColor2, label: 'right' },
          ]
            .filter(item => !!item.color)
            .map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.modalOptionCard}
                activeOpacity={0.7}
                onPress={() => handleSelectColourForQuote(item.color)}
              >
                <ColorSurface
                  colorObj={item.color}
                  style={styles.modalSwatch}
                />
                <View style={styles.modalTextCol}>
                  <AppText style={styles.modalColorTitle}>
                    {item.color.name}
                  </AppText>
                  <AppText style={styles.modalColorSub}>Monier</AppText>
                </View>
                <AppText style={styles.modalPositionLabel}>
                  {item.label}
                </AppText>
              </TouchableOpacity>
            ))}
        </View>
      </AppModal>
    </SafeAreaView>
  );
};

export default TryOnRoof;

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
    aspectRatio: 1, // square
    backgroundColor: '#8E3B27',
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
  compareHalfTexture: {
    width: width - 28,
    height: width - 28,
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  colorName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f18,
    color: colors.ink,
    marginBottom: 4,
  },
  colorDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
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
  compareHalf: {
    flex: 1,
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
  swatchWrapperSmall: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 2,
  },
  swatchWrapperSelectedSmall: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
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

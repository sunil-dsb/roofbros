import React, { useState, useEffect, useRef } from 'react';
import { managerApiCall } from '../../helper/manageApiCallFun';
import {
  useLazyGetTilesQuery,
  useLazyGetTileProfilesQuery,
  useLazyGetTileColorsQuery,
} from '../../redux/services/authApi';
import { useCalculateMaterialMutation } from '../../redux/services/homeApi';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { updateQuoteData } from '../../redux/slices/globalSlice';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import { useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import CheckIcon from '../../assets/icons/checkIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { CustomKeyboardScrollView, StackedInput } from '../../components';
import { width } from '../../themes/spacing';

const SkeletonItem = ({ style }: { style: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
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
    <Animated.View
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

const PaintAndColour = () => {
  const [getTiles] = useLazyGetTilesQuery();
  const [getTileProfiles] = useLazyGetTileProfilesQuery();
  const [getTileColors] = useLazyGetTileColorsQuery();
  const [calculateMaterial, { isLoading: isCalculating }] =
    useCalculateMaterialMutation();

  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');

  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [colorsList, setColorsList] = useState<any[]>([]);

  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingColors, setIsLoadingColors] = useState(false);

  const brandsFadeAnim = useRef(new Animated.Value(0)).current;
  const colorsFadeAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const quoteData = useSelector((state: RootState) => state.global.quoteData);
  const area_sq_mt = quoteData?.area_sq_mt;
  const jobType = quoteData?.jobType || 'restoration';
  const dispatch = useDispatch();

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);

  useEffect(() => {
    managerApiCall(
      getTiles,
      {},
      (res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setMaterialsList(list);
        if (list.length > 0) {
          setSelectedMaterialId(list[0].id);
        }
      },
      () => {},
      true,
    );
  }, []);

  useEffect(() => {
    if (!selectedMaterialId) return;
    setIsLoadingBrands(true);
    brandsFadeAnim.setValue(0);
    managerApiCall(
      getTileProfiles,
      { tileId: selectedMaterialId, profileType: 'restore' },
      (res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.profiles)
          ? res.profiles
          : Array.isArray(res)
          ? res
          : [];
        setBrandsList(list);
        if (list.length > 0) {
          setSelectedBrand(list[0]);
        } else {
          setSelectedBrand(null);
          setColorsList([]);
        }
        setIsLoadingBrands(false);
        Animated.timing(brandsFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setIsLoadingBrands(false);
      },
      true,
    );
  }, [selectedMaterialId]);

  useEffect(() => {
    if (!selectedBrand?.id) return;
    setIsLoadingColors(true);
    colorsFadeAnim.setValue(0);
    managerApiCall(
      getTileColors,
      selectedBrand.id,
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
          setSelectedColor(list[0]);
        } else {
          setSelectedColor(null);
        }
        setIsLoadingColors(false);
        Animated.timing(colorsFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setIsLoadingColors(false);
      },
      true,
    );
  }, [selectedBrand]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleNext = () => {
    dispatch(
      updateQuoteData({
        tileTypeId: selectedMaterialId,
        tileProfileId: selectedBrand?.id,
        tileColorId: selectedColor?.id,
        additionalNotes: additionalDetails,
        urgent: isUrgent,
      }),
    );
    navigate(routesConstants.quoteDetails);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()}
        currentStep={5}
        totalSteps={6}
      />

      <CustomKeyboardScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Paint & colour
        </AppText>
        <AppText style={styles.subtitle}>
          Pick a brand, then the finish colour.
        </AppText>

        <AppText style={styles.sectionLabel}>Paint brand</AppText>
        {isLoadingBrands ? (
          <View style={styles.brandsContainer}>
            {[1, 2].map(key => (
              <SkeletonItem key={key} style={styles.brandCardSkeleton} />
            ))}
          </View>
        ) : (
          <Animated.View
            style={[
              styles.brandsContainer,
              {
                opacity: brandsFadeAnim,
                transform: [
                  {
                    translateY: brandsFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {brandsList.map(brand => {
              const isSelected = selectedBrand?.id === brand.id;
              return (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandCard,
                    isSelected && styles.brandCardSelected,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  <AppText
                    style={[
                      styles.brandName,
                      isSelected && styles.brandNameSelected,
                    ]}
                  >
                    {brand.name}
                  </AppText>
                  {/* <AppText style={styles.brandDesc}>{brand.desc}</AppText> */}
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        <AppText style={styles.sectionLabel}>
          Colour{' '}
          <AppText style={styles.sectionSublabel}>
            · {selectedBrand?.name}
          </AppText>
        </AppText>
        {isLoadingColors ? (
          <View style={[styles.swatchListContainer, styles.swatchRow]}>
            {[1, 2, 3, 4, 5].map(key => (
              <SkeletonItem key={key} style={styles.swatchSkeleton} />
            ))}
          </View>
        ) : (
          <Animated.View
            style={[
              styles.swatchListContainer,
              {
                opacity: colorsFadeAnim,
                transform: [
                  {
                    translateY: colorsFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <FlashList
              data={colorsList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item: any) => item.id}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              renderItem={({ item: c }: { item: any }) => {
                const isSelected = selectedColor?.id === c.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.swatchWrapper,
                      isSelected && styles.swatchWrapperSelected,
                    ]}
                    onPress={() => setSelectedColor(c)}
                  >
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: c.hexCode || c.color || '#373838' },
                      ]}
                    >
                      {isSelected && (
                        <CheckIcon color={colors.ground} size={16} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        )}

        <AppText style={styles.colourNote}>
          Colours are per brand Shield coat swaps to its own reds & terracottas.
        </AppText>
      </CustomKeyboardScrollView>

      {!isLoadingColors && selectedColor?.id && (
        <View style={[styles.footer]}>
          <CustomButton title="Build quote" onPress={handleNext} />
          <CustomButton
            title="Try a colour"
            variant="secondary"
            onPress={() =>
              navigate(routesConstants.tryOnRoof, {
                initialMode: 'One colour',
                profileId: selectedBrand?.id,
                colorId: selectedColor?.id,
                tileTypeId: selectedMaterialId,
              })
            }
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaintAndColour;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 12,
  },
  sectionSublabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  brandsContainer: {
    marginBottom: 28,
    gap: 12,
  },
  brandCard: {
    borderWidth: 2,
    borderColor: colors.accentTint,
    backgroundColor: colors.ground,
    padding: 16,
    borderRadius: 0,
  },
  brandCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  brandCardSkeleton: {
    height: 56,
    borderRadius: 4,
  },
  brandName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f18,
    color: colors.ink,
    // marginBottom: 4,
  },
  brandNameSelected: {
    color: colors.ink,
  },
  brandDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatchListContainer: {
    height: 54,
  },
  swatchSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  swatchWrapper: {
    width: 50,
    height: 50,
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
  colourNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 8,
  },
  detailsInput: {
    height: width * 0.15,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f17,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

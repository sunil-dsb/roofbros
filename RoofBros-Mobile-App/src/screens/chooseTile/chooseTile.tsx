import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
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
import CheckIcon from '../../assets/icons/checkIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import FastImage from '@d11/react-native-fast-image';
import {
  useLazyGetTilesQuery,
  useLazyGetTileProfilesQuery,
  useLazyGetTileColorsQuery,
} from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { getImageUrl } from '../../helper/commonFunctions';

const { width } = Dimensions.get('window');

const HORIZONTAL_PADDING = 20;
const TAB_CONTAINER_WIDTH = width - HORIZONTAL_PADDING * 2;
const TAB_PADDING = 4;

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

const ProfileChipItem = ({
  profileName,
  isSelected,
  onPress,
  style,
}: {
  profileName: string;
  isSelected: boolean;
  onPress: () => void;
  style?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[styles.profileChip, isSelected && styles.profileChipSelected]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <AppText
          style={[
            styles.profileChipText,
            isSelected && styles.profileChipTextSelected,
          ]}
        >
          {profileName}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ChooseTile = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const quoteData = useSelector((state: RootState) => state.global.quoteData);
  const area_sq_mt = quoteData?.area_sq_mt;
  const jobType = quoteData?.jobType || 'new roof';
  const dispatch = useDispatch();

  const [getTiles] = useLazyGetTilesQuery();
  const [getTileProfiles] = useLazyGetTileProfilesQuery();
  const [getTileColors] = useLazyGetTileColorsQuery();

  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<any[]>([]);
  const [tilesList, setTilesList] = useState<any[]>([]);

  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedTileId, setSelectedTileId] = useState('');

  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingTiles, setIsLoadingTiles] = useState(false);

  const materialsFadeAnim = useRef(new Animated.Value(0)).current;
  const profilesFadeAnim = useRef(new Animated.Value(0)).current;
  const gridFadeAnim = useRef(new Animated.Value(0)).current;

  const handleBuildQuote = () => {
    const tileTypeName =
      materialsList.find(m => m.id === selectedMaterialId)?.name || 'Concrete';
    const tileProfileName =
      profilesList.find(p => p.id === selectedProfileId)?.name || 'Marseille';

    dispatch(
      updateQuoteData({
        tileTypeName,
        tileProfileName,
        tileTypeId: selectedMaterialId,
        tileProfileId: selectedProfileId,
        tileColorId: selectedTileId,
      }),
    );
    navigate(routesConstants.quoteDetails);
  };

  // 1. Fetch Tiles (Materials) on mount
  useEffect(() => {
    setIsLoadingMaterials(true);
    materialsFadeAnim.setValue(0);
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
        setIsLoadingMaterials(false);
        if (list.length > 0) {
          setSelectedMaterialId(list[0].id);
        }
        Animated.timing(materialsFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setIsLoadingMaterials(false);
      },
      true,
    );
  }, []);

  // 2. Fetch Profiles for selected tile material ID
  useEffect(() => {
    if (!selectedMaterialId) return;
    setIsLoadingProfiles(true);
    profilesFadeAnim.setValue(0);
    managerApiCall(
      getTileProfiles,
      { tileId: selectedMaterialId, profileType: 'general' },
      (res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.profiles)
          ? res.profiles
          : Array.isArray(res)
          ? res
          : [];
        setProfilesList(list);
        setIsLoadingProfiles(false);
        if (list.length > 0) {
          const firstId = list[0]?.id || list[0]?.name || list[0];
          setSelectedProfileId(firstId);
        } else {
          setSelectedProfileId('');
          setTilesList([]);
        }
        Animated.timing(profilesFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setIsLoadingProfiles(false);
      },
      true,
    );
  }, [selectedMaterialId]);

  // 3. Fetch Colors for selected profile ID
  useEffect(() => {
    if (!selectedProfileId) return;
    setIsLoadingTiles(true);
    gridFadeAnim.setValue(0);
    managerApiCall(
      getTileColors,
      selectedProfileId,
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
        setTilesList(list);
        setIsLoadingTiles(false);
        Animated.timing(gridFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      },
      () => {
        setIsLoadingTiles(false);
      },
      true,
    );
  }, [selectedProfileId]);

  const tabWidth =
    materialsList.length > 0
      ? (TAB_CONTAINER_WIDTH - TAB_PADDING * 2) / materialsList.length
      : TAB_CONTAINER_WIDTH - TAB_PADDING * 2;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentIdx = materialsList.findIndex(
      (m: any) => m.id === selectedMaterialId,
    );
    slideAnim.setValue((currentIdx >= 0 ? currentIdx : 0) * tabWidth);
  }, [selectedMaterialId, materialsList, tabWidth]);

  const handleMaterialPress = (materialItem: any, index: number) => {
    setSelectedMaterialId(materialItem.id);
    Animated.spring(slideAnim, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      bounciness: 2,
      speed: 12,
    }).start();
  };

  const handleTilePress = (tile: any) => {
    setSelectedTileId(tile.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()}
        currentStep={4}
        totalSteps={6}
      />

      <View style={{}}>
        <AppText variant="title" style={styles.title}>
          Choose a tile
        </AppText>

        {isLoadingMaterials ? (
          <View style={styles.materialFiltersContainer}>
            <View
              style={[styles.materialFilters, { gap: 8, paddingHorizontal: 8 }]}
            >
              <SkeletonItem style={{ flex: 1, height: 38, borderRadius: 20 }} />
              <SkeletonItem style={{ flex: 1, height: 38, borderRadius: 20 }} />
            </View>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.materialFiltersContainer,
              {
                opacity: materialsFadeAnim,
                transform: [
                  {
                    translateY: materialsFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.materialFilters}>
              <Animated.View
                style={[
                  styles.animatedIndicator,
                  { width: tabWidth, transform: [{ translateX: slideAnim }] },
                ]}
              />
              {materialsList.map((materialObj, index) => {
                const isSelected = selectedMaterialId === materialObj.id;
                const materialName =
                  materialObj.name || materialObj.label || materialObj;
                return (
                  <TouchableOpacity
                    key={materialObj.id || index}
                    style={styles.materialTab}
                    onPress={() => handleMaterialPress(materialObj, index)}
                    activeOpacity={0.7}
                  >
                    <AppText
                      style={[
                        styles.materialTabText,
                        isSelected && styles.materialTabTextSelected,
                      ]}
                    >
                      {materialName}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {isLoadingProfiles ? (
          <View
            style={[
              styles.profileFiltersContainer,
              { gap: 8, marginVertical: 4 },
            ]}
          >
            <SkeletonItem style={{ width: 90, height: 32, borderRadius: 16 }} />
            <SkeletonItem style={{ width: 80, height: 32, borderRadius: 16 }} />
            <SkeletonItem style={{ width: 85, height: 32, borderRadius: 16 }} />
          </View>
        ) : (
          <Animated.View
            style={{
              opacity: profilesFadeAnim,
              transform: [
                {
                  translateY: profilesFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.profileFiltersContainer,
                { flexGrow: 1 },
              ]}
            >
              {profilesList.map((profileObj, index) => {
                const profileId =
                  profileObj.id || profileObj.name || profileObj;
                const profileName =
                  profileObj.name || profileObj.title || profileObj;
                const isSelected = selectedProfileId === profileId;
                return (
                  <ProfileChipItem
                    key={profileId || index}
                    profileName={profileName}
                    isSelected={isSelected}
                    onPress={() => setSelectedProfileId(profileId)}
                    style={{ flex: 1 }}
                  />
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {isLoadingTiles ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 20,
            paddingTop: 12,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(key => (
            <View key={key} style={{ width: '33.33%', padding: 6 }}>
              <SkeletonItem
                style={{ height: 100, borderRadius: 12, marginBottom: 8 }}
              />
              <SkeletonItem
                style={{
                  width: '75%',
                  height: 12,
                  borderRadius: 6,
                  marginBottom: 4,
                }}
              />
              <SkeletonItem
                style={{ width: '45%', height: 10, borderRadius: 5 }}
              />
            </View>
          ))}
        </View>
      ) : (
        <Animated.View
          style={{
            flex: 1,
            opacity: gridFadeAnim,
            transform: [
              {
                translateY: gridFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <FlashList
            data={tilesList}
            numColumns={3}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: selectedTileId ? 180 : 40 },
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: tile, index }) => {
              const isFirstCol = index % 3 === 0;
              const isLastCol = index % 3 === 2;
              const isSelected = selectedTileId === tile.id;

              return (
                <View
                  style={{
                    flex: 1,
                    paddingLeft: isFirstCol ? 0 : 6,
                    paddingRight: isLastCol ? 0 : 6,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.gridItem,
                      isSelected && styles.gridItemSelected,
                    ]}
                    onPress={() => handleTilePress(tile)}
                    activeOpacity={0.8}
                  >
                    {/* <TileTexture
                      color={tile.hexCode || tile.color || '#373838'}
                      style={styles.tileImagePlaceholder}
                      tileSize={20}
                    >
                      {tile.badge && (
                        <View style={styles.badge}>
                          <AppText style={styles.badgeText}>
                            {tile.badge}
                          </AppText>
                        </View>
                      )}
                    </TileTexture> */}
                    <FastImage
                      source={getImageUrl(tile.imageUrl)}
                      style={[
                        styles.tileImagePlaceholder,
                        {
                          backgroundColor:
                            tile.hexCode || tile.color || '#373838',
                        },
                      ]}
                    />
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <CheckIcon color={colors.ground} size={12} />
                      </View>
                    )}
                    <View style={styles.tileInfo}>
                      <AppText style={styles.tileName} numberOfLines={1}>
                        {tile.name}
                      </AppText>
                      {/* {!!(tile.profile || tile.material) && (
                        <AppText style={styles.tileProfile} numberOfLines={2}>
                          {tile.profile ? `${tile.profile}` : ''}
                          {tile.profile && tile.material ? ' ·\n' : ''}
                          {tile.material ? `${tile.material}` : ''}
                        </AppText>
                      )} */}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </Animated.View>
      )}

      {!!selectedTileId && !isLoadingTiles && (
        <View style={[styles.footer, { bottom: insets.bottom }]}>
          <CustomButton title="Build quote" onPress={handleBuildQuote} />
          <CustomButton
            title="Try a colour"
            variant="secondary"
            onPress={() => {
              const tileTypeName =
                materialsList.find(m => m.id === selectedMaterialId)?.name ||
                'Concrete';
              const tileProfileName =
                profilesList.find(p => p.id === selectedProfileId)?.name ||
                'Marseille';

              dispatch(
                updateQuoteData({
                  tileTypeName,
                  tileProfileName,
                  tileTypeId: selectedMaterialId,
                  tileProfileId: selectedProfileId,
                  tileColorId: selectedTileId,
                }),
              );

              navigate(routesConstants.tryOnRoof, {
                initialMode: 'One colour',
                profileId: selectedProfileId,
                colorId: selectedTileId,
                tileTypeId: selectedMaterialId,
                area_sq_mt,
              });
            }}
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChooseTile;

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
    paddingHorizontal: 20,
  },
  materialFiltersContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  materialFilters: {
    flexDirection: 'row',
    height: width * 0.14,
    borderRadius: width * 0.5,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 4,
    position: 'relative',
    alignItems: 'center',
  },
  animatedIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.ground,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  materialTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  materialTabText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  materialTabTextSelected: {
    color: colors.ink,
  },
  profileFiltersContainer: {
    paddingBottom: 24,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileChip: {
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.02,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ground,
  },
  profileChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  profileChipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.ink,
  },
  profileChipTextSelected: {
    color: colors.accent,
  },
  gridItem: {
    flex: 1,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 12,
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  gridItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.ground,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImagePlaceholder: {
    width: '100%',
    height: 100,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(45,32,18,0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.ground,
    fontSize: fontSizes.f10,
    fontFamily: fontFamily.semiBold,
    textTransform: 'uppercase',
  },
  tileInfo: {
    padding: 8,
  },
  tileName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f14,
    color: colors.ink,
    marginBottom: 4,
  },
  tileProfile: {
    fontSize: fontSizes.f12,
    color: colors.muted,
    lineHeight: 14,
  },
});

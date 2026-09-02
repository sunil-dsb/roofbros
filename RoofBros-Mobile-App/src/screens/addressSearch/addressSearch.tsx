import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TextInput,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInUp,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateQuoteData } from '../../redux/slices/globalSlice';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import { GOOGLE_MAPS_API_KEY } from '../../redux/services/rtkquery';
import SearchIcon from '../../assets/icons/searchIcon';
import PinIcon from '../../assets/icons/pinIcon';
import WarnIcon from '../../assets/icons/warnIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily as fonts } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { width } from '../../themes/spacing';
import { CustomKeyboardScrollView, StackedInput } from '../../components';

const AddressSearch = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const jobType = route.params?.jobType || 'restoration';

  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [shouldShowWarningUI, setShouldShowWarningUI] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [mapLocation, setMapLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message:
                'This app needs access to your location to show it on the map.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!searchQuery.trim() || selectedResult) {
        setResults([]);
        setShouldShowWarningUI(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          'https://places.googleapis.com/v1/places:autocomplete',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            },
            body: JSON.stringify({
              input: searchQuery,
              includedRegionCodes: ['au'],
              includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
            }),
          },
        );

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          setResults(
            data.suggestions.map((s: any) => ({
              placeId: s.placePrediction.placeId,
              description: s.placePrediction.text.text,
            })),
          );
          setShouldShowWarningUI(false);
        } else {
          setResults([]);
          setShouldShowWarningUI(true);
        }
      } catch (error) {
        console.error('PLACES API ERROR:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the API call
    const timerId = setTimeout(() => {
      fetchPlaces();
    }, 400);

    return () => clearTimeout(timerId);
  }, [searchQuery, selectedResult]);

  const handleSelectResult = async (item: any) => {
    Keyboard.dismiss();
    setSearchQuery(item.description);
    setSelectedResult(item.placeId);
    setResults([]);

    try {
      // Fetch location for Map
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${item.placeId}`,
        {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'location',
          },
        },
      );
      const data = await response.json();
      if (data.location) {
        setMapLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
        mapRef.current?.animateToRegion(
          {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            latitudeDelta: 0.0003,
            longitudeDelta: 0.0003,
          },
          1000,
        );
      }
    } catch (error) {
      console.error('PLACES API DETAILS ERROR:', error);
    }
  };

  const handleNext = () => {
    dispatch(updateQuoteData({ jobType, address: searchQuery, mapLocation }));
    navigate(routesConstants.measuring);
  };

  const handleManual = () => {
    dispatch(updateQuoteData({ jobType, address: searchQuery }));
    navigate(routesConstants.manualMeasurement, { jobType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()} // Back to jobs
        currentStep={2}
        totalSteps={6}
      />

      <CustomKeyboardScrollView style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Site address
        </AppText>
        <AppText style={styles.subtitle}>Where's the job?</AppText>

        <StackedInput
          leftIcon={<SearchIcon color={colors.muted} size={20} />}
          rightElement={
            isSearching ? (
              <ActivityIndicator size="small" color={colors.ink} />
            ) : null
          }
          placeholder="Search address..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            setSelectedResult(null);
            setShouldShowWarningUI(false);
          }}
          autoFocus={false}
          style={styles.textInputContainer}
        />

        {!shouldShowWarningUI &&
          searchQuery.trim().length > 0 &&
          !selectedResult &&
          results.length > 0 && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition.duration(250)}
              style={styles.listView}
            >
              {results.map((item, index) => (
                <React.Fragment key={item.placeId}>
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelectResult(item)}
                  >
                    <PinIcon color={colors.muted} size={18} />
                    <AppText style={styles.resultText}>
                      {item.description}
                    </AppText>
                  </TouchableOpacity>
                  {index < results.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </Animated.View>
          )}

        {shouldShowWarningUI && searchQuery.trim().length > 0 && (
          <Animated.View
            entering={SlideInUp.duration(300)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition.duration(250)}
            style={styles.warningBanner}
          >
            <View style={styles.warningIconWrapper}>
              <WarnIcon color={colors.warning} size={18} />
            </View>
            <View style={styles.warningTextCol}>
              <AppText style={styles.warningTitle}>
                No results found for this address.
              </AppText>
              <AppText style={styles.warningBody}>
                Enter your measurements manually instead.
              </AppText>
            </View>
          </Animated.View>
        )}

        {!shouldShowWarningUI && (
          <Animated.View layout={LinearTransition.duration(250)}>
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: -33.8688,
                    longitude: 151.2093,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  mapType="satellite"
                  showsUserLocation={true}
                />

                {/* <PinIcon color={colors.accent} size={30} /> */}

                {/* <View style={styles.dragPill}>
                  <AppText style={styles.dragPillText}>
                    Drag pin to adjust
                  </AppText>
                </View> */}
              </View>
            </View>

            {selectedResult ? (
              <View style={styles.manualEntryContainer}>
                <AppText style={styles.manualEntryText}>
                  Already have your measurements?
                </AppText>
                <TouchableOpacity onPress={handleManual}>
                  <AppText style={styles.manualEntryLink}>
                    Enter them manually
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        )}
      </CustomKeyboardScrollView>

      <View style={[styles.footer]}>
        {shouldShowWarningUI && searchQuery.trim().length > 0 ? (
          <CustomButton
            title="Enter measurements manually"
            onPress={handleManual}
          />
        ) : selectedResult ? (
          <CustomButton title="Confirm address" onPress={handleNext} />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default AddressSearch;

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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.muted,
    marginBottom: 24,
  },
  textInputContainer: {
    height: width * 0.15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: colors.border,
    backgroundColor: colors.fieldInactive,
  },
  searchIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: fontSizes.f18,
    fontFamily: fonts.regular,
    color: colors.ink,
    backgroundColor: 'transparent',
    flex: 1,
    paddingVertical: 0,
  },
  listView: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderTopWidth: 0,
    marginTop: 15,
    elevation: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lineSoft,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.f15,
    color: colors.ink,
    marginLeft: 12,
    flexShrink: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warningTint,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 16,
    gap: 12,
    marginTop: 15,
  },
  warningIconWrapper: {
    marginTop: 2,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.f15,
    color: colors.warning,
    marginBottom: 4,
  },
  warningBody: {
    fontSize: fontSizes.f14,
    color: colors.warning,
    lineHeight: 20,
  },
  mapContainer: {
    height: 250,
    width: '100%',
    backgroundColor: colors.lineSoft,
    overflow: 'hidden',
    marginVertical: 24,
    zIndex: -1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#b0c4de',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  manualEntryContainer: {
    alignItems: 'center',
    marginTop: 8,
    zIndex: -1,
  },
  manualEntryText: {
    fontSize: fontSizes.f16,
    color: colors.muted,
    marginBottom: 4,
  },
  manualEntryLink: {
    fontSize: fontSizes.f16,
    color: colors.primary,
    fontFamily: fonts.semiBold,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

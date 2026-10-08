import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
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
import { useSelector } from 'react-redux';
import { navigate, goBack } from '../../navigations/navigationServices';
import {
  checkCameraPermission,
  checkPhotoLibraryPermission,
} from '../../helper/commonFunctions';
import ImagePicker from 'react-native-image-crop-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRequestDeliveryMutation } from '../../redux/services/homeApi';
import { GOOGLE_MAPS_API_KEY } from '../../redux/services/rtkquery';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { ShowAlertMessage } from '../../helper/showAlertMessage';

import FormInput from '../../components/FormInput';
import StackedInput from '../../components/StackedInput';
import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import AppModal from '../../components/AppModal';
import SegmentedControl from '../../components/SegmentedControl';
import FlowHeader from '../../components/FlowHeader';
import PinIcon from '../../assets/icons/pinIcon';
import CameraIcon from '../../assets/icons/cameraIcon';
import BackIcon from '../../assets/icons/backIcon';
import WarnIcon from '../../assets/icons/warnIcon';
import SearchIcon from '../../assets/icons/searchIcon';
import CheckIcon from '../../assets/icons/checkIcon';
import CloseIcon from '../../assets/icons/closeIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { width } from '../../themes/spacing';
import { routesConstants } from '../../navigations/routeConstants';
import { CustomKeyboardScrollView } from '../../components';

type DeliveryMode = 'Deliver to site' | 'Pickup at yard';
type TimeWindow = 'Morning' | 'Afternoon';

const formatKey = (str: string) => {
  let formatted = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  formatted = formatted.replace(/_/g, ' ');
  formatted = formatted.toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const mapQuoteDataForUI = (rawData: any) => {
  const uiData: any = {};
  if (rawData.area_sq_mt !== undefined) uiData.area_sq_mt = rawData.area_sq_mt;
  if (rawData.totalTiles !== undefined) uiData.totalTiles = rawData.totalTiles;
  if (rawData.topCoatBuckets !== undefined)
    uiData.topCoatBuckets = rawData.topCoatBuckets;
  if (rawData.primer !== undefined) uiData.primer = rawData.primer;
  if (rawData.primerType !== undefined) uiData.primerType = rawData.primerType;
  return uiData;
};

const deliveryRequestSchema = z.object({
  address: z.string().optional(),
  dropZoneNotes: z.string().optional(),
  additionalNotes: z.string().optional(),
  urgent: z.boolean().optional(),
});

type DeliveryRequestForm = z.infer<typeof deliveryRequestSchema>;

export interface UpcomingDay {
  id: string;
  dow: string;
  day: number;
  mon: string;
  disabled?: boolean; // true for past/today  shown as filler, not selectable
}

const generateUpcomingDays = (): UpcomingDay[] => {
  const days: UpcomingDay[] = [];
  const today = new Date();

  const dows = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Prepend today as a disabled filler so the left slot is never empty
  days.push({
    id: `disabled-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
    dow: dows[today.getDay()],
    day: today.getDate(),
    mon: months[today.getMonth()],
    disabled: true,
  });

  // Add the next 30 days (starting from tomorrow)
  const cursor = new Date(today);
  cursor.setDate(today.getDate() + 1); // start from tomorrow

  for (let i = 0; i < 30; i++) {
    days.push({
      id: `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`,
      dow: dows[cursor.getDay()],
      day: cursor.getDate(),
      mon: months[cursor.getMonth()],
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const DeliveryRequest = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const quoteItem = route.params?.quoteItem;
  const rawQuote = quoteItem?.rawQuote || {};
  const currentJob = useSelector((state: any) => state.global.currentJob);
  const initialAddress = rawQuote?.job?.address || currentJob?.address || '';
  const addressInputRef = useRef<TextInput>(null);

  const [requestDelivery, { isLoading }] = useRequestDeliveryMutation();
  const { control, handleSubmit, watch, setValue } =
    useForm<DeliveryRequestForm>({
      resolver: zodResolver(deliveryRequestSchema),
      mode: 'onChange',
      defaultValues: {
        address: initialAddress,
        dropZoneNotes: '',
        additionalNotes: '',
        urgent: false,
      },
    });

  const upcomingDays = useMemo(() => generateUpcomingDays(), []);
  // Index of the first selectable day (tomorrow = index 1, after the disabled today filler)
  const firstSelectableIndex = useMemo(
    () => upcomingDays.findIndex(d => !d.disabled),
    [upcomingDays],
  );

  const [mode, setMode] = useState<DeliveryMode>('Deliver to site');
  const [selectedDayId, setSelectedDayId] = useState(
    upcomingDays[firstSelectableIndex]?.id,
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('Morning');
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(
    'initial',
  );
  const [shouldShowWarningUI, setShouldShowWarningUI] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

    const timerId = setTimeout(() => {
      fetchPlaces();
    }, 400);

    return () => clearTimeout(timerId);
  }, [searchQuery, selectedResult]);

  const handleSelectResult = (item: any) => {
    Keyboard.dismiss();
    setSearchQuery(item.description);
    setSelectedResult(item.placeId);
    setResults([]);
    setValue('address', item.description);
  };

  const dateScrollRef = useRef<ScrollView>(null);

  // Native-picker constants  must match stylesheet values
  const DATE_BOX_WIDTH = (width - 40 - 20) / 3;
  const DATE_GAP = 10;
  const DATE_SNAP = DATE_BOX_WIDTH + DATE_GAP;
  // Center padding: allows the first/last item to reach the center slot
  const DATE_CENTER_PAD = (width - DATE_BOX_WIDTH) / 2;

  // On mount: scroll so tomorrow (index 1) is centered, not the disabled today
  useEffect(() => {
    if (firstSelectableIndex > 0) {
      // Small delay lets the ScrollView measure itself first
      setTimeout(() => {
        dateScrollRef.current?.scrollTo({
          x: firstSelectableIndex * DATE_SNAP,
          animated: false,
        });
      }, 50);
    }
  }, [firstSelectableIndex, DATE_SNAP]);

  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / DATE_SNAP);
    const clamped = Math.max(0, Math.min(index, upcomingDays.length - 1));
    const day = upcomingDays[clamped];
    if (day?.disabled) {
      // Snap back to the nearest selectable item
      const nearest = Math.max(firstSelectableIndex, clamped + 1);
      dateScrollRef.current?.scrollTo({
        x: nearest * DATE_SNAP,
        animated: true,
      });
      setSelectedDayId(upcomingDays[nearest]?.id);
    } else {
      setSelectedDayId(day?.id);
    }
  };

  const handleDayPress = (index: number) => {
    const day = upcomingDays[index];
    if (day?.disabled) return; // ignore taps on disabled items
    const scrollX = index * DATE_SNAP;
    dateScrollRef.current?.scrollTo({ x: scrollX, animated: true });
    setSelectedDayId(day.id);
  };

  const isPickup = mode === 'Pickup at yard';

  const onSubmit = async (data: DeliveryRequestForm) => {
    const formData = new FormData();
    formData.append('quoteId', rawQuote?.id || '');
    formData.append('method', mode?.toLowerCase());
    formData.append('deliveryAddress', data.address || '');

    if (selectedDayId) {
      const [year, month, day] = selectedDayId.split('-');
      // month from id is 0-indexed, so we add 1
      const pad = (n: number) => n.toString().padStart(2, '0');
      const isoString = `${year}-${pad(Number(month) + 1)}-${pad(
        Number(day),
      )}T00:00:00.000Z`;
      formData.append('preferredDay', isoString);
    }

    formData.append('timeWindow', timeWindow.toLowerCase());
    formData.append(
      'dropZoneNotes',
      isPickup ? data.additionalNotes || '' : data.dropZoneNotes || '',
    );
    formData.append('urgent', watch('urgent') ? 'true' : 'false');

    if (!isPickup && selectedPhotos.length > 0) {
      selectedPhotos.forEach((photoUri, index) => {
        formData.append('image', {
          uri: photoUri,
          name: `photo_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });
    }

    const jobId = rawQuote?.jobId || rawQuote?.job?.id || currentJob?.id;

    managerApiCall(
      requestDelivery,
      { id: jobId, body: formData },
      () => {
        navigate(routesConstants.deliverySuccess, {
          job: rawQuote?.job || currentJob,
        });
      },
      error => {
        console.log('Error requesting delivery:', error);
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomKeyboardScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <FlowHeader onClosePress={() => goBack()} skipDiscardModal />

        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText variant="title" style={styles.title}>
            Delivery request
          </AppText>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <SegmentedControl
            options={['Deliver to site', 'Pickup at yard']}
            selectedValue={mode}
            onValueChange={val => setMode(val as DeliveryMode)}
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <AppText style={styles.label}>
            {isPickup ? 'Pick up from' : 'Deliver to'}
          </AppText>
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
              setValue('address', text);
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
                <AppText style={styles.warningTitle}>Address not found</AppText>
                <AppText style={styles.warningBody}>
                  Please check the spelling or enter manually.
                </AppText>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Materials */}
        <View style={styles.materialsCard}>
          {Object.entries(mapQuoteDataForUI(rawQuote))
            .filter(([_, v]) => v !== null)
            .map(([key, value], index, arr) => (
              <React.Fragment key={key}>
                <View style={styles.materialRow}>
                  <View style={styles.materialLeft}>
                    <AppText style={styles.materialName}>
                      {formatKey(key)}
                    </AppText>
                  </View>
                  <AppText style={styles.materialQty}>{String(value)}</AppText>
                </View>
                {index < arr.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
        </View>

        {/* Date Picker */}
        <View style={styles.section}>
          <AppText style={styles.label}>Preferred day (min. 24h ahead)</AppText>

          <View style={styles.datePickerWrapper}>
            {/* Layer 1: fixed pink background  never moves */}
            <View
              pointerEvents="none"
              style={[
                styles.dateCenterBg,
                {
                  left: (width - 40 - DATE_BOX_WIDTH) / 2,
                  width: DATE_BOX_WIDTH,
                },
              ]}
            />

            {/* Layer 2: scrollable dates  transparent backgrounds */}
            <ScrollView
              ref={dateScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={DATE_SNAP}
              decelerationRate="fast"
              onMomentumScrollEnd={onScrollEnd}
              onScrollEndDrag={onScrollEnd}
              style={styles.dateScrollView}
              contentContainerStyle={[
                styles.dateRowScroll,
                { paddingHorizontal: DATE_CENTER_PAD },
              ]}
            >
              {upcomingDays.map((d, index) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.dateBox, d.disabled && styles.dateBoxDisabled]}
                  activeOpacity={d.disabled ? 1 : 0.7}
                  onPress={() => handleDayPress(index)}
                >
                  <AppText
                    style={[
                      styles.dateDow,
                      d.disabled && styles.dateTextDisabled,
                      selectedDayId === d.id && styles.dateTextSelected,
                    ]}
                  >
                    {d.dow}
                  </AppText>
                  <AppText
                    style={[
                      styles.dateDay,
                      d.disabled && styles.dateTextDisabled,
                      selectedDayId === d.id && styles.dateTextSelected,
                    ]}
                  >
                    {d.day}
                  </AppText>
                  <AppText
                    style={[
                      styles.dateMon,
                      d.disabled && styles.dateTextDisabled,
                      selectedDayId === d.id && styles.dateTextSelected,
                    ]}
                  >
                    {d.mon}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Layer 3: fixed red border frame  on top, doesn't capture touches */}
            <View
              pointerEvents="none"
              style={[
                styles.dateCenterFrame,
                {
                  left: (width - 40 - DATE_BOX_WIDTH) / 2,
                  width: DATE_BOX_WIDTH,
                },
              ]}
            />
          </View>
        </View>

        {/* Time Window */}
        <View style={styles.section}>
          <AppText style={styles.label}>Time window</AppText>
          <SegmentedControl
            options={['Morning', 'Afternoon']}
            selectedValue={timeWindow}
            onValueChange={val => setTimeWindow(val as TimeWindow)}
          />
        </View>

        {/* Notes */}
        {!isPickup ? (
          <>
            <View style={styles.section}>
              <AppText style={styles.label}>
                Drop-zone notes + photo (optional)
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  if (selectedPhotos.length >= 5) {
                    ShowAlertMessage(
                      'You can only add up to 5 photos.',
                      'error',
                    );
                  } else {
                    setIsPhotoModalVisible(true);
                  }
                }}
                style={{ padding: 4 }}
              >
                <View pointerEvents="none">
                  <FormInput
                    name="dropZoneNotes"
                    control={control}
                    leftIcon={<CameraIcon color={colors.muted} size={18} />}
                    editable={false}
                    placeholder='"Driveway left of carport, no overhead wires..."'
                    multiline
                  />
                </View>
              </TouchableOpacity>

              {selectedPhotos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 12 }}
                >
                  {selectedPhotos.map((photo, index) => (
                    <View
                      key={index}
                      style={{
                        marginRight: 12,
                        position: 'relative',
                        marginTop: 8,
                      }}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: colors.accent,
                          borderRadius: 12,
                          padding: 4,
                        }}
                        onPress={() => {
                          const newPhotos = [...selectedPhotos];
                          newPhotos.splice(index, 1);
                          setSelectedPhotos(newPhotos);
                        }}
                      >
                        <CloseIcon color={colors.surface} size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
            <View style={styles.section}>
              <AppText style={styles.label}>
                Additional notes (optional)
              </AppText>
              <FormInput
                name="additionalNotes"
                control={control}
                placeholder="Anything else the driver should know..."
                multiline
                // style={{
                //   height: width * 0.16,
                // }}
              />
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <AppText style={styles.label}>Pickup notes (optional)</AppText>
            <FormInput
              name="additionalNotes"
              control={control}
              placeholder="Ute or truck? Anything we should have ready..."
              multiline
            />
          </View>
        )}

        {/* Urgent Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.checkboxContainer}
          onPress={() => setValue('urgent', !watch('urgent'))}
        >
          <View
            style={[
              styles.checkboxBox,
              watch('urgent') && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            {watch('urgent') && <CheckIcon color={colors.surface} size={16} />}
          </View>
          <AppText style={styles.checkboxLabel}>This project is urgent</AppText>
        </TouchableOpacity>
      </CustomKeyboardScrollView>
      {/* Footer */}
      <View style={[styles.footer]}>
        <CustomButton title="Submit request" onPress={handleSubmit(onSubmit)} />
      </View>

      {/* Add Photo Bottom Sheet Modal */}
      <AppModal
        visible={isPhotoModalVisible}
        onClose={() => setIsPhotoModalVisible(false)}
        type="bottom"
      >
        <View
          style={[
            styles.photoModalContent,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <AppText style={styles.photoModalTitle}>Add photo</AppText>
          <View style={styles.photoModalButtonsContainer}>
            <CustomButton
              title="Take photo"
              variant="primary"
              iconLeft={<CameraIcon color={colors.ground} size={20} />}
              onPress={async () => {
                try {
                  const checkCamPer = await checkCameraPermission();
                  if (checkCamPer) {
                    ImagePicker.openCamera({
                      mediaType: 'photo',
                      compressImageMaxWidth: 1024,
                      compressImageMaxHeight: 1024,
                      compressImageQuality: 0.7,
                      useFrontCamera: false,
                    })
                      .then((image: any) => {
                        setSelectedPhotos(prev => {
                          if (prev.length >= 5) {
                            ShowAlertMessage(
                              'You can only add up to 5 photos.',
                              'error',
                            );
                            return prev;
                          }
                          return [...prev, image.path];
                        });
                        setIsPhotoModalVisible(false);
                      })
                      .catch(err => console.log('Camera error', err));
                  } else {
                    console.log('in else open camera handle');
                  }
                } catch (error) {
                  console.log(error, 'error in on Camera open handle');
                }
              }}
            />
            <CustomButton
              title="Choose from library"
              variant="secondary"
              onPress={async () => {
                try {
                  const checkPhotoLibPer = await checkPhotoLibraryPermission();
                  if (checkPhotoLibPer) {
                    ImagePicker.openPicker({
                      mediaType: 'photo',
                      multiple: true,
                      maxFiles: 5 - selectedPhotos.length,
                      compressImageMaxWidth: 1024,
                      compressImageMaxHeight: 1024,
                      compressImageQuality: 0.7,
                    })
                      .then((images: any) => {
                        const newPhotos = Array.isArray(images)
                          ? images.map(img => img.path)
                          : [images.path];
                        setSelectedPhotos(prev => {
                          const combined = [...prev, ...newPhotos];
                          if (combined.length > 5) {
                            Alert.alert(
                              'Limit Reached',
                              'You can only add up to 5 photos.',
                            );
                            return combined.slice(0, 5);
                          }
                          return combined;
                        });
                        setIsPhotoModalVisible(false);
                      })
                      .catch(err => console.log('Picker error', err));
                  } else {
                    console.log('in else open gallery handle');
                  }
                } catch (error) {
                  console.log(error, 'error in on Gallery open handle');
                }
              }}
            />
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  inner: {
    flexGrow: 1,
  },

  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: fontSizes.f28,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 8,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 14,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  addressText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.ink,
    flex: 1,
  },
  changeLink: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  materialsCard: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 2,
    marginBottom: 24,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  materialLeft: {
    flex: 1,
  },
  materialName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  materialDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    marginTop: 2,
  },
  materialQty: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineSoft,
  },
  datePickerWrapper: {
    position: 'relative',
  },
  // Fixed pink tint  sits behind the ScrollView
  dateCenterBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.accentTint,
    zIndex: 0,
  },
  // Fixed red border  sits on top of the ScrollView (pointerEvents none)
  dateCenterFrame: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.accent,
    zIndex: 2,
  },
  dateScrollView: {
    marginHorizontal: -20,
    zIndex: 1,
  },
  dateRowScroll: {
    gap: 10,
  },
  // Items are transparent  the fixed bg behind shows through
  dateBox: {
    width: (width - 40 - 20) / 3,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dateBoxSelected: {},
  dateBoxDisabled: {
    opacity: 0.35,
  },
  dateTextDisabled: {
    color: colors.muted,
  },
  dateDow: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes.f28,
    color: colors.ink,
    marginVertical: 2,
  },
  dateMon: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
  dateTextSelected: {
    color: colors.accent,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginTop: 14,
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.ground,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingBottom: width * 0.05,
  },
  photoModalContent: {
    width: '100%',
  },
  photoModalTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f22,
    color: colors.ink,
    marginBottom: 20,
  },
  photoModalButtonsContainer: {
    gap: 12,
  },
  photoSelectBox: {
    height: width * 0.16,
    backgroundColor: colors.fieldInactive,
    borderWidth: 0.8,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoSelectPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.placeholder,
    flex: 1,
  },
  photoSelectedText: {
    color: colors.ink,
    fontFamily: fontFamily.medium,
  },
  photoDeleteText: {
    color: '#fff',
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.semiBold,
  },
  textInputContainer: {
    height: width * 0.15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: colors.border,
    backgroundColor: colors.fieldInactive,
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
    fontFamily: fontFamily.regular,
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
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f15,
    color: colors.warning,
    marginBottom: 4,
  },
  warningBody: {
    fontSize: fontSizes.f14,
    color: colors.warning,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 18,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },
});

export default DeliveryRequest;

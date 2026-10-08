import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { goBack } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import BackIcon from '../../assets/icons/backIcon';
import WarnIcon from '../../assets/icons/warnIcon';
import Timeline from '../../components/Timeline';
import CustomButton from '../../components/CustomButton';
import AppModal from '../../components/AppModal';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { appImages } from '../../themes/appImages';
import { Job, STATUS_COLORS, JobStatus } from '../jobs/jobs';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentJob } from '../../redux/slices/globalSlice';
import { useLazyGetJobDetailQuery } from '../../redux/services/homeApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { getImageUrl } from '../../helper/commonFunctions';
import FastImage from '@d11/react-native-fast-image';
import { FlashList } from '@shopify/flash-list';
import { Spacer } from '../../components';
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

const DeliveryDetail = () => {
  const route = useRoute<any>();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const dispatch = useDispatch();
  const [getJobDetail] = useLazyGetJobDetailQuery();
  const reduxJob = useSelector((state: any) => state.global.currentJob) || {};

  const routeJob = route.params?.job;
  const initialJobId = routeJob?.id || reduxJob?.id;

  React.useEffect(() => {
    if (!initialJobId) return;
    managerApiCall(
      getJobDetail,
      initialJobId,
      (res: any) => {
        const apiJob = res?.data || res;
        if (apiJob) {
          dispatch(setCurrentJob(apiJob));
        }
      },
      () => {},
    );
  }, [initialJobId, getJobDetail, dispatch]);

  const apiDelivery =
    Array.isArray(reduxJob?.delivery) && reduxJob.delivery.length > 0
      ? reduxJob.delivery[0]
      : null;

  const rawStatus =
    apiDelivery?.status ||
    reduxJob?.jobStatus ||
    routeJob?.status ||
    'Requested';
  const statusString = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  const isDelivered = statusString === 'Delivered';
  const address = reduxJob?.address || routeJob?.address;
  const activeQuoteNumber = reduxJob?.activeQuote?.quoteNumber;
  const tileColorName = reduxJob?.activeQuote?.tileColor?.name;
  const activeQuoteTileType =
    reduxJob?.activeQuote?.tileProfile?.name ||
    reduxJob?.activeQuote?.tileType?.name;
  const totalTiles = reduxJob?.activeQuote?.totalTiles;
  const topCoatBuckets = reduxJob?.activeQuote?.topCoatBuckets;
  const isAged = !!reduxJob?.aged;

  const formatDate = (dateStr?: string, fallback = '') => {
    if (!dateStr) return fallback;
    return new Date(dateStr).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr?: string, fallback = '') => {
    if (!dateStr) return fallback;
    return new Date(dateStr)
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      .toLowerCase();
  };

  const formatDateTime = (dateStr?: string, fallback = '') => {
    if (!dateStr) return fallback;
    return new Date(dateStr)
      .toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      .replace(',', '')
      .toLowerCase()
      .replace(/(\b[a-z])/g, char => char.toUpperCase())
      .replace(/am|pm/g, match => match.toLowerCase());
  };

  const statusStyle = STATUS_COLORS[statusString as JobStatus] || {
    bg: isDelivered ? colors.successTint : colors.warningTint,
    text: isDelivered ? colors.success : colors.warning,
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            onPress={() => goBack()}
            accessibilityLabel="Go back"
            icon={<BackIcon color={colors.ink} size={24} />}
          />
          <View
            style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
          >
            <AppText style={[styles.statusText, { color: statusStyle.text }]}>
              {statusString.toUpperCase()}
            </AppText>
            {isAged && <View style={styles.ageDot} />}
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText variant="title" style={styles.title}>
            {apiDelivery?.trackingNumber
              ? `Delivery #${apiDelivery.trackingNumber}`
              : 'Delivery'}
          </AppText>
          <AppText style={styles.subtitle}>
            {apiDelivery
              ? `${apiDelivery.deliveryAddress} · ${formatDate(
                  apiDelivery.preferredDay,
                )}, ${apiDelivery.timeWindow || ''}`
              : address}
          </AppText>
        </View>

        {/* Delivery Details Card (Requested mode) */}

        {!isDelivered && (
          <View style={styles.alertBanner}>
            <WarnIcon
              color={colors.warning}
              size={18}
              style={{ marginTop: 2 }}
            />
            <AppText style={styles.alertText}>
              <AppText style={styles.alertTextBold}>
                Pending with RoofBros.
              </AppText>{' '}
              They'll confirm the date and stock; it updates here once they do.
            </AppText>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Method</AppText>
            <AppText style={styles.infoValue}>
              {apiDelivery?.method || '-'}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Deliver to</AppText>
            <AppText style={[styles.infoValue]}>
              {apiDelivery?.deliveryAddress || '-'}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Preferred day</AppText>
            <AppText style={styles.infoValue}>
              {apiDelivery?.preferredDay
                ? `${formatDate(apiDelivery.preferredDay)} · ${
                    apiDelivery.timeWindow || ''
                  }`
                : '-'}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>From quote</AppText>
            <AppText style={styles.infoValue}>
              {activeQuoteNumber ? `#${activeQuoteNumber}` : '-'}
            </AppText>
          </View>
        </View>

        {/* Materials Card */}

        {/* Drop-zone notes + photo (Requested mode) */}
        {(apiDelivery?.dropZoneNotes ||
          apiDelivery?.dropZonePhotos?.length > 0) &&
          !isDelivered && (
            <View style={styles.dropZoneSection}>
              <AppText style={styles.dropZoneTitle}>
                Drop-zone notes + photo
              </AppText>
              {apiDelivery?.dropZonePhotos?.length > 0 ? (
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <FlatList
                    data={apiDelivery.dropZonePhotos}
                    numColumns={2}
                    scrollEnabled={false}
                    keyExtractor={(_, index) => index.toString()}
                    columnWrapperStyle={{
                      gap: 10,
                    }}
                    ItemSeparatorComponent={() => <Spacer height={10} />}
                    renderItem={({ item: photoStr, index }: any) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            aspectRatio: 2.5,
                          }}
                        >
                          <FastImage
                            source={getImageUrl(photoStr)}
                            style={{
                              width: '100%',
                              height: '100%',
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </View>
                      );
                    }}
                  />
                </View>
              ) : null}

              <AppText style={styles.dropZoneCaption}>
                {apiDelivery?.dropZoneNotes
                  ? `"${apiDelivery.dropZoneNotes}"`
                  : ''}
              </AppText>
            </View>
          )}

        {/* Timeline */}
        <Timeline
          events={
            isDelivered
              ? [
                  {
                    id: '1',
                    title: 'Requested',
                    subtitle: formatDateTime(apiDelivery?.requestedAt),
                    status: 'done',
                  },
                  {
                    id: '2',
                    title: 'Scheduled',
                    subtitle: formatDateTime(apiDelivery?.scheduledAt),
                    status: 'done',
                  },
                  {
                    id: '3',
                    title: 'Out for delivery',
                    subtitle: formatTime(apiDelivery?.outForDeliveryAt),
                    status: 'done',
                  },
                  {
                    id: '4',
                    title: 'Delivered',
                    subtitle: formatTime(apiDelivery?.deliveredAt),
                    status: 'done',
                  },
                ]
              : [
                  {
                    id: '1',
                    title: 'Requested',
                    subtitle: formatDateTime(apiDelivery?.requestedAt),
                    status: 'done',
                  },
                  {
                    id: '2',
                    title: 'Confirmed by RoofBros',
                    status: apiDelivery?.scheduledAt ? 'done' : 'upcoming',
                  },
                  { id: '3', title: 'Scheduled', status: 'upcoming' },
                  { id: '4', title: 'Delivered', status: 'upcoming' },
                ]
          }
          style={styles.timeline}
        />

        {/* Bottom Section */}
        {isDelivered && (
          <View style={styles.proofSection}>
            <AppText style={styles.proofTitle}>Proof of delivery</AppText>
            <View style={styles.photoContainer}>
              {apiDelivery?.proofOfDeliveryPhotoUrl ? (
                <Image
                  source={getImageUrl(apiDelivery.proofOfDeliveryPhotoUrl)}
                  style={styles.photo}
                />
              ) : null}
            </View>
            <AppText style={styles.proofCaption}>
              {apiDelivery?.dropZoneNotes
                ? `${apiDelivery.dropZoneNotes} · ${formatTime(
                    apiDelivery?.deliveredAt,
                  )}`
                : formatTime(apiDelivery?.deliveredAt)}
            </AppText>
          </View>
        )}
      </ScrollView>
      {!isDelivered && (
        <View style={styles.actionButtons}>
          <CustomButton
            title="Cancel request"
            variant="dangerOutline"
            onPress={() => setShowCancelModal(true)}
          />
        </View>
      )}
      {/* Cancel Request Modal */}
      <AppModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel this request?"
        description="RoofBros haven’t confirmed it yet, so nothing is booked. The job goes back to Quoted and you can request delivery again any time."
      >
        <View style={styles.modalButtons}>
          <CustomButton
            title="Cancel request"
            variant="dangerOutline"
            onPress={handleCancelConfirm}
          />
          <CustomButton
            title="Keep request"
            variant="primary"
            onPress={() => setShowCancelModal(false)}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  );
};

export default DeliveryDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f11,
    letterSpacing: 0.5,
  },
  ageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.muted,
  },
  infoCard: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.ground,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f15,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineSoft,
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
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  materialDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
    marginTop: 2,
  },
  materialQty: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  dropZoneSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dropZoneTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 8,
  },
  dropZoneCaption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginVertical: 8,
  },
  photoContainer: {
    height: 140,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeline: {
    marginHorizontal: 6,
    marginBottom: 16,
  },
  alertBanner: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningTint,
    borderColor: colors.warning,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.warning,
  },
  alertTextBold: {
    fontFamily: fontFamily.semiBold,
    color: colors.warning,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: width * 0.05,
    borderTopWidth: 0.5,
    borderColor: colors.muted,
  },
  proofSection: {
    marginHorizontal: 20,
  },
  proofTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 8,
  },
  proofCaption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginTop: 8,
  },
  modalButtons: {
    gap: 12,
    marginTop: 8,
  },
});

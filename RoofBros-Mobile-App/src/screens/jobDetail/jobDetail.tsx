import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { navigate, goBack } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import CustomButton from '../../components/CustomButton';
import Timeline from '../../components/Timeline';
import BackIcon from '../../assets/icons/backIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { appImages } from '../../themes/appImages';
import { routesConstants } from '../../navigations/routeConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentJob } from '../../redux/slices/globalSlice';
import { Job, JobStatus, STATUS_COLORS } from '../jobs/jobs';
import AppModal from '../../components/AppModal';
import TrashIcon from '../../assets/icons/trashIcon';
import { useLazyGetJobDetailQuery } from '../../redux/services/homeApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { getImageUrl } from '../../helper/commonFunctions';

// Job shape plus the extra fields this screen needs from the job-detail API.
export interface JobDetailData extends Job {
  aerial_image_url?: string;
  areaSqmt?: number;
  pitch?: number;
  confidence?: number;
  quotesCount?: number;
  activeQuoteNumber?: string;
  activeQuoteTileType?: string;
  tileColorName?: string;
  photosCount?: number;
  notesSnippet?: string;
  notesCount?: number;
  timelineEvents?: any[];
  createdAt?: string;
  ridges?: number | null;
  roofFaces?: number | null;
  tileSize?: number | null;
  totalTiles?: number | null;
}

// Maps the raw `jobs/:jobId` API response onto the shape this screen renders.
export const mapApiJobToDetail = (
  apiJob: any,
  fallback: Job,
): JobDetailData => {
  const tileName = apiJob.activeQuote?.tileType?.name || 'Unknown Tile';
  const colorName = apiJob.activeQuote?.tileColor?.name || 'Unknown Color';
  const quotesCount = Array.isArray(apiJob.quotes)
    ? apiJob.quotes.length
    : undefined;

  let photosCount = 0;
  if (Array.isArray(apiJob.dropzonePhotos))
    photosCount += apiJob.dropzonePhotos.length;

  let notesSnippet = 'None yet';
  let notesCount = 0;
  if (
    Array.isArray(apiJob.additionalNotes) &&
    apiJob.additionalNotes.length > 0
  ) {
    const validNotes = apiJob.additionalNotes.filter((n: any) => {
      if (typeof n === 'string') return n.trim().length > 0;
      return n && typeof n.text === 'string' && n.text.trim().length > 0;
    });
    notesCount = validNotes.length;
    if (notesCount > 0) {
      const firstNoteObj = validNotes[0];
      const firstNote =
        typeof firstNoteObj === 'string' ? firstNoteObj : firstNoteObj.text;
      notesSnippet = `"${firstNote.substring(0, 25)}${
        firstNote.length > 25 ? '...' : ''
      }"`;
    }
  }

  // Timeline generation
  const currentStatus = (apiJob.jobStatus || '').toLowerCase();
  const dateStr = apiJob.createdAt
    ? new Date(apiJob.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : 'recently';

  const timelineEvents = [
    {
      id: '1',
      title: 'Measured',
      subtitle: dateStr,
      status: 'done',
    },
    {
      id: '2',
      title: 'Quoted',
      subtitle: ['quoted', 'requested', 'scheduled', 'delivered'].includes(
        currentStatus,
      )
        ? dateStr
        : undefined,
      status: ['quoted', 'requested', 'scheduled', 'delivered'].includes(
        currentStatus,
      )
        ? 'done'
        : 'upcoming',
    },
    {
      id: '3',
      title: 'Delivery requested',
      subtitle: ['requested', 'scheduled', 'delivered'].includes(currentStatus)
        ? dateStr
        : undefined,
      status: ['requested', 'scheduled', 'delivered'].includes(currentStatus)
        ? 'done'
        : 'upcoming',
    },
    {
      id: '4',
      title: 'Delivered',
      subtitle: currentStatus === 'delivered' ? dateStr : undefined,
      status: currentStatus === 'delivered' ? 'done' : 'upcoming',
    },
  ];

  return {
    id: apiJob.id || fallback.id,
    address: apiJob.address || fallback.address,
    subtitle: `${tileName} · ${colorName}`,
    status: apiJob.jobStatus
      ? ((apiJob.jobStatus.charAt(0).toUpperCase() +
          apiJob.jobStatus.slice(1)) as JobStatus)
      : fallback.status,
    value: fallback.value,
    image: apiJob.roofImage ? getImageUrl(apiJob.roofImage) : fallback.image,
    aged: fallback.aged,
    areaSqmt: apiJob.measurement?.areaSqmt
      ? Number(apiJob.measurement.areaSqmt)
      : undefined,
    pitch: apiJob.measurement?.pitch
      ? Number(apiJob.measurement.pitch)
      : undefined,
    confidence: apiJob.measurement?.confidence
      ? Number(apiJob.measurement.confidence)
      : undefined,
    quotesCount,
    activeQuoteNumber: apiJob.activeQuote?.quoteNumber,
    activeQuoteTileType: apiJob.activeQuote?.tileType?.name,
    tileColorName: apiJob.activeQuote?.tileColor?.name,
    photosCount,
    notesSnippet,
    notesCount,
    timelineEvents,
    createdAt: apiJob.createdAt,
    ridges: apiJob.measurement?.ridges
      ? Number(apiJob.measurement.ridges)
      : null,
    roofFaces: apiJob.measurement?.roofFaces
      ? Number(apiJob.measurement.roofFaces)
      : null,
    tileSize: apiJob.measurement?.tilesize
      ? Number(apiJob.measurement.tilesize)
      : null,
    totalTiles: apiJob.activeQuote?.totalTiles
      ? Number(apiJob.activeQuote.totalTiles)
      : null,
  };
};

const JobDetail = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [getJobDetail] = useLazyGetJobDetailQuery();

  const reduxJob = useSelector((state: any) => state.global.currentJob) || {};

  const job = React.useMemo(
    () => mapApiJobToDetail(reduxJob, reduxJob),
    [reduxJob],
  );

  React.useEffect(() => {
    if (!reduxJob?.id) return;
    managerApiCall(
      getJobDetail,
      reduxJob.id,
      (res: any) => {
        const apiJob = res?.data || res;
        if (apiJob) {
          dispatch(setCurrentJob(apiJob));
        }
      },
      () => {},
    );
  }, [reduxJob.id, getJobDetail, dispatch]);

  const statusStyle = job?.status
    ? STATUS_COLORS[job.status] || {
        bg: colors.panel,
        text: colors.body,
      }
    : { bg: colors.panel, text: colors.body };

  const isMeasured = job?.status === 'Measured';
  const isQuoted = job?.status === 'Quoted';

  const measurementSubtitle =
    job.areaSqmt != null && job.pitch != null && job.confidence != null
      ? `${job.areaSqmt} m² · ${job.pitch.toFixed(1)}° · ${Math.round(
          job.confidence,
        )}%`
      : 'Not available';

  const quotesTitle =
    job.quotesCount != null
      ? job.quotesCount > 0
        ? `Quotes (${job.quotesCount})`
        : 'Quotes'
      : 'Quotes';

  const formatType = (type?: string) =>
    type ? type.charAt(0).toUpperCase() + type.slice(1) : '';

  const quotesSubtitle =
    job.quotesCount === 0 || job.quotesCount == null
      ? 'None yet'
      : [formatType(job.activeQuoteTileType), job.tileColorName]
          .filter(Boolean)
          .join(' · ') || 'Details not available';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            onPress={() => goBack()}
            accessibilityLabel="Go back"
            icon={<BackIcon color={colors.ink} size={24} />}
          />
          <View style={styles.titleContainer}>
            <AppText
              variant="title"
              numberOfLines={2}
              style={{ flex: 1, marginRight: 8 }}
            >
              {job.address}
            </AppText>
            <View
              style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
            >
              <AppText style={[styles.statusText, { color: statusStyle.text }]}>
                {job?.status ? job.status.toUpperCase() : ''}
              </AppText>
              {job?.aged && <View style={styles.ageDot} />}
            </View>
          </View>
        </View>

        {/* Aerial Photo */}
        <View style={styles.photoContainer}>
          <Image 
            source={
              job?.aerial_image_url 
                ? getImageUrl(job.aerial_image_url) 
                : (job?.image || appImages.ba1Before)
            } 
            style={styles.photo} 
            resizeMode="cover" 
          />
        </View>

        {/* Hub */}
        <View style={styles.hubContainer}>
          <View style={styles.hubRow}>
            <TouchableOpacity
              style={styles.hubButton}
              // onPress={() => navigate(routesConstants.measurementDetail, { job })}
            >
              <AppText style={styles.hubTitle}>Measurement</AppText>
              <AppText style={styles.hubSubtitle}>
                {measurementSubtitle}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hubButton}
              onPress={() =>
                isQuoted && navigate(routesConstants.quotesList, { job })
              }
            >
              <AppText style={styles.hubTitle}>{quotesTitle}</AppText>
              <AppText style={styles.hubSubtitle}>{quotesSubtitle}</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.hubRow}>
            <TouchableOpacity
              style={styles.hubButton}
              onPress={() => navigate(routesConstants.photosList)}
            >
              <AppText style={styles.hubTitle}>
                {job.photosCount
                  ? `Photos (${job.photosCount})`
                  : 'Photos'}
              </AppText>
              <AppText style={styles.hubSubtitle}>
                {job.photosCount ? 'site shots' : 'None yet'}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hubButton}
              onPress={() => navigate(routesConstants.notesList)}
            >
              <AppText style={styles.hubTitle}>
                {job.notesCount ? `Notes (${job.notesCount})` : 'Notes'}
              </AppText>
              <AppText style={styles.hubSubtitle}>
                {job.notesSnippet || 'None yet'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isMeasured ? (
            <CustomButton
              title="Start a quote"
              onPress={() => navigate(routesConstants.newJob)}
              style={styles.deliveryButton}
            />
          ) : (
            <CustomButton
              title="Request delivery"
              onPress={() =>
                navigate(routesConstants.quotesList, {
                  fromRequestDelivery: true,
                  job,
                })
              }
              style={styles.deliveryButton}
            />
          )}
        </View>

        {/* Timeline */}
        <Timeline
          events={job.timelineEvents || []}
          // onEventPress={event => {
          //   if (
          //     event.title === 'Delivery requested' ||
          //     event.title === 'Delivered'
          //   ) {
          //     navigate(routesConstants.deliveryDetail);
          //   }
          // }}
        />

        {isMeasured && (
          <TouchableOpacity
            style={styles.deleteButtonContainer}
            onPress={() => console.log('Delete job')}
          >
            <TrashIcon color={colors.error} size={20} />
            <AppText style={styles.deleteButtonText}>Delete job</AppText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f22,
    color: colors.ink,
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
  photoContainer: {
    height: 140,
    marginHorizontal: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  hubContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  hubRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hubButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  hubTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 4,
  },
  hubSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 14,
  },
  deliveryButton: {
    // defaults are maroon
  },
  quoteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  quoteButtonText: {
    color: colors.ink,
  },
  timeline: {
    // marginHorizontal: 14,
  },
  modalCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  modalCardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 4,
  },
  modalCardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    gap: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
  },
});

export default JobDetail;

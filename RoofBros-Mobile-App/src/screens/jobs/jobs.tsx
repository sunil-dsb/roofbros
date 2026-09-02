import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import StackedInput from '../../components/StackedInput';
import PlusIcon from '../../assets/icons/plusIcon';
import SearchIcon from '../../assets/icons/searchIcon';
import CloseIcon from '../../assets/icons/closeIcon';
import WarnIcon from '../../assets/icons/warnIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { appImages } from '../../themes/appImages';
import { routesConstants } from '../../navigations/routeConstants';
import { navigate } from '../../navigations/navigationServices';
import { useDispatch } from 'react-redux';
import { setCurrentJob } from '../../redux/slices/globalSlice';
import { Spacer } from '../../components';
// Removed useFocusEffect import
import { managerApiCall } from '../../helper/manageApiCallFun';
import { useLazyGetJobsQuery } from '../../redux/services/homeApi';
import { getImageUrl } from '../../helper/commonFunctions';
import FastImage from '@d11/react-native-fast-image';

const FILTERS = ['All', 'Quoted', 'Delivered', 'Requested'] as const;
type Filter = (typeof FILTERS)[number];

export type JobStatus = 'Measured' | 'Quoted' | 'Delivered' | 'Requested';

export interface Job {
  id: string;
  address: string;
  subtitle: string;
  status: JobStatus;
  value?: string;
  image: any;
  aged?: boolean;
}

export const STATUS_COLORS: Record<JobStatus, { bg: string; text: string }> = {
  Measured: { bg: colors.panel, text: colors.body },
  Quoted: { bg: '#E5EDF8', text: colors.link }, // Light blue background for Quoted
  Delivered: { bg: colors.successTint, text: colors.success },
  Requested: { bg: colors.warningTint, text: colors.warning },
};

const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </AppText>
    </Pressable>
  );
};

const ShimmerLoader = () => {
  const opacity = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <RNAnimated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.muted, opacity },
      ]}
    />
  );
};

const JobCard = ({ job }: { job: Job }) => {
  const statusStyle = STATUS_COLORS[job.status];
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => {
        dispatch(setCurrentJob(job));
        if (job.status === 'Requested' || job.status === 'Delivered') {
          navigate(routesConstants.deliveryDetail);
        } else {
          navigate(routesConstants.jobDetail);
        }
      }}
    >
      <View style={styles.thumb}>
        {imageError || !job.image ? (
          <Image source={appImages.ba1Before} style={styles.thumbImage} />
        ) : (
          <FastImage 
            source={job.image} 
            style={styles.thumbImage}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }} 
          />
        )}
        {!imageLoaded && !imageError && !!job.image && <ShimmerLoader />}
      </View>
      <View style={styles.jobText}>
        <AppText style={styles.jobTitle} numberOfLines={1}>
          {job.address}
        </AppText>
        <AppText style={styles.jobSubtitle} numberOfLines={2}>
          {job.subtitle}
        </AppText>
      </View>
      <View style={styles.jobRight}>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <AppText style={[styles.statusText, { color: statusStyle.text }]}>
            {job.status.toUpperCase()}
          </AppText>
          {job.aged && <View style={styles.ageDot} />}
        </View>
        {job.value ? (
          <AppText style={styles.jobValue}>{job.value}</AppText>
        ) : (
          <AppText style={styles.jobValue}>–</AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({ onStart }: { onStart: () => void }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeText}>
          <AppText style={styles.welcomeHeading}>No jobs yet</AppText>
          <AppText style={styles.welcomeBody}>
            Drop in an address and we'll measure the roof. Your quote starts
            from there.
          </AppText>
        </View>
      </View>
      <CustomButton
        title="Start a job"
        onPress={onStart}
        iconRight={<PlusIcon color={colors.ground} size={20} />}
      />
    </View>
  );
};

const SearchEmptyState = ({
  searchQuery,
  onStart,
}: {
  searchQuery: string;
  onStart: () => void;
}) => {
  return (
    <View style={styles.searchEmptyContainer}>
      <View style={styles.searchEmptyContent}>
        <SearchIcon
          color={colors.muted}
          size={36}
          style={styles.searchEmptyIcon}
        />
        <AppText style={styles.searchEmptyTitle}>
          No jobs match “{searchQuery}”
        </AppText>
        <AppText style={styles.searchEmptyBody}>
          Check the spelling, or start a new job{'\n'}at this address.
        </AppText>
      </View>
      <CustomButton
        title="Start a job"
        variant="secondary"
        onPress={onStart}
        iconRight={<PlusIcon color={colors.ink} size={20} />}
        style={styles.startJobBtn}
      />
    </View>
  );
};

const JobSeparator = () => <Spacer height={width * 0.04} />;

const Jobs = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOffline] = useState(false);
  const [jobsData, setJobsData] = useState<Job[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [getJobs] = useLazyGetJobsQuery();

  const loadJobs = useCallback(() => {
    // Build the payload for query params
    const payload =
      activeFilter === 'All' ? {} : { jobStatus: activeFilter.toLowerCase() };

    managerApiCall(
      getJobs,
      payload,
      res => {
        if (res?.data && Array.isArray(res.data)) {
          const mappedJobs: Job[] = res.data.map((apiJob: any) => {
            // Capitalize status (e.g. 'quoted' -> 'Quoted')
            const statusCapitalized = apiJob.jobStatus
              ? apiJob.jobStatus.charAt(0).toUpperCase() +
                apiJob.jobStatus.slice(1)
              : 'Measured';

            // Construct subtitle
            const tileName =
              apiJob.activeQuote?.tileType?.name ||
              apiJob.tileType?.name ||
              'Unknown Tile';
            const colorName =
              apiJob.activeQuote?.tileColor?.name ||
              apiJob.tileColor?.name ||
              'Unknown Color';
            const subtitle = `${tileName} · ${colorName}`;

            return {
              id: apiJob.id,
              address: apiJob.address || 'Unknown Address',
              subtitle: subtitle,
              status: statusCapitalized as JobStatus,
              value: undefined, // Price is not provided in API yet
              image: apiJob.roofImage
                ? getImageUrl(apiJob.roofImage)
                : appImages.ba1Before, // Fallback image if null
            };
          });
          setJobsData(mappedJobs);
        } else {
          setJobsData([]);
        }
        setRefreshing(false);
      },
      err => {
        setJobsData([]);
        setRefreshing(false);
      },
    );
  }, [getJobs, activeFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadJobs();
  }, [loadJobs]);

  const displayJobs = jobsData || [];

  const filteredJobs = displayJobs.filter(job => {
    // The API is now handling the status filtering via query param,
    // but we can leave this here as a fallback or for instant local filtering.
    const matchesFilter = activeFilter === 'All' || job.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      job.address.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      job.subtitle.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isSearchNoResults =
    isSearching && searchQuery.trim().length > 0 && filteredJobs.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {!isSearching ? (
        <View style={styles.headerRow}>
          <AppText variant="display" style={styles.title}>
            Jobs
          </AppText>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconBtn}
            onPress={() => setIsSearching(true)}
            accessibilityLabel="Search"
          >
            <SearchIcon color={colors.ink} size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <View style={styles.searchFieldWrapper}>
            <StackedInput
              leftIcon={<SearchIcon color={colors.muted} size={20} />}
              style={styles.searchField}
              placeholder="Search jobs, addresses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconBtn}
            onPress={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
            accessibilityLabel="Close Search"
          >
            <CloseIcon color={colors.ink} width={22} height={22} />
          </TouchableOpacity>
        </View>
      )}

      {isOffline && (
        <View style={styles.offlineBanner}>
          <WarnIcon color={colors.warning} size={18} style={styles.warnIcon} />
          <AppText style={styles.offlineText}>
            <AppText style={styles.offlineTextBold}>You're offline.</AppText>{' '}
            Saved jobs still work; anything new syncs when you're back.
          </AppText>
        </View>
      )}

      <View style={styles.chipRowWrapper}>
        {FILTERS.map(filter => (
          <Chip
            key={filter}
            label={filter}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </View>
      <View style={{ height: '100%' }}>
        <FlatList
          data={filteredJobs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <JobCard job={item} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={JobSeparator}
          ListFooterComponent={<Spacer height={width * 0.3} />}
          ListEmptyComponent={
            isSearchNoResults ? (
              <SearchEmptyState
                searchQuery={searchQuery}
                onStart={() => navigate(routesConstants.newJob)}
              />
            ) : (
              <EmptyState onStart={() => navigate(routesConstants.newJob)} />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.ink}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
    paddingHorizontal: 20,
    paddingBottom: spacing.s,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.s,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: fontSizes.f28,
    lineHeight: fontSizes.f28 * 1.08,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  searchField: {
    height: width * 0.15,
    marginRight: spacing.s,
    backgroundColor: colors.fieldActive,
    borderWidth: 1.5,
    borderColor: colors.lineSoft,
    paddingHorizontal: spacing.s,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBEEDC',
    borderColor: colors.warning,
    borderWidth: 1,
    padding: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.xxs,
  },
  offlineText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.warning,
    lineHeight: fontSizes.f13 * 1.4,
  },
  offlineTextBold: {
    fontFamily: fontFamily.semiBold,
    color: colors.warning,
  },
  chipRowWrapper: {
    marginBottom: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexGrow: 0,
  },
  chipRowContent: {
    paddingHorizontal: spacing.s,
    gap: spacing.xxs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.02,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
  },
  chipSelected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f14,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.accent,
  },
  list: {
    paddingBottom: spacing.s,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  thumb: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  jobText: {
    flex: 1,
    minWidth: 0,
  },
  jobTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f15,
    color: colors.ink,
  },
  jobSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f13,
    color: colors.muted,
    marginTop: 2,
  },
  jobRight: {
    alignItems: 'flex-end',
    gap: 4,
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
  jobValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    gap: spacing.s,
    marginTop: spacing.s,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.panel,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  welcomeText: {
    paddingHorizontal: spacing.s,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
    alignItems: 'center',
  },
  welcomeHeading: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f18,
    color: colors.ink,
    textAlign: 'center',
  },
  welcomeBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.body,
    lineHeight: fontSizes.f15 * 1.5,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 220,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.s,
  },
  searchEmptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  searchEmptyIcon: {
    marginBottom: spacing.m,
  },
  searchEmptyTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  searchEmptyBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
    lineHeight: 22,
    textAlign: 'center',
  },
  startJobBtn: {
    borderRadius: 9999,
  },
  searchFieldWrapper: {
    flex: 1,
  },
  warnIcon: {
    marginTop: 2,
  },
});

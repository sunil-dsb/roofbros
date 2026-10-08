import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { goBack, navigate } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import CustomButton from '../../components/CustomButton';
import BackIcon from '../../assets/icons/backIcon';
import ChevronRightIcon from '../../assets/icons/chevronRightIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { routesConstants } from '../../navigations/routeConstants';
import { Spacer } from '../../components';
import { useLazyGetJobQuotesQuery } from '../../redux/services/homeApi';
import { managerApiCall } from '../../helper/manageApiCallFun';

const Quotes = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const fromRequestDelivery = route.params?.fromRequestDelivery;

  const initialJob = route.params?.job;
  const [getJobQuotes] = useLazyGetJobQuotesQuery();
  const [rawQuotes, setRawQuotes] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadQuotes = React.useCallback(
    (pageNum = 1, isRefresh = false) => {
      if (!initialJob?.id) return;
      if (pageNum > 1) {
        setIsLoadingMore(true);
      }
      managerApiCall(
        getJobQuotes,
        { id: initialJob.id, params: { page: pageNum, limit: 10 } },
        (res: any) => {
          const resAny = res as any;
          let newQuotes: any[] = [];

          if (Array.isArray(resAny?.data)) {
            newQuotes = resAny.data;
          } else if (Array.isArray(resAny?.data?.quotes)) {
            newQuotes = resAny.data.quotes;
          } else if (Array.isArray(resAny)) {
            newQuotes = resAny;
          }

          const meta = resAny?.data?.meta || resAny?.meta;
          if (meta && meta.totalPages !== undefined) {
            setHasMore(pageNum < meta.totalPages);
          } else {
            setHasMore(newQuotes.length === 10);
          }

          if (pageNum === 1) {
            setRawQuotes(newQuotes);
          } else {
            setRawQuotes(prev => [...(prev || []), ...newQuotes]);
          }

          setIsLoadingMore(false);
          setRefreshing(false);
        },
        (err: any) => {
          console.log('Failed to fetch quotes', err);
          if (pageNum === 1) setRawQuotes([]);
          setHasMore(false);
          setIsLoadingMore(false);
          setRefreshing(false);
        },
        pageNum > 1 || isRefresh ? 'no-loader' : undefined,
      );
    },
    [initialJob?.id, getJobQuotes],
  );

  React.useEffect(() => {
    setPage(1);
    loadQuotes(1);
  }, [loadQuotes]);

  const quotesData = rawQuotes.map((q: any) => {
    const tileName = q?.tileColor?.name || q?.tileType?.name || 'Unknown Tile';
    const jobTypeStr = q?.jobType || 'Install';
    const dateStr = q?.createdAt
      ? new Date(q.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })
      : 'recently';
    return {
      id: q.id,
      title: `${tileName} · ${jobTypeStr}`,
      subtitle: `#${q.quoteNumber || 'Q-XXX'} · saved ${dateStr}`,
      value: q.totalPrice ? `$${q.totalPrice}` : 'TBD', // API didn't return price in snippet
      rawQuote: q,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            onPress={() => goBack()}
            accessibilityLabel="Go back"
            icon={<BackIcon color={colors.ink} size={24} />}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText variant="title" style={styles.title}>
            {fromRequestDelivery ? 'Which quote?' : 'Quotes'}
          </AppText>
          <AppText style={styles.subtitle}>
            {initialJob?.address || 'Unknown Address'}
          </AppText>
        </View>

        {/* List */}
        <View style={[styles.listContainer]}>
          {quotesData.length > 0 ? (
            <FlashList<any>
              data={quotesData}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  onPress={() =>
                    fromRequestDelivery
                      ? navigate(routesConstants.deliveryRequest, {
                          quoteItem: item,
                        })
                      : navigate(routesConstants.quoteDetails, {
                          quote: item.rawQuote,
                          fromQuotesList: true,
                        })
                  }
                  style={styles.listItem}
                >
                  <View style={styles.listItemContent}>
                    <AppText style={styles.itemTitle}>{item.title}</AppText>
                    <AppText style={styles.itemSubtitle}>
                      {item.subtitle}
                    </AppText>
                  </View>
                  <AppText style={styles.itemValue}>{item.value}</AppText>
                  <ChevronRightIcon color={colors.muted} size={22} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <Spacer height={width * 0.07} />}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (!isLoadingMore && hasMore && !refreshing) {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadQuotes(nextPage);
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                <View>
                  {isLoadingMore && (
                    <View style={{ paddingVertical: spacing.xl }}>
                      <ActivityIndicator size="large" color={colors.ink} />
                    </View>
                  )}
                </View>
              }
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPage(1);
                loadQuotes(1, true);
              }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No quotes found.</AppText>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      {!fromRequestDelivery && (
        <View style={[styles.footer]}>
          <CustomButton
            title="Start another quote"
            onPress={() =>
              navigate(routesConstants.newJob, { fromQuotesList: true })
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: fontSizes.f28,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.muted,
  },
  listContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 2,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 15,
  },
  listItemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  itemValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginRight: 8,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f15,
    color: colors.muted,
  },
});

export default Quotes;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { resetToRoute, navigate } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import CheckIcon from '../../assets/icons/checkIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { routesConstants } from '../../navigations/routeConstants';
import { width } from '../../themes/spacing';

const QuoteSaved = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const quoteNumber = route.params?.quoteNumber || 'Q-XXX';
  const price = route.params?.price || 'TBD';
  const address = route.params?.address || 'Unknown Address';
  const rawQuote = route.params?.rawQuote || {};

  const handleRequestDelivery = () => {
    // `rawQuote` passed here is often a Job object, which contains an `activeQuote`.
    // The deliveryRequest screen expects a Quote object for `rawQuote`.
    const actualQuote = rawQuote.activeQuote || rawQuote;

    // If it was a Job object, ensure the quote has a reference back to the job
    // so deliveryRequest can extract the jobId and address.
    if (rawQuote.id && !actualQuote.job) {
      actualQuote.job = rawQuote;
      actualQuote.jobId = rawQuote.id;
    }

    resetToRoute(routesConstants.deliveryRequest, {
      quoteItem: { rawQuote: actualQuote, quoteNumber, price, address },
    });
  };

  const handleViewJob = () => {
    resetToRoute(routesConstants.jobDetail);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <CheckIcon color={colors.success} size={32} />
        </View>
        <AppText variant="title" style={styles.title}>
          Quote saved.
        </AppText>
        <AppText style={styles.subtitle}>
          Quote #{quoteNumber} · attached to {address}.
        </AppText>
      </View>

      <View style={[styles.footer]}>
        <CustomButton
          title="Request delivery"
          onPress={handleRequestDelivery}
          style={{ marginBottom: 12 }}
        />
        <CustomButton
          title="View job"
          onPress={handleViewJob}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
};

export default QuoteSaved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 80,
    backgroundColor: '#DEF7EC', // light green tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { goBack, resetToRoute } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import CustomButton from '../../components/CustomButton';
import CloseIcon from '../../assets/icons/closeIcon';
import CheckIcon from '../../assets/icons/checkIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { routesConstants } from '../../navigations/routeConstants';

const DeliverySuccess = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const job = route.params?.job;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <CheckIcon color={colors.success} size={32} />
        </View>
        <AppText style={styles.title}>Request submitted.</AppText>
        <AppText style={styles.subtitle}>
          Request #DR-2481 · Thu 16 Jul, morning. We'll text you when it's on
          the way.
        </AppText>
      </View>

      {/* Footer */}
      <View style={[styles.footer]}>
        <CustomButton
          title="View job"
          onPress={() => resetToRoute(routesConstants.deliveryDetail, { job })}
        />
      </View>
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
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -60, // visual center balance
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

export default DeliverySuccess;

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from '../components/AppText';
import { colors } from '../themes/colors';
import { fontFamily } from '../assets/fontFamily';
import fontSizes from '../themes/fontSizes';

import CircleCheckIcon from '../assets/icons/circleCheckIcon';
import WarnIcon from '../assets/icons/warnIcon';
import InfoIcon from '../assets/icons/infoIcon';
import CloseIcon from '../assets/icons/closeIcon';

const ToastBanner = ({ text1, icon: Icon, bgColor }: any) => {
  return (
    <View style={[styles.bannerContainer, { backgroundColor: bgColor }]}>
      <View style={styles.leftContent}>
        <Icon color={colors.ground} size={20} />
        <AppText style={styles.bannerText} numberOfLines={2}>
          {text1}
        </AppText>
      </View>
      <TouchableOpacity
        style={styles.dismissBtn}
        activeOpacity={0.7}
        onPress={() => Toast.hide()}>
        <AppText style={styles.dismissText}>Dismiss</AppText>
        <CloseIcon color={colors.ground} size={14} />
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig = {
  success: ({ text1 }: any) => (
    <ToastBanner text1={text1} icon={CircleCheckIcon} bgColor={colors.success} />
  ),
  error: ({ text1 }: any) => (
    <ToastBanner text1={text1} icon={WarnIcon} bgColor={'#A31D1D'} />
  ),
  info: ({ text1 }: any) => (
    <ToastBanner text1={text1} icon={InfoIcon} bgColor={colors.link} />
  ),
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 10,
  },
  bannerText: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.medium,
    color: colors.ground,
    flexShrink: 1,
    lineHeight: 20,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent pill
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dismissText: {
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
    color: colors.ground,
  },
});


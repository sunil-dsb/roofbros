import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import TileTexture from '../../components/TileTexture';
import { navigate, goBack } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import StackedInput from '../../components/StackedInput';
import CheckIcon from '../../assets/icons/checkIcon';
import DocumentIcon from '../../assets/icons/documentIcon';
import BackIcon from '../../assets/icons/backIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { spacing, width } from '../../themes/spacing';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const TileDetails = () => {
  const route = useRoute<any>();
  const flow = route.params?.flow || 'colours';
  const tile = route.params?.tile;

  const isNewJob = flow === 'newJob';

  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const textureOpacity = useSharedValue(1);
  const pillLabelOpacity1 = useSharedValue(1);
  const pillLabelOpacity2 = useSharedValue(0);

  const handleHoldStart = () => {
    textureOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    pillLabelOpacity1.value = withTiming(0, { duration: 200 });
    pillLabelOpacity2.value = withTiming(1, { duration: 200 });
  };

  const handleHoldEnd = () => {
    textureOpacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
    pillLabelOpacity1.value = withTiming(1, { duration: 200 });
    pillLabelOpacity2.value = withTiming(0, { duration: 200 });
  };

  const pillLabel1Style = useAnimatedStyle(() => ({
    opacity: pillLabelOpacity1.value,
  }));
  const pillLabel2Style = useAnimatedStyle(() => ({
    opacity: pillLabelOpacity2.value,
  }));

  const tileTitle =
    tile?.name ||
    (isNewJob ? 'Marseille Pottery Brown' : 'Marseille Titan Gloss');

  return (
    <SafeAreaView style={styles.container}>
      {isNewJob && (
        <FlowHeader
          onBackPress={() => goBack()}
          currentStep={5}
          totalSteps={6}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {!isNewJob && (
          <TouchableOpacity
            onPress={() => goBack()}
            style={styles.backCircleBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon color={colors.ink} size={20} />
          </TouchableOpacity>
        )}

        <Pressable onPressIn={handleHoldStart} onPressOut={handleHoldEnd}>
          <TileTexture
            color={tile?.color || (isNewJob ? '#574b47' : '#333333')}
            style={styles.imagePlaceholder}
            textureOpacity={textureOpacity}
          >
            <View style={styles.holdPill}>
              <Animated.Text style={[styles.holdPillText, pillLabel1Style]}>
                Hold to see original
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.holdPillText,
                  styles.holdPillTextOverlay,
                  pillLabel2Style,
                ]}
              >
                Release to restore
              </Animated.Text>
            </View>
          </TileTexture>
        </Pressable>

        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.title}>
            {tileTitle}
          </AppText>
          <View style={styles.basixBadge}>
            <AppText style={styles.basixBadgeText}>BASIX · DARK</AppText>
          </View>
        </View>

        <AppText style={styles.subtitle}>
          Terracotta · raised profile · in stock at the yard
        </AppText>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <AppText style={styles.statValue}>0.72</AppText>
            <AppText style={styles.statLabel}>SOLAR ABS.</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText style={styles.statValue}>28</AppText>
            <AppText style={styles.statLabel}>SRI</AppText>
          </View>
          <View style={[styles.statBox, styles.lastStatBox]}>
            <AppText style={styles.statValue}>11</AppText>
            <AppText style={styles.statLabel}>LRV</AppText>
          </View>
        </View>

        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Min. pitch</AppText>
            <AppText style={styles.detailValue}>
              15° with sarking · 20° without
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Weight</AppText>
            <AppText style={styles.detailValue}>
              4.5 kg/tile · 49.5 kg/m²
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Coverage</AppText>
            <AppText style={styles.detailValue}>10.5 tiles/m²</AppText>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <AppText style={styles.detailLabel}>Coastal</AppText>
            <AppText style={styles.detailValue}>Salt safe</AppText>
          </View>
        </View>

        {isNewJob && (
          <>
            <CustomButton
              title="Data sheet (PDF)"
              onPress={() => {}}
              variant="secondary"
              iconLeft={<DocumentIcon color={colors.ink} size={18} />}
              style={styles.dataSheetBtn}
            />
            <AppText style={styles.sectionLabel}>
              Additional details (optional)
            </AppText>
            <StackedInput
              style={styles.detailsInput}
              placeholder="Anything else about the job..."
              placeholderTextColor={colors.placeholder}
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setIsUrgent(!isUrgent)}
            >
              <View
                style={[styles.checkbox, isUrgent && styles.checkboxChecked]}
              >
                {isUrgent && <CheckIcon color={colors.ground} size={12} />}
              </View>
              <AppText style={styles.checkboxLabel}>
                This project is urgent
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isNewJob ? (
          <>
            <CustomButton
              title="Build quote"
              onPress={() => navigate(routesConstants.quoteDetails)}
              style={styles.primaryFooterBtn}
            />
            <CustomButton
              title="Try a colour"
              variant="secondary"
              onPress={() =>
                navigate(routesConstants.tryOnRoof, {
                  initialMode: 'One colour',
                })
              }
            />
          </>
        ) : (
          <>
            <CustomButton
              title="Data sheet (PDF)"
              onPress={() => {}}
              variant="secondary"
              iconLeft={<DocumentIcon color={colors.ink} size={18} />}
              style={[styles.dataSheetBtn, { marginTop: 0, marginBottom: 12 }]}
            />
            <CustomButton
              title="Start a quote"
              onPress={() => navigate(routesConstants.newJob)}
              style={styles.primaryFooterBtn}
            />
            <CustomButton
              title="Try a colour"
              variant="secondary"
              onPress={() =>
                navigate(routesConstants.compareColours, {
                  initialMode: 'One colour',
                })
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  holdPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  holdPillText: {
    color: colors.ground,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  holdPillTextOverlay: {
    position: 'absolute',
    top: 6,
    right: 12,
  },
  zoomPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  zoomPillText: {
    color: colors.ground,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: fontSizes.f22,
  },
  basixBadge: {
    backgroundColor: colors.accentTint,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  basixBadgeText: {
    color: colors.accent,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.panel,
  },
  statValue: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f26,
    color: colors.ink,
    marginBottom: 4,
    letterSpacing: 2,
  },
  statLabel: {
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    letterSpacing: 2,
  },
  detailsList: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  detailValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f14,
    color: colors.ink,
  },
  dataSheetBtn: {
    marginTop: 20,
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 12,
  },
  detailsInput: {
    height: width * 0.15,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f17,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
  lastStatBox: {
    borderRightWidth: 0,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  primaryFooterBtn: {
    marginBottom: 12,
  },
});

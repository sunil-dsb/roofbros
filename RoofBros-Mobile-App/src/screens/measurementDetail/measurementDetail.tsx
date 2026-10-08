import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { goBack, navigate } from '../../navigations/navigationServices';
import { routesConstants } from '../../navigations/routeConstants';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import CustomButton from '../../components/CustomButton';
import BackIcon from '../../assets/icons/backIcon';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { appImages } from '../../themes/appImages';
import { width } from '../../themes/spacing';

const MeasurementDetail = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const job = route.params?.job || {};

  const address = job?.address || 'Unknown Address';
  const jobType = job?.jobType || 'restoration';
  const confidence =
    job?.confidence != null ? Math.round(job.confidence) : '--';
  const areaSqmt = job?.areaSqmt != null ? job.areaSqmt.toFixed(1) : '--';
  const pitch = job?.pitch != null ? job.pitch.toFixed(1) : '--';
  const tileSize = job?.tileSize != null ? job.tileSize : '--';
  const totalTiles = job?.totalTiles != null ? job.totalTiles : '--';
  const imageSource = job?.image || appImages.ba1Before;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          onPress={() => goBack()}
          accessibilityLabel="Go back"
          icon={<BackIcon color={colors.ink} size={24} />}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Measurement
        </AppText>
        <AppText style={styles.subtitle}>{address}</AppText>

        <View style={styles.mapContainer}>
          <ImageBackground
            source={imageSource}
            style={styles.mapBackground}
            imageStyle={styles.mapImage}
          >
            <View style={styles.mapOverlay}>
              <View style={styles.mapPill}>
                <AppText style={styles.mapPillText}>
                  {confidence}% confidence
                </AppText>
              </View>
            </View>
            <View style={styles.polygonOverlay}>
              {/* This represents the red measurement polygon in the screenshot */}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <AppText variant="data">
                {areaSqmt}
                <AppText style={styles.unit}> m²</AppText>
              </AppText>
              <AppText style={styles.gridLabel}>ROOF AREA</AppText>
            </View>
            <View style={styles.gridItem}>
              <AppText variant="data">
                {pitch}
                <AppText style={styles.unit}>°</AppText>
              </AppText>
              <AppText style={styles.gridLabel}>PITCH</AppText>
            </View>
          </View>
          {/* Row 2 */}
          {jobType !== 'restoration' && (
            <View style={styles.gridRow}>
              {/* <View style={styles.gridItem}>
              <AppText variant="data">{tileSize}</AppText>
              <AppText style={styles.gridLabel}>TILE SIZE</AppText>
            </View> */}
              <View style={[styles.gridItem, { alignItems: 'center' }]}>
                <AppText variant="data">{totalTiles}</AppText>
                <AppText style={styles.gridLabel}>TOTAL TILES</AppText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title="Adjust measurement"
          onPress={() => navigate(routesConstants.adjustOutline)}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
};

export default MeasurementDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    color: colors.ink, // Using ink because in screenshot it's dark text, slightly smaller than title
    marginBottom: 24,
  },
  mapContainer: {
    height: 220,
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
  },
  mapBackground: {
    flex: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    zIndex: 10,
  },
  polygonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(217, 32, 32, 0.3)', // Red polygon overlay approximation
    margin: 40,
  },
  mapPill: {
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapPillText: {
    color: colors.ground,
    fontSize: fontSizes.f13,
    fontFamily: fontFamily.medium,
  },
  grid: {
    backgroundColor: colors.surface,
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unit: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.ink,
  },
  gridLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f12,
    color: colors.ink,
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

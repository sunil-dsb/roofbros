import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { navigate, goBack } from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import CustomKeyboardScrollView from '../../components/CustomKeyboardScrollView';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { width } from '../../themes/spacing';
import { getImageUrl } from '../../helper/commonFunctions';

const adjustOutlineSchema = z.object({
  area: z.string().min(1, 'Roof area is required'),
  pitch: z.string().min(1, 'Roof pitch is required'),
  tileSize: z.string().min(1, 'Tile size is required'),
  totalTiles: z.string().min(1, 'Total tiles is required'),
});

type AdjustOutlineForm = z.infer<typeof adjustOutlineSchema>;

const AdjustOutline = () => {
  const route = useRoute<any>();
  const jobType = route.params?.jobType || 'restoration';
  const address = route.params?.address || 'Unknown Address';

  const roofDetails = route.params?.roofDetails || {};

  const initialMeasurements = {
    area: roofDetails.area_sq_mt ?? '348.7',
    pitch: roofDetails.pitch ?? '3.13',
    tileSize: roofDetails.tilesize ?? '4096',
    totalTiles: roofDetails.totalTiles ?? '3487',
  };

  const { control, handleSubmit } = useForm<AdjustOutlineForm>({
    resolver: zodResolver(adjustOutlineSchema),
    defaultValues: {
      area: String(initialMeasurements.area),
      pitch: String(initialMeasurements.pitch),
      tileSize: String(initialMeasurements.tileSize),
      totalTiles: String(initialMeasurements.totalTiles),
    },
  });

  const handleSave = (data: AdjustOutlineForm) => {
    // navigate(routesConstants.measurementReview, {
    //   measurements: data,
    //   jobType,
    // });
    goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onBackPress={() => goBack()} />

      <CustomKeyboardScrollView style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Adjust measurement
        </AppText>
        <AppText style={styles.subtitle}>
          Drag a corner to reshape the outline or edit a figure directly if the
          trace is off.
        </AppText>

        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            {roofDetails?.roofImage && (
              <Image
                source={getImageUrl(roofDetails.roofImage) as any}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
            <View style={styles.addressPill}>
              <AppText style={styles.addressPillText}>{address}</AppText>
            </View>

            {/* Mocking the polygon corners for UI mockup */}
            <View style={[styles.cornerNode, { top: '20%', left: '30%' }]} />
            <View style={[styles.cornerNode, { top: '30%', right: '20%' }]} />
            <View
              style={[styles.cornerNode, { bottom: '40%', right: '10%' }]}
            />
            <View style={[styles.cornerNode, { bottom: '20%', left: '40%' }]} />
            <View style={[styles.cornerNode, { top: '50%', left: '15%' }]} />
          </View>
        </View>

        <AppText style={styles.sectionTitle}>Measured figures</AppText>

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText style={styles.inputLabel}>Roof area (m²)</AppText>
            <FormInput
              name="area"
              control={control}
              placeholder="e.g., 230"
              keyboardType="numeric"
              style={styles.inputStyle}
            />
          </View>
          <View style={styles.col}>
            <AppText style={styles.inputLabel}>Pitch (°)</AppText>
            <FormInput
              name="pitch"
              control={control}
              placeholder="e.g., 22.4"
              keyboardType="numeric"
              style={styles.inputStyle}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText style={styles.inputLabel}>Tile size</AppText>
            <FormInput
              name="tileSize"
              control={control}
              placeholder="e.g., 4096"
              keyboardType="numeric"
              style={styles.inputStyle}
            />
          </View>
          <View style={styles.col}>
            <AppText style={styles.inputLabel}>Total tiles</AppText>
            <FormInput
              name="totalTiles"
              control={control}
              placeholder="e.g., 3487"
              keyboardType="numeric"
              style={styles.inputStyle}
            />
          </View>
        </View>
      </CustomKeyboardScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title="Save measurement"
          onPress={handleSubmit(handleSave)}
        />
      </View>
    </SafeAreaView>
  );
};

export default AdjustOutline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 20,
    fontFamily: fontFamily.regular,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    backgroundColor: colors.lineSoft,
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#b0c4de',
    position: 'relative',
  },
  addressPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  addressPillText: {
    color: colors.ground,
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
  },
  cornerNode: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ground,
    borderWidth: 2,
    borderColor: colors.accent,
    zIndex: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  messageText: {
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: fontSizes.f17,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  col: {
    flex: 1,
  },
  inputLabel: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    marginBottom: 6,
  },
  inputStyle: {
    height: width * 0.13,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },
});

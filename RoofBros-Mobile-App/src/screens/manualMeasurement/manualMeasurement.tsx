import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateQuoteData } from '../../redux/slices/globalSlice';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import AppModal from '../../components/AppModal';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import { width, spacing } from '../../themes/spacing';
import { Spacer } from '../../components';

const manualMeasurementSchema = z.object({
  area: z.string().min(1, 'Roof area is required'),
  pitch: z.string().min(1, 'Roof pitch is required'),
  tileSize: z.string().min(1, 'Tile size is required'),
  totalTiles: z.string().min(1, 'Total tiles is required'),
});

type ManualMeasurementForm = z.infer<typeof manualMeasurementSchema>;

const ManualMeasurement = () => {
  const route = useRoute<any>();
  const jobType = route.params?.jobType || 'restoration';

  const dispatch = useDispatch();

  const { control, handleSubmit, watch } = useForm<ManualMeasurementForm>({
    resolver: zodResolver(manualMeasurementSchema),
    mode: 'onChange',
    defaultValues: {
      area: '',
      pitch: '',
      tileSize: '',
      totalTiles: '',
    },
  });

  const areaValue = watch('area');
  const pitchValue = watch('pitch');

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showThreeWaysModal, setShowThreeWaysModal] = useState(false);

  const handleNext = (_data: ManualMeasurementForm) => {
    dispatch(
      updateQuoteData({
        area_sq_mt: Number(_data.area) || 0,
        pitch: Number(_data.pitch) || 0,
        tilesize: Number(_data.tileSize) || 0,
        totalTiles: Number(_data.totalTiles) || 0,
      })
    );
    if (jobType === 'restoration') {
      navigate(routesConstants.existingRoof, { jobType, flow: 'newJob' });
    } else {
      navigate(routesConstants.chooseTile, { jobType, flow: 'newJob' });
    }
  };

  const handleClose = () => {
    if (areaValue || pitchValue) {
      setShowDiscardModal(true);
    } else {
      popToTop();
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    popToTop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={handleClose}
        currentStep={3}
        totalSteps={6}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Roof dimensions
        </AppText>
        <AppText style={styles.subtitle}>
          Enter the figures you already have.
        </AppText>

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText style={styles.label}>Total area (m²)</AppText>
            <FormInput
              name="area"
              control={control}
              placeholder="e.g., 120"
              keyboardType="numeric"
              style={{
                height: width * 0.14,
              }}
            />
          </View>
          <View style={styles.col}>
            <AppText style={styles.label}>Pitch (°)</AppText>
            <FormInput
              name="pitch"
              control={control}
              placeholder="e.g., 20"
              keyboardType="numeric"
              style={{
                height: width * 0.14,
              }}
            />
          </View>
        </View>

        {/* <TouchableOpacity style={styles.workOutLinkWrapper}>
          <AppText style={styles.workOutLinkPrefix}>
            Only have width and length?{' '}
          </AppText>
          <AppText
            onPress={() => setShowThreeWaysModal(true)}
            style={styles.workOutLink}
          >
            Work out the area
          </AppText>
        </TouchableOpacity> */}
        <Spacer height={width * 0.06} />

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText style={styles.label}>Tile size</AppText>
            <FormInput
              name="tileSize"
              control={control}
              placeholder="e.g., 4096"
              keyboardType="numeric"
              style={{
                height: width * 0.14,
              }}
            />
          </View>
          <View style={styles.col}>
            <AppText style={styles.label}>Total tiles</AppText>
            <FormInput
              name="totalTiles"
              control={control}
              placeholder="e.g., 3487"
              keyboardType="numeric"
              style={{
                height: width * 0.14,
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer]}>
        <CustomButton
          title={jobType === 'restoration' ? 'Choose coating' : 'Choose tile'}
          onPress={handleSubmit(handleNext)}
        />
      </View>

      {/* Discard Modal */}
      <Modal visible={showDiscardModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Discard this quote?</AppText>
            <AppText style={styles.modalDesc}>
              You've entered measurements that aren't saved yet. Closing now
              discards them.
            </AppText>

            <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
              <AppText style={styles.discardBtnText}>Discard quote</AppText>
            </TouchableOpacity>

            <CustomButton
              title="Keep editing"
              onPress={() => setShowDiscardModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* <AppModal
        visible={showThreeWaysModal}
        onClose={() => setShowThreeWaysModal(false)}
        type="bottom"
        title="Three ways"
        description="The Y-shaped cap that covers the point where three ridge lines meet. Walk the roof and count the junctions; most hip roofs have two."
      >
        <CustomButton
          title="Got it"
          onPress={() => setShowThreeWaysModal(false)}
        />
      </AppModal> */}
    </SafeAreaView>
  );
};

export default ManualMeasurement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  label: {
    fontSize: fontSizes.f17,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  workOutLinkWrapper: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },
  workOutLinkPrefix: {
    fontSize: fontSizes.f14,
    color: colors.muted,
  },
  workOutLink: {
    fontSize: fontSizes.f14,
    color: colors.link,
    fontFamily: fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f17,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  additionalItemsContainer: {
    gap: 0,
  },
  additionalInput: {},
  threeWaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 16,
  },
  threeWaysLabel: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.ground,
    paddingBottom: width * 0.05,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.ground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: fontSizes.f22,
    color: colors.ink,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: fontSizes.f15,
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 22,
  },
  discardBtn: {
    borderWidth: 1,
    borderColor: '#DC2626', // red-600
    borderRadius: 30, // matches CustomButton rounded shape usually
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  discardBtnText: {
    color: '#DC2626',
    fontSize: fontSizes.f16,
    fontWeight: '600',
  },
});

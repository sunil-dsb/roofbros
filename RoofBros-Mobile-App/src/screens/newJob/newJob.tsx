import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { navigate, goBack } from '../../navigations/navigationServices';
import { updateQuoteData, resetQuoteData } from '../../redux/slices/globalSlice';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';
import SprayIcon from '../../assets/icons/sprayIcon';
import GridIcon from '../../assets/icons/gridIcon';

const NewJob = () => {
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const currentJob = useSelector((state: any) => state.global.currentJob);
  const fromQuotesList = route.params?.fromQuotesList || false;

  const [selectedJob, setSelectedJob] = useState<
    'restoration' | 'installation' | null
  >(null);

  const handleNext = (jobType: 'restoration' | 'installation') => {
    setSelectedJob(jobType);
    
    if (fromQuotesList && currentJob) {
      dispatch(resetQuoteData());
      dispatch(updateQuoteData({
        jobType,
        address: currentJob?.address,
        area_sq_mt: currentJob?.measurement?.areaSqmt,
        pitch: currentJob?.measurement?.pitch,
        tilesize: currentJob?.measurement?.tilesize,
        confidence: currentJob?.measurement?.confidence,
        roofImage: currentJob?.roofImage,
        urgent: false,
        existingJobId: currentJob.id,
      }));
      
      if (jobType === 'restoration') {
        navigate(routesConstants.existingRoof);
      } else {
        navigate(routesConstants.chooseTile);
      }
    } else {
      navigate(routesConstants.addressSearch, { jobType });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onClosePress={() => goBack()} // or navigate to root
        currentStep={1}
        totalSteps={6}
        skipDiscardModal
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          New quote
        </AppText>
        <AppText style={styles.subtitle}>What kind of job is this?</AppText>

        <TouchableOpacity
          style={[
            styles.card,
            selectedJob === 'restoration' && styles.cardSelected,
          ]}
          onPress={() => handleNext('restoration')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconPlaceholder}>
            <SprayIcon
              color={
                selectedJob === 'restoration' ? colors.accent : colors.muted
              }
              size={24}
            />
          </View>
          <View style={styles.cardText}>
            <AppText style={styles.cardTitle}>
              Roof Restoration / Replacement
            </AppText>
            <AppText style={styles.cardDesc}>
              Clean, repair and recoat an existing roof
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedJob === 'installation' && styles.cardSelected,
          ]}
          onPress={() => handleNext('installation')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconPlaceholder}>
            <GridIcon
              color={
                selectedJob === 'installation' ? colors.accent : colors.muted
              }
              size={24}
            />
          </View>
          <View style={styles.cardText}>
            <AppText style={styles.cardTitle}>New Roof Installation</AppText>
            <AppText style={styles.cardDesc}>
              New tiles: new builds and full replacements
            </AppText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewJob;

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
    marginBottom: 22,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  cardSelected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
  },
  cardIconPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 16,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f17,
    color: colors.ink,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: fontSizes.f15,
    color: colors.muted,
    lineHeight: 20,
  },
});

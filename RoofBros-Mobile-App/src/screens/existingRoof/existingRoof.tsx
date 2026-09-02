import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateQuoteData } from '../../redux/slices/globalSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  navigate,
  goBack,
  popToTop,
} from '../../navigations/navigationServices';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { routesConstants } from '../../navigations/routeConstants';

import { useLazyGetTilesQuery } from '../../redux/services/authApi';
import { managerApiCall } from '../../helper/manageApiCallFun';

const LOCAL_DESC_MAP: Record<string, string> = {
  terracotta: 'Clay tiles  takes terracotta primer',
  concrete: 'Cement or pressed tiles  takes high-build primer',
  metal: 'Colorbond or similar sheet  takes metal primer',
};

const ExistingRoof = () => {
  const route = useRoute<any>();
  const jobType = route.params?.jobType || 'restoration';
  const flow = route.params?.flow || 'newJob';

  const dispatch = useDispatch();

  const [roofTypes, setRoofTypes] = useState<any[]>([]);
  const [selectedRoofType, setSelectedRoofType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [getTiles] = useLazyGetTilesQuery();

  useEffect(() => {
    setIsLoading(true);
    managerApiCall(
      getTiles,
      {},
      (res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setRoofTypes(list);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
      true,
    );
  }, [getTiles]);

  const handleSelect = (roofTypeId: string) => {
    setSelectedRoofType(roofTypeId);
    dispatch(updateQuoteData({ roofType: roofTypeId }));
    navigate(routesConstants.paintAndColour, {
      jobType,
      flow,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader
        onBackPress={() => goBack()}
        onClosePress={() => popToTop()}
        currentStep={4}
        totalSteps={6}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Existing roof
        </AppText>
        <AppText style={styles.subtitle}>
          What is this roof made of today? It sets the primer. Paint and colour
          come next.
        </AppText>

        <View style={styles.cardsContainer}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            roofTypes.map(type => {
              const isSelected = selectedRoofType === type.id;
              const desc =
                LOCAL_DESC_MAP[type.name.toLowerCase()] ||
                type.description ||
                '';
              return (
                <TouchableOpacity
                  key={type.id}
                  activeOpacity={0.8}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => handleSelect(type.id)}
                >
                  <AppText style={styles.cardTitle}>{type.name}</AppText>
                  {desc ? (
                    <AppText style={styles.cardDesc}>{desc}</AppText>
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <AppText style={styles.note}>
          Pre-set from the aerial scan where it can tell metal from tile; the
          roofer confirms or changes it in one tap.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExistingRoof;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.heading,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.body,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.ground,
    padding: 16,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f18,
    color: colors.ink,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.body,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.body,
    lineHeight: 22,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

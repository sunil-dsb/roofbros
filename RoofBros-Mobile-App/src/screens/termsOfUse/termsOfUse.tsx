import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import FlowHeader from '../../components/FlowHeader';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import { goBack } from '../../navigations/navigationServices';

const TermsOfUse = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onBackPress={goBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <AppText variant="title" style={styles.title}>
            Terms of use
          </AppText>
          <AppText style={styles.updatedDate}>Effective: July 2026</AppText>
        </View>

        <View style={styles.introCard}>
          <AppText style={styles.introText}>
            Welcome to RoofBros. Please read these Terms of Use ("Terms") carefully before using our mobile application, estimating tools, and trade services. By accessing or using RoofBros, you agree to be bound by these Terms.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>1. Account & Eligibility</AppText>
          <AppText style={styles.paragraph}>
            To access RoofBros quoting and ordering services, you must register for an account and provide accurate business and contact details. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>2. Measurements & Quote Estimates</AppText>
          <AppText style={styles.paragraph}>
            RoofBros provides automated roof measurement calculations, tile quantity estimations, and substrate recommendations based on user input and map imagery:
          </AppText>
          <View style={styles.bulletList}>
            <AppText style={styles.bulletItem}>
              • <AppText style={styles.boldText}>Field Verification:</AppText> All automated calculations are intended as professional estimates. Trade contractors remain responsible for verifying physical job site conditions prior to ordering.
            </AppText>
            <AppText style={styles.bulletItem}>
              • <AppText style={styles.boldText}>Custom Adjustments:</AppText> Users can manually override waste margins, tile profiles, and quantities directly within the quote workflow.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>3. Deliveries & Site Drop-Zones</AppText>
          <AppText style={styles.paragraph}>
            When placing a site delivery or yard pickup request:
          </AppText>
          <View style={styles.bulletList}>
            <AppText style={styles.bulletItem}>
              • You must provide clear drop-zone notes, photo references, and notify logistics of any overhead wires, steep driveways, or site hazards.
            </AppText>
            <AppText style={styles.bulletItem}>
              • Delivery times (Morning/Afternoon) are target windows subject to traffic and weather conditions.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>4. Intellectual Property</AppText>
          <AppText style={styles.paragraph}>
            All software code, 3D tile textures, colour visualization features, graphics, trademarks, and design systems in RoofBros are owned by RoofBros and protected under Australian intellectual property laws.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>5. Limitation of Liability</AppText>
          <AppText style={styles.paragraph}>
            RoofBros shall not be liable for indirect, incidental, or consequential damages resulting from site access delays, site inaccuracies, or unverified measurements.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>6. Governing Law & Contact</AppText>
          <AppText style={styles.paragraph}>
            These Terms are governed by the laws of Australia. If you have questions regarding these Terms, contact us:
          </AppText>
          <View style={styles.contactCard}>
            <AppText style={styles.contactText}>Email: help@roofbros.com.au</AppText>
            <AppText style={styles.contactText}>Phone: 1800 766 327</AppText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfUse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: fontSizes.f28,
    color: colors.ink,
    marginBottom: 4,
  },
  updatedDate: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 24,
  },
  introText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.body,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f17,
    color: colors.ink,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.body,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletItem: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.body,
    lineHeight: 22,
  },
  boldText: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginTop: 8,
    gap: 4,
  },
  contactText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f15,
    color: colors.ink,
  },
});

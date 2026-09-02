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

const PrivacyPolicy = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <FlowHeader onBackPress={goBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <AppText variant="title" style={styles.title}>
            Privacy policy
          </AppText>
          <AppText style={styles.updatedDate}>Last updated: July 2026</AppText>
        </View>

        <View style={styles.introCard}>
          <AppText style={styles.introText}>
            RoofBros ("we", "our", or "us") is committed to protecting the privacy and security of trade professionals, roofers, and customers who use our mobile application and services. This Privacy Policy explains how we collect, use, and protect your information.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>1. Information We Collect</AppText>
          <AppText style={styles.paragraph}>
            We collect information you provide directly to us when creating an account, building quotes, or placing delivery requests:
          </AppText>
          <View style={styles.bulletList}>
            <AppText style={styles.bulletItem}>
              • <AppText style={styles.boldText}>Account Information:</AppText> Name, email address, phone number, and business details.
            </AppText>
            <AppText style={styles.bulletItem}>
              • <AppText style={styles.boldText}>Job & Measurement Data:</AppText> Job site addresses, roof dimensions, pitch angles, selected tile profiles, colours, photos, and drop-zone notes.
            </AppText>
            <AppText style={styles.bulletItem}>
              • <AppText style={styles.boldText}>Delivery & Contact Information:</AppText> Preferred delivery dates, time windows, and site access instructions.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>2. How We Use Your Information</AppText>
          <AppText style={styles.paragraph}>
            Your data is strictly utilized to provide and enhance RoofBros services:
          </AppText>
          <View style={styles.bulletList}>
            <AppText style={styles.bulletItem}>
              • Calculating accurate roof tile quantities, substrate requirements, and quote estimates.
            </AppText>
            <AppText style={styles.bulletItem}>
              • Processing and fulfilling yard pickup and site delivery requests with logistics teams.
            </AppText>
            <AppText style={styles.bulletItem}>
              • Communicating account notifications, order updates, and support responses.
            </AppText>
            <AppText style={styles.bulletItem}>
              • Improving app functionality, tile texture visualization tools, and measurement algorithms.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>3. Data Storage & Security</AppText>
          <AppText style={styles.paragraph}>
            We implement industry-standard administrative, physical, and technical safeguards to protect your personal and trade data against unauthorized access, loss, or alteration. All data transmissions are encrypted using secure protocols.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>4. Information Sharing</AppText>
          <AppText style={styles.paragraph}>
            We do not sell, rent, or trade your personal data. We only share necessary job details (such as delivery address, drop-zone notes, and tile quantities) with trusted logistics drivers and yard staff solely to complete your requested deliveries.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>5. Your Rights & Data Retention</AppText>
          <AppText style={styles.paragraph}>
            You have the right to access, update, or delete your account data at any time through the Profile section in the app. Upon account deletion, all active quotes, job measurements, and photos are permanently purged from our servers.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>6. Contact Us</AppText>
          <AppText style={styles.paragraph}>
            If you have any questions or concerns about this Privacy Policy, please contact our support team:
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

export default PrivacyPolicy;

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

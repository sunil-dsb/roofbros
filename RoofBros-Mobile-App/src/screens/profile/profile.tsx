import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';
import ChevronRightIcon from '../../assets/icons/chevronRightIcon';
import { navigate } from '../../navigations/navigationServices';
import { routesConstants } from '../../navigations/routeConstants';
import AppModal from '../../components/AppModal';
import CustomButton from '../../components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  performLocalLogout,
  setLoaderOn,
  setLoaderOff,
} from '../../helper/commonFunctions';
import { useLazyGetProfileQuery } from '../../redux/services/authApi';
import { setUserData } from '../../redux/slices/persistedSlice';
import { managerApiCall } from '../../helper/manageApiCallFun';

const { width } = Dimensions.get('window');

const Profile = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [getProfile] = useLazyGetProfileQuery();
  const { userData } = useSelector((state: any) => state.persist);

  const currentUser = userData;
  const name = currentUser?.name || currentUser?.fullName || '';
  const businessName =
    currentUser?.businessName ||
    currentUser?.businessDetails?.businessName ||
    '';
  const email = currentUser?.email || '';
  const profileImage = currentUser?.image;
  const isGoogleUser = currentUser?.authProvider?.toLowerCase() === 'google';

  useEffect(() => {
    managerApiCall(
      getProfile,
      {},
      (res: any) => {
        const fetchedProfile = res?.data?.user || res?.data || res?.user || res;
        if (fetchedProfile && typeof fetchedProfile === 'object') {
          dispatch(setUserData({ ...userData, ...fetchedProfile }));
        }
      },
      () => {},
    );
  }, []);

  console.log('currentUser', currentUser);

  const getInitials = (userName?: string) => {
    if (!userName || typeof userName !== 'string' || !userName.trim()) {
      return 'RB';
    }
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.trim().slice(0, 2).toUpperCase();
  };

  const handleEmail = async () => {
    const url = 'mailto:help@roofbros.com.au';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email App Not Found',
          'No mail application is configured on this emulator/device.\n\nEmail: help@roofbros.com.au',
        );
      }
    } catch {
      Alert.alert(
        'Unable to Open Email',
        'Could not launch email app.\n\nEmail: help@roofbros.com.au',
      );
    }
  };

  const handleCall = async () => {
    const url = 'tel:1800766327';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Phone App Not Found',
          'No phone dialer application is available on this emulator/device.\n\nPhone: 1800 766 327',
        );
      }
    } catch {
      Alert.alert(
        'Unable to Make Call',
        'Could not launch phone dialer.\n\nPhone: 1800 766 327',
      );
    }
  };

  const handleBusinessDetails = () => {
    navigate(routesConstants.accountBusinessDetails);
  };

  const handleChangePassword = () => {
    navigate(routesConstants.changePassword);
  };

  const handlePrivacyPolicy = () => {
    navigate(routesConstants.privacyPolicy);
  };

  const handleTermsOfUse = () => {
    navigate(routesConstants.termsOfUse);
  };

  const handleSignOut = async () => {
    setIsSignOutModalVisible(false);
    setLoaderOn();
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
    setLoaderOff();
    performLocalLogout();
  };

  const handleDeleteAccount = () => {
    navigate(routesConstants.deleteAccount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content]}>
        <AppText variant="title" style={styles.title}>
          Profile
        </AppText>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>{getInitials(name)}</AppText>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <AppText style={styles.nameText}>{name}</AppText>
            {!!businessName && (
              <AppText style={styles.subText}>{businessName}</AppText>
            )}
            {!!email && <AppText style={styles.subText}>{email}</AppText>}
          </View>
        </View>

        <AppText style={styles.sectionHeader}>ACCOUNT</AppText>
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={[styles.listItem, isGoogleUser && styles.lastItem]}
            onPress={handleBusinessDetails}
          >
            <AppText style={styles.listItemLabel}>Business details</AppText>
            <ChevronRightIcon color={colors.muted} size={20} />
          </TouchableOpacity>
          {!isGoogleUser && (
            <TouchableOpacity
              style={[styles.listItem, styles.lastItem]}
              onPress={handleChangePassword}
            >
              <AppText style={styles.listItemLabel}>Change password</AppText>
              <ChevronRightIcon color={colors.muted} size={20} />
            </TouchableOpacity>
          )}
        </View>

        <AppText style={styles.sectionHeader}>SUPPORT</AppText>
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <AppText style={styles.listItemLabel}>Email us</AppText>
            <AppText style={styles.listItemValue}>help@roofbros.com.au</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listItem, styles.lastItem]}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <AppText style={styles.listItemLabel}>Call us</AppText>
            <AppText style={styles.listItemValue}>1800 766 327</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.sectionHeader}>ABOUT</AppText>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <AppText style={styles.listItemLabel}>Version</AppText>
            <AppText style={styles.listItemValue}>1.0.0</AppText>
          </View>
          <TouchableOpacity
            style={styles.listItem}
            onPress={handlePrivacyPolicy}
          >
            <AppText style={styles.listItemLabel}>Privacy policy</AppText>
            <ChevronRightIcon color={colors.muted} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listItem, styles.lastItem]}
            onPress={handleTermsOfUse}
          >
            <AppText style={styles.listItemLabel}>Terms of use</AppText>
            <ChevronRightIcon color={colors.muted} size={20} />
          </TouchableOpacity>
        </View>

        <View style={[styles.listContainer, styles.signOutContainer]}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setIsSignOutModalVisible(true)}
          >
            <AppText style={styles.signOutText}>Sign out</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listItem, styles.lastItem]}
            onPress={handleDeleteAccount}
          >
            <AppText style={styles.signOutText}>Delete account</AppText>
            <ChevronRightIcon color={colors.muted} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppModal
        visible={isSignOutModalVisible}
        onClose={() => setIsSignOutModalVisible(false)}
        title="Sign out?"
        description="You'll need to sign back in to see your jobs and quotes. Nothing is deleted."
      >
        <View style={styles.modalActions}>
          <CustomButton
            variant="dangerOutline"
            title="Sign out"
            onPress={handleSignOut}
            style={styles.modalButton}
          />
          <CustomButton
            variant="primary"
            title="Cancel"
            onPress={() => setIsSignOutModalVisible(false)}
            style={styles.modalButton}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  );
};

export default Profile;

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
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 25,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 32,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    backgroundColor: colors.accentTint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent, // darker red border
    overflow: 'hidden',
  },
  avatarText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f24,
    color: colors.accent,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f22,
    color: colors.ink,
    marginBottom: 4,
  },
  subText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    marginBottom: 2,
  },
  sectionHeader: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 28,
    marginLeft: 2,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  listItemLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f17,
    color: colors.ink,
  },
  listItemValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f16,
    color: colors.muted,
  },
  signOutContainer: {
    marginTop: 8,
  },
  signOutText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.f16,
    color: colors.error,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    width: '100%',
  },
});

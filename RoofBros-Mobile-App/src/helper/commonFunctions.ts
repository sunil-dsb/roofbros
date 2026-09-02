import { Alert, Linking, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { ShowAlertMessage, popTypes } from './showAlertMessage';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const triggerHaptic = (type: string = 'selection') => {
  try {
    ReactNativeHapticFeedback.trigger(type as any, hapticOptions);
  } catch (error) {
    console.log('Haptic feedback error:', error);
  }
};
import {
  loadingOff,
  loadingOn,
} from '../redux/slices/globalSlice';
import { reset } from '../navigations/navigationServices';
import { routesConstants } from '../navigations/routeConstants';
import {
  setToken,
  resetPersistStore,
} from '../redux/slices/persistedSlice';

import store from '../redux/store/store';
import { authApi } from '../redux/services/authApi';
import { managerApiCall } from './manageApiCallFun';
import { IMAGE_URL } from '../redux/services/rtkquery';

const dispatch = (action: any) => {
  store.dispatch(action);
};

export const setLoaderOn = () => dispatch(loadingOn());

export const setLoaderOff = () => dispatch(loadingOff());

export const handleLogout = () => {
  // managerApiCall(
  //   (payload: any) => store.dispatch(authApi.endpoints.logout.initiate(payload)),
  //   {},
  //   res => {
  //     console.log('logout successfully', res);
  //     ShowAlertMessage(res?.message, popTypes.info);
  //     performLocalLogout();
  //   },
  //   err => {
  //     console.log('logout error', err);
  //   },
  // );
      performLocalLogout();

};

export const getImageUrl = (url?:string) => {
  if(!url) return undefined;
  return {
    uri:IMAGE_URL + url,
  };
};


export const performLocalLogout = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (e) {}
  store.dispatch(resetPersistStore());

  reset(routesConstants.login);
};

export const permissionCameraAlert = (message?: string) => {
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };
  Alert.alert(
    'Permission Required',
    message || 'This app needs access to your camera and photo library.',
    [
      {
        text: 'Open Settings',
        style: 'cancel',
        onPress: () => {
          openAppSettings();
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => { },
      },
    ],
  );
};

let cameraPermission: any;
let photoPermission: any;

if (Platform.OS === 'ios') {
  cameraPermission = PERMISSIONS.IOS.CAMERA;
  photoPermission = PERMISSIONS.IOS.PHOTO_LIBRARY;
} else {
  cameraPermission = PERMISSIONS.ANDROID.CAMERA;
  photoPermission =
    Number(Platform.Version) >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
}

let cameraPermissionSuccess = false;
let photoPermissionSuccess = false;

const checkCameraPermission = async () => {
  console.log('checkCameraPermission');
  try {
    const cameraResult = await check(cameraPermission);
    if (cameraResult === RESULTS.UNAVAILABLE) {
      console.log('Camera feature is not available on this device.');
    } else if (
      cameraResult === RESULTS.DENIED ||
      cameraResult == RESULTS.BLOCKED
    ) {
      const cameraRequestResult = await request(cameraPermission);
      if (cameraRequestResult === RESULTS.GRANTED) {
        console.log('Camera permission granted.');
        cameraPermissionSuccess = true;
      } else if (cameraRequestResult === RESULTS.BLOCKED) {
        permissionCameraAlert(
          'Camera permission has been blocked. Please manually give permission.',
        );
        cameraPermissionSuccess = false;
      }
    } else if (cameraResult === RESULTS.GRANTED) {
      console.log('Camera permission already granted.');
      cameraPermissionSuccess = true;
    }
    return cameraPermissionSuccess;
  } catch (err) {
    console.log('in camera permision error:', err);
  }
};

const checkPhotoLibraryPermission = async () => {
  console.log('hello in check photo library permission:::');
  try {
    if (Number(Platform.Version) > 33) {
      return true;
    }

    const photoResult = await check(photoPermission);
    if (photoResult === RESULTS.UNAVAILABLE) {
      console.log('RESULTS.UNAVAILABLE in check photo library permission:::');
      console.log('Photo library feature is not available on this device.');
    } else if (
      photoResult === RESULTS.DENIED ||
      photoResult == RESULTS.BLOCKED
    ) {
      const photoRequestResult = await request(photoPermission);
      if (
        photoRequestResult === RESULTS.GRANTED ||
        photoRequestResult === RESULTS.LIMITED
      ) {
        console.log('Photo library permission granted.');
        photoPermissionSuccess = true;
      } else if (photoRequestResult === RESULTS.BLOCKED) {
        permissionCameraAlert(
          'Photo library permission has been blocked. Please manually give permission.',
        );
        console.log('hello in block');
        photoPermissionSuccess = false;
      }
    } else if (
      photoResult === RESULTS.GRANTED ||
      photoResult === RESULTS.LIMITED
    ) {
      console.log('Photo library permission already granted.');
      photoPermissionSuccess = true;
    }
    console.log(photoResult, RESULTS.LIMITED, 'photoResult');
    return photoPermissionSuccess;
  } catch (err) {
    console.log('error in photo library permission:', err);
  }
};

export {
  checkCameraPermission,
  checkPhotoLibraryPermission,
};

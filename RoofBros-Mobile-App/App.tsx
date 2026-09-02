import 'react-native-gesture-handler';

import { LogBox, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Loader from './src/components/loader';
import { MainStack } from './src/navigations/stack';
import UseInternetConnectivity from './src/Hooks/InternetHooks';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { colors } from './src/themes/colors';
import { toastConfig } from './src/helper/toastConfig';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { width } from './src/themes/spacing';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from './src/redux/slices/persistedSlice';

const App = () => {
  LogBox.ignoreAllLogs();

  const dispatch = useDispatch();

  useEffect(() => {
    BootSplash.hide({ fade: true });

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '777843248690-fe9jhgcifvdrchmvam8gdeks52k36b7a.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // if (Platform.OS === "ios") {
    //   KeyboardManager.setEnable(true);
    //   KeyboardManager.setShouldResignOnTouchOutside(true);
    //   KeyboardManager.setKeyboardDistanceFromTextField(-40);
    //   KeyboardManager.setEnableAutoToolbar(false);
    // }

    // Clear storage for testing
    // AsyncStorage.clear();
  }, []);

  const { userData } = useSelector((state: any) => state?.persist || {});
  console.log('userData', userData);
  const topInsets = useSafeAreaInsets();
  UseInternetConnectivity();
  const insets = useSafeAreaInsets();
  return (
    <>
      <GestureHandlerRootView
        style={{
          flex: 1,
          backgroundColor: colors.ground,
        }}
      >
      <KeyboardProvider>
        <StatusBar
          barStyle={'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        {/* <SocketConnection /> */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.ground,
          }}
        >
          <MainStack />
          <Loader />
        </View>
      </KeyboardProvider>
    </GestureHandlerRootView>
    <Toast config={toastConfig} topOffset={topInsets.top} visibilityTime={2000} />
  </>
);
};

export default App;

const styles = StyleSheet.create({});

import BottomTab from './bottomTab';

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { navigationRef } from './navigationServices';
import { routesConstants } from './routeConstants';
import { useSelector } from 'react-redux';
import {
  Login,
  SignUp,
  VerifyOtp,
  ForgotPassword,
  Welcome,
  WelcomeFirstRun,
  JobDetail,
  QuotesList,
  PhotosList,
  NotesList,
  DeliveryRequest,
  DeliverySuccess,
  DeliveryDetail,
  TileDetails,
  BusinessDetails,
  AccountBusinessDetails,
  DeleteAccount,
  MeasurementDetail,
  TryOnRoof,
  CompareColours,
  PaintAndColour,
  NewJob,
  AddressSearch,
  Measuring,
  MeasurementReview,
  AdjustOutline,
  Colours,
  QuoteDetails,
  QuoteSaved,
  ManualMeasurement,
  ChooseTile,
  ExistingRoof,
  ChangePassword,
  PrivacyPolicy,
  TermsOfUse,
} from '../screens';

const Stack = createNativeStackNavigator();
const commonScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  orientation: 'portrait',
  animation: 'slide_from_right',
};

export const MainStack = () => {
  const { token, userData } = useSelector((state: any) => state?.persist);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={
          token
            ? userData?.isBusiness === false
              ? routesConstants.businessDetails
              : routesConstants.bottomTab
            : routesConstants.welcome
        }
        screenOptions={commonScreenOptions}
      >
        <Stack.Screen name={routesConstants.welcome} component={Welcome} />
        <Stack.Screen name={routesConstants.login} component={Login} />
        <Stack.Screen name={routesConstants.signUp} component={SignUp} />
        <Stack.Screen name={routesConstants.verifyOtp} component={VerifyOtp} />
        <Stack.Screen
          name={routesConstants.forgotPassword}
          component={ForgotPassword}
        />
        <Stack.Screen
          name={routesConstants.welcomeFirstRun}
          component={WelcomeFirstRun}
        />

        <Stack.Screen name={routesConstants.bottomTab} component={BottomTab} />

        {/* New Job Flow */}
        <Stack.Screen name={routesConstants.newJob} component={NewJob} />
        <Stack.Screen
          name={routesConstants.addressSearch}
          component={AddressSearch}
        />
        <Stack.Screen name={routesConstants.measuring} component={Measuring} />
        <Stack.Screen
          name={routesConstants.measurementReview}
          component={MeasurementReview}
        />
        <Stack.Screen
          name={routesConstants.adjustOutline}
          component={AdjustOutline}
        />
        <Stack.Screen name={routesConstants.colours} component={Colours} />
        <Stack.Screen
          name={routesConstants.quoteDetails}
          component={QuoteDetails}
        />
        <Stack.Screen
          name={routesConstants.quoteSaved}
          component={QuoteSaved}
        />
        <Stack.Screen
          name={routesConstants.manualMeasurement}
          component={ManualMeasurement}
        />
        <Stack.Screen
          name={routesConstants.chooseTile}
          component={ChooseTile}
        />

        {/* Job Detail Flow */}
        <Stack.Screen name={routesConstants.jobDetail} component={JobDetail} />
        <Stack.Screen
          name={routesConstants.tileDetails}
          component={TileDetails}
        />
        <Stack.Screen name={routesConstants.tryOnRoof} component={TryOnRoof} />
        <Stack.Screen
          name={routesConstants.compareColours}
          component={CompareColours}
        />
        <Stack.Screen
          name={routesConstants.existingRoof}
          component={ExistingRoof}
        />
        <Stack.Screen
          name={routesConstants.paintAndColour}
          component={PaintAndColour}
        />
        <Stack.Screen
          name={routesConstants.businessDetails}
          component={BusinessDetails}
        />
        <Stack.Screen
          name={routesConstants.deleteAccount}
          component={DeleteAccount}
        />
        <Stack.Screen
          name={routesConstants.measurementDetail}
          component={MeasurementDetail}
        />
        <Stack.Screen
          name={routesConstants.quotesList}
          component={QuotesList}
        />
        <Stack.Screen
          name={routesConstants.photosList}
          component={PhotosList}
        />
        <Stack.Screen name={routesConstants.notesList} component={NotesList} />

        {/* Delivery Flow */}
        <Stack.Screen
          name={routesConstants.deliveryRequest}
          component={DeliveryRequest}
        />
        <Stack.Screen
          name={routesConstants.deliverySuccess}
          component={DeliverySuccess}
        />
        <Stack.Screen
          name={routesConstants.deliveryDetail}
          component={DeliveryDetail}
        />
        <Stack.Screen
          name={routesConstants.accountBusinessDetails}
          component={AccountBusinessDetails}
        />
        <Stack.Screen
          name={routesConstants.changePassword}
          component={ChangePassword}
        />
        <Stack.Screen
          name={routesConstants.privacyPolicy}
          component={PrivacyPolicy}
        />
        <Stack.Screen
          name={routesConstants.termsOfUse}
          component={TermsOfUse}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

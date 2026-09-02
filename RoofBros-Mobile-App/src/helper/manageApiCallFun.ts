import {ShowAlertMessage, popTypes} from './showAlertMessage';

import {DataManager} from './dataManager';
import NetInfo from '@react-native-community/netinfo';

import {setLoaderOff, setLoaderOn, performLocalLogout} from './commonFunctions';
import { ValidationConstants } from '../utils/constants';

export const managerApiCall = async (
  initialCall: (payload: any) => Promise<any>,
  payload: any,
  onSuccess: (data: any) => void,
  onFail: (errorMsg?: string) => void = () => {},
  apiType?: any,
) => {
  const isConnected = await NetInfo?.fetch();
  if (isConnected) {
    try {
      if (!apiType) {
        setLoaderOn();
      }
      console.log('Api payload:', payload);

      const response = await initialCall(payload || '');

      console.log('Api Response comming:', response);
      if (response?.data && response?.data?.success !== false) {
        onSuccess(response.data);

      } else if (response?.error || response?.data?.success === false) {
        const errorMsg =
          response?.error?.data?.message ||
          response?.data?.message ||
          'Something went wrong!';
        onFail && onFail(errorMsg);

        if (response?.error?.status === 401) {
          // Session expired  clear data, reset redux store, and go back to login
          ShowAlertMessage(errorMsg, popTypes.error);
          // performLocalLogout();
        } else if (response?.error?.status === 'FETCH_ERROR') {
          console.log('Error occurred:', response);
          ShowAlertMessage(response.error.error, popTypes.error);
        } else {
          ShowAlertMessage(errorMsg, popTypes.error);
        }
      }
    } catch (err) {
      console.error('Error occurred:', err);
      ShowAlertMessage('Something went wrong!', popTypes.error);
    } finally {
      if (!apiType) {
        setLoaderOff();
      }
    }
  } else {
    ShowAlertMessage(ValidationConstants.noInternet, popTypes.error);
  }
};

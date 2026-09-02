import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataManagersKeys } from './dataManagersKeys';

export const DataManager = {
  async setAccessToken(token: string): Promise<void> {
    return await AsyncStorage.setItem(DataManagersKeys.access_token, token);
  },
  async getAccessToken(): Promise<string | null> {
    const token = await AsyncStorage.getItem(DataManagersKeys.access_token);
    return token;
  },
  async clearDataManager(): Promise<void> {
    await AsyncStorage.clear();
  },
};

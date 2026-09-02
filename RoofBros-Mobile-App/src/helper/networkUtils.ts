import NetInfo from '@react-native-community/netinfo';

const networkUtils = async (): Promise<boolean | null> => {
  const response = await NetInfo.fetch();
  return response.isConnected;
};

export default networkUtils;

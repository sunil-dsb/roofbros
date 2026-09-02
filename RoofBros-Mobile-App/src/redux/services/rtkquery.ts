import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Config from 'react-native-config';



// export const BASE_URL = 'http://192.168.0.153:9000/api/v1/'; //Local
export const BASE_URL = 'https://roof-bros-backend-production.up.railway.app/api/v1/'; //Local

// export const BASE_URL_NO_V1 = 'http://192.168.0.153:9000/api/'; //Local (no v1 - for social login)
export const BASE_URL_NO_V1 = 'https://roof-bros-backend-production.up.railway.app/api/'; //Production (no v1)
export const IMAGE_URL = 'https://pub-5f7c1aebbfac4467b5f210cd0df99dcd.r2.dev'; //Local

export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY as string;
export const emptySplitApi = createApi({  
  reducerPath: 'api',
  // tagTypes: ['Job'],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    timeout: 60000,
    prepareHeaders: async (headers, { getState }) => {
      const state: any = getState();
      const access_token = state?.persist?.token;

      if (access_token) {
        headers.set('Authorization', `Bearer ${access_token}`);
      }
      headers.set(
        'Origin', 'roofbros://'
      )
      console.log('access_token', access_token);
      return headers;
    },
  }),
  endpoints: builder => ({}),
});

export const header1 = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const header2 = {
  'Content-Type': 'multipart/form-data',
  Accept: 'application/json',
};

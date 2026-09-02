import {createSlice} from '@reduxjs/toolkit';

const initialState: {
  token: string | null | undefined;
  deviceToken: string | null | undefined;
  userData: any | null | undefined;
} = {
  token: null,
  deviceToken: null,
  userData: null,
};

const persistedSlice = createSlice({
  name: 'persist',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setDeviceToken: (state, action) => {
      state.deviceToken = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    resetPersistStore: () => initialState,
  },
});

export const {
  setToken,
  resetPersistStore,
  setDeviceToken,
  setUserData,
} = persistedSlice.actions;

export default persistedSlice.reducer;

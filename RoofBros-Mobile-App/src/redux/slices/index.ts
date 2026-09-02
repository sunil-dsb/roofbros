import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../services/authApi';
import {combineReducers} from '@reduxjs/toolkit';
import globalReducer from './globalSlice';
import {persistReducer} from 'redux-persist'; // Correct import
import persistedReducer from './persistedSlice';
// Persist configuration
const persistConfig = {
  key: 'persist',
  storage: AsyncStorage, // Use AsyncStorage for persistence
};

// Create a persisted reducer
const persistValueReducer = persistReducer(persistConfig, persistedReducer);

// Combine all reducers
export const rootReducer = combineReducers({
  persist: persistValueReducer,
  global: globalReducer,
  [authApi.reducerPath]: authApi.reducer,
});

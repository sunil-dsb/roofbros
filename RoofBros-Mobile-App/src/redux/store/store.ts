import {authApi} from '../services/authApi';
import {configureStore} from '@reduxjs/toolkit';
import {persistStore} from 'redux-persist';
import {rootReducer} from '../slices';

const store = configureStore({
  reducer: rootReducer, // Use the rootReducer that includes the persisted reducer
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}).concat(authApi.middleware), // Add middleware for Api
});

export const persistor = persistStore(store); // Initialize persistor

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

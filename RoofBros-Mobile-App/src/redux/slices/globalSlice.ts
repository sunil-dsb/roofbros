import {createSlice} from '@reduxjs/toolkit';

const initialState: {
  isLoading: boolean;
  activeTab: any;
  unreadCount: number;
  inAppProducts: any[];
  profileCount: number;
  purchasedItems: any;
  rentalPurchaseContext: {
    videoId: any;
    rentalPrice: any;
    isRental: boolean;
    seriesId: any;
  };
  subscriptionChangeStatus: boolean;
  quoteData: any;
  currentJob: any;
} = {
  isLoading: false,
  activeTab: null,
  unreadCount: 0,
  inAppProducts: [],
  profileCount: 0,
  purchasedItems: {},
  rentalPurchaseContext: {
    videoId: null,
    rentalPrice: null,
    isRental: false,
    seriesId: null,
  },
  subscriptionChangeStatus: false,
  quoteData: {},
  currentJob: null,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    loadingOn: state => {
      state.isLoading = true;
    },
    loadingOff: state => {
      state.isLoading = false;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setInAppProducts: (state, action) => {
      state.inAppProducts = action.payload;
    },
    setProfileCount: (state, action) => {
      state.profileCount = action.payload;
    },
    setPurchasedItems: (state, action) => {
      state.purchasedItems = action.payload;
    },
    setRentalPurchaseContext: (state, action) => {
      state.rentalPurchaseContext = action.payload;
    },
    setSubscriptionChangeStatus: (state, action) => {
      state.subscriptionChangeStatus = action.payload;
    },
    updateQuoteData: (state, action) => {
      state.quoteData = {
        ...state.quoteData,
        ...action.payload,
      };
    },
    resetQuoteData: (state) => {
      state.quoteData = {};
    },
    setCurrentJob: (state, action) => {
      state.currentJob = action.payload;
    },
  },
});

export const {
  loadingOn,
  loadingOff,
  setActiveTab,
  resetUnreadCount,
  setInAppProducts,
  setProfileCount,
  setPurchasedItems,
  setRentalPurchaseContext,
  setSubscriptionChangeStatus,
  updateQuoteData,
  resetQuoteData,
  setCurrentJob,
} = globalSlice.actions;

export default globalSlice.reducer;

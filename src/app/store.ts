import { wrapStore } from '@eduardoac-skimlinks/webext-redux';
import {
  combineReducers,
  configureStore,
  createSlice,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit';
import { localStorage } from 'redux-persist-webextension-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist';
import type { WebStorage } from 'reduxjs-toolkit-persist/lib/types';

const persistConfig = {
  key: 'root',
  storage: localStorage as WebStorage,
};

// currentTabId の slice を作成
const currentTabIdSlice = createSlice({
  name: 'currentTabId',
  initialState: null as number | null,
  reducers: {
    setCurrentTabId: (state, action) => action.payload,
  },
});

const reducers = combineReducers({
  dummy: (state = {}) => state,
  currentTabId: currentTabIdSlice.reducer, // currentTabId reducer を追加
});

const persistedReducer = persistReducer(persistConfig, reducers);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const initializeWrappedStore = () => wrapStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// currentTabId の action creator をエクスポート
export const { setCurrentTabId } = currentTabIdSlice.actions;

export default store;

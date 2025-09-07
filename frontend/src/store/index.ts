import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import reducers - make sure they're properly imported
import authReducer from "./auth/authSlice";
import chatReducer from "./chat/chatSlice";

// Import the injectStore function to avoid circular dependency
import { injectStore } from "@/services/api/apiClient";
import { injectAuthStore } from "@/services/api/auth";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Redux Persist actions and chat-related actions
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "chat/fetchMessages/fulfilled",
          "chat/sendMessage/fulfilled",
        ],
        // Ignore paths that might contain non-serializable values
        ignoredPaths: ["chat.messages"],
      },
    }),
});

injectStore(store);
injectAuthStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

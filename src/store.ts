import { configureStore } from "@reduxjs/toolkit";
import { othelloReducer } from "./features/othello/othelloSlice";

export const store = configureStore({
  reducer: {
    othelloReducer: othelloReducer,
  },
});

// RootのStateの型
export type RootAppState = ReturnType<typeof store.getState>;

// Dispatch関数の型
export type AppDispatch = typeof store.dispatch;

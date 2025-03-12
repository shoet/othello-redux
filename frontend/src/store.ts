import { configureStore } from "@reduxjs/toolkit";
import { othelloReducer } from "./features/othello/othelloSlice";
import { webSocketReducer } from "./features/websocket/webSocketSlice";

export const store = configureStore({
  reducer: {
    othelloReducer: othelloReducer,
    webSocketReducer: webSocketReducer,
  },
});

// RootのStateの型
export type RootAppState = ReturnType<typeof store.getState>;

// Dispatch関数の型
export type AppDispatch = typeof store.dispatch;

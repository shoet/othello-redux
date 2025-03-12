import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WebSocketState = {
  clientID?: string;
  currentRoomID?: string;
};

const initialState: WebSocketState = {};

export const webSocketSlice = createSlice({
  name: "webSocket",
  initialState,
  reducers: {
    updateProfileAction: (
      state: WebSocketState,
      action: PayloadAction<{ clientID?: string; roomID?: string }>
    ) => {
      if (action.payload.clientID) {
        state.clientID = action.payload.clientID;
      }
      if (action.payload.roomID) {
        state.currentRoomID = action.payload.roomID;
      }
      return state;
    },
  },
});

export const { updateProfileAction } = webSocketSlice.actions;
export const webSocketReducer = webSocketSlice.reducer;

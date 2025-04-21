"use client";

import { useImmerReducer } from "use-immer";

export type WebSocketState = {
  clientID?: string;
  roomID?: string;
};

export const initState: WebSocketState = {};

type WebSocketActionType = {
  type: "UpdateProfile";
  payload: { clientID?: string; roomID?: string };
};

export const reducer = (state: WebSocketState, action: WebSocketActionType) => {
  const { type, payload } = action;
  switch (type) {
    case "UpdateProfile":
      if (payload.clientID) {
        state.clientID = payload.clientID;
      }
      if (payload.roomID) {
        state.roomID = payload.roomID;
      }
      return;
    default:
      return state;
  }
};

export const useWebSocketReducer = () => useImmerReducer(reducer, initState);

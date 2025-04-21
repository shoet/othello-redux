"use client";

import React, { PropsWithChildren, useContext } from "react";
import {
  OthelloState,
  useOthelloReducer,
  initState as initOthelloState,
} from "../../_reducer/othello";
import {
  useWebSocketReducer,
  WebSocketState,
  initState as initWebSocketState,
} from "../../_reducer/webSocket";
import { Board, Player } from "@/features/othello";

type OthelloContextType = {
  websocketState: WebSocketState;
  othelloState: OthelloState;
  updateProfile: ({
    clientID,
    roomID,
  }: {
    clientID?: string;
    roomID?: string;
  }) => void;
  startGame: (props: {
    board: Board;
    boardID: string;
    players: Player[];
    currentTurnIndex: number;
  }) => void;
  updateBoard: (props: {
    board: Board;
    isEndGame: boolean;
    currentTurnIndex: number;
  }) => void;
};

const OthelloContext = React.createContext<OthelloContextType>({
  websocketState: initWebSocketState,
  othelloState: initOthelloState,
  updateProfile: () => {},
  startGame: () => {},
  updateBoard: () => {},
});
export const useOthelloContext = () => useContext(OthelloContext);

export const OthelloContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [websocketState, webSocketDispatch] = useWebSocketReducer();
  const [othelloState, othelloDispatch] = useOthelloReducer();

  const updateProfile = ({
    clientID,
    roomID,
  }: {
    clientID?: string;
    roomID?: string;
  }) => {
    if (clientID) {
      webSocketDispatch({
        type: "UpdateProfile",
        payload: { clientID },
      });
    }
    if (roomID) {
      webSocketDispatch({
        type: "UpdateProfile",
        payload: { roomID },
      });
    }
  };

  const startGame = (props: {
    board: Board;
    boardID: string;
    players: Player[];
    currentTurnIndex: number;
  }) => {
    othelloDispatch({
      type: "StartGame",
      payload: {
        ...props,
      },
    });
  };

  const updateBoard = (props: {
    board: Board;
    isEndGame: boolean;
    currentTurnIndex: number;
  }) => {
    othelloDispatch({
      type: "UpdateBoard",
      payload: {
        ...props,
      },
    });
  };

  return (
    <OthelloContext.Provider
      value={{
        websocketState: websocketState,
        othelloState: othelloState,
        updateProfile,
        startGame,
        updateBoard,
      }}
    >
      {children}
    </OthelloContext.Provider>
  );
};

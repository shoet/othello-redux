"use client";

import {
  Board,
  CellColor,
  CellPosition,
  getEmptyBoard,
  Player,
  putCell,
  Result,
} from "@/features/othello";
import { useImmerReducer } from "use-immer";

export type OthelloGameStatus = "prepare" | "playing" | "end";

export type OthelloState = {
  status: OthelloGameStatus;
  roomID?: string;
  board: Board;
  boardID?: string;
  currentPlayerIndex: number;
  players?: Player[];
  result?: Result;
  isTurnPutted: boolean;
};

export const DEFAULT_BOARD_SIZE = 8;

export const initState: OthelloState = {
  status: "prepare",
  board: getEmptyBoard(DEFAULT_BOARD_SIZE),
  players: [],
  currentPlayerIndex: 0,
  isTurnPutted: false,
};

type OthelloActionType =
  | {
      type: "StartGame";
      payload: {
        board: Board;
        boardID: string;
        players: Player[];
        currentTurnIndex: number;
      };
    }
  | {
      type: "UpdateBoard";
      payload: {
        board: Board;
        isEndGame: boolean;
        currentTurnIndex: number;
      };
    }
  | { type: "EndGame" }
  | {
      type: "PutCell";
      payload: {
        position: CellPosition;
        cellColor: CellColor;
      };
    };

export const reducer = (state: OthelloState, action: OthelloActionType) => {
  switch (action.type) {
    case "StartGame":
      state.board = action.payload.board;
      state.boardID = action.payload.boardID;
      state.players = action.payload.players;
      state.status = "playing";
      state.currentPlayerIndex = action.payload.currentTurnIndex;
      return;
    case "UpdateBoard":
      state.board = action.payload.board;
      state.status = action.payload.isEndGame ? "end" : "playing";
      state.currentPlayerIndex = action.payload.currentTurnIndex;
      state.isTurnPutted = false;
      return;
    case "EndGame":
      state.status = "end";
      return;
    case "PutCell":
      const newCells = putCell(
        state.board,
        action.payload.position,
        action.payload.cellColor
      );
      state.board.cells = newCells;
      state.isTurnPutted = true;
      return;
  }
};

export const useOthelloReducer = () => useImmerReducer(reducer, initState);

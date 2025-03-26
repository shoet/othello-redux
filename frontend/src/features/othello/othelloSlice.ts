import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Board, Player, Result, CellPosition, CellColor } from "./othello";
import {
  getEmptyBoard,
  getAroundSandwitchedCells,
  putCell,
  isEndGame,
  putManyCell,
  calcScore,
} from "./othello";

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

const initState: OthelloState = {
  status: "prepare",
  board: getEmptyBoard(DEFAULT_BOARD_SIZE),
  players: [],
  currentPlayerIndex: 0,
  isTurnPutted: false,
};

export const othelloSlice = createSlice({
  name: "othello",
  initialState: initState,
  reducers: {
    startGameAction: (
      state: OthelloState,
      aciton: PayloadAction<{
        board: Board;
        boardID: string;
        players: Player[];
        currentTurnIndex: number;
      }>
    ) => {
      const { board, players, currentTurnIndex, boardID } = aciton.payload;
      state.board = board;
      state.boardID = boardID;
      state.players = players;
      state.status = "playing";
      state.currentPlayerIndex = currentTurnIndex;
    },
    updateBoardAction: (
      state,
      action: PayloadAction<{
        board: Board;
        isEndGame: boolean;
        currentTurnIndex: number;
      }>
    ) => {
      const { board, isEndGame, currentTurnIndex } = action.payload;
      state.board = board;
      state.status = isEndGame ? "end" : "playing";
      state.currentPlayerIndex = currentTurnIndex;
    },
    endGameAction: (state) => {
      state.status = "end";
    },
    putCellAction: (
      state: OthelloState,
      action: PayloadAction<{ position: CellPosition; cellColor: CellColor }>
    ) => {
      const { position, cellColor } = action.payload;
      const newCells = putCell(state.board, position, cellColor);
      state.board.cells = newCells;
    },
  },
});

export const {
  putCellAction,
  startGameAction,
  updateBoardAction,
  endGameAction,
} = othelloSlice.actions;
export const othelloReducer = othelloSlice.reducer;

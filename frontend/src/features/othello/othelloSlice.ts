import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Board,
  Player,
  Result,
  CellPosition,
  CellColor,
  GameScore,
} from "./othello";
import { getEmptyBoard, putCell } from "./othello";

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
  vsCPU?: boolean;
  score?: GameScore;
};

export const DEFAULT_BOARD_SIZE = 8;

const initState: OthelloState = {
  status: "prepare",
  board: getEmptyBoard(DEFAULT_BOARD_SIZE),
  players: [],
  currentPlayerIndex: 0,
  isTurnPutted: false,
  score: {
    black: { color: "black", count: 0 },
    white: { color: "white", count: 0 },
  },
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
        vsCPU?: boolean;
      }>
    ) => {
      const { board, players, currentTurnIndex, boardID, vsCPU } =
        aciton.payload;
      state.board = board;
      state.boardID = boardID;
      state.players = players;
      state.status = "playing";
      state.currentPlayerIndex = currentTurnIndex;
      state.vsCPU = vsCPU;
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
      state.isTurnPutted = false;
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
      state.isTurnPutted = true;
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

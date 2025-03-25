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
};

export const DEFAULT_BOARD_SIZE = 8;

const initState: OthelloState = {
  status: "prepare",
  board: getEmptyBoard(DEFAULT_BOARD_SIZE),
  players: [],
  currentPlayerIndex: 0,
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
    termAction: (state) => {
      if (!state.players) return;
      const nextPlayerIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
      state.currentPlayerIndex = nextPlayerIndex;
    },
    reverseCellAction: (
      state,
      action: PayloadAction<{
        putedPosition: CellPosition;
        putedColor: CellColor;
      }>
    ) => {
      const { putedPosition, putedColor } = action.payload;
      const targetCells = getAroundSandwitchedCells(
        state.board,
        putedPosition,
        putedColor
      )
        .map((directionWithCells) => {
          return directionWithCells.cells;
        })
        .flat();

      const newCells = putManyCell(state.board, targetCells, putedColor);
      state.board.cells = newCells;
    },
    calcScoreAction: (state) => {
      const endgame = isEndGame(state.board);
      console.log(endgame);
      if (state.players && isEndGame(state.board)) {
        const result = calcScore(state.board, state.players);
        state.result = result;
      }
    },
  },
});

export const {
  putCellAction,
  termAction,
  reverseCellAction,
  calcScoreAction,
  startGameAction,
  updateBoardAction,
  endGameAction,
} = othelloSlice.actions;
export const othelloReducer = othelloSlice.reducer;

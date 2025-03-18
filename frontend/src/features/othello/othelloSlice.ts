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

export type OthelloState = {
  roomID?: string;
  board: Board;
  currentPlayerIndex: number;
  players: Player[];
  result?: Result;
};

const initState: OthelloState = {
  board: getEmptyBoard(8),
  players: [
    { name: "taro", cellColor: "white" },
    { name: "jiro", cellColor: "black" },
  ],
  currentPlayerIndex: 0,
};

export const othelloSlice = createSlice({
  name: "othello",
  initialState: initState,
  reducers: {
    joinRoomAction: (
      state: OthelloState,
      action: PayloadAction<{ clientID: string; roomID: string }>
    ) => {
      // TODO
      state.roomID = action.payload.roomID;
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
      if (isEndGame(state.board)) {
        const result = calcScore(state.board, state.players);
        state.result = result;
      }
    },
  },
});

export const {
  joinRoomAction,
  putCellAction,
  termAction,
  reverseCellAction,
  calcScoreAction,
} = othelloSlice.actions;
export const othelloReducer = othelloSlice.reducer;

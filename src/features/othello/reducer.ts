import { OthelloAction } from "./actions";
import {
  Board,
  CellColor,
  CellPosition,
  getAroundSandwitchedCells,
  putCell,
  putManyCell,
} from "./othelloSlice";
import { OthelloState } from "./state";

export const OthelloReducer = (
  state: OthelloState,
  action: OthelloAction
): OthelloState => {
  switch (action.type) {
    case "reset":
      return state;
    case "put":
      return putCellReducer(state, action.position, action.color);
    case "term":
      return termReducer(state);
    case "reverseSandwitchedCells":
      return reverseSandwitchedCells(
        state,
        action.putedPosition,
        action.putedColor
      );
    default:
      throw new Error("not found action");
  }
};

const putCellReducer = (
  state: OthelloState,
  position: CellPosition,
  cellColor: CellColor
): OthelloState => {
  const newCells = putCell(state.board, position, cellColor);
  const newBoard: Board = { ...state.board, cells: newCells };
  return {
    ...state,
    board: newBoard,
  };
};

const termReducer = (state: OthelloState): OthelloState => {
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
  };
};

const reverseSandwitchedCells = (
  state: OthelloState,
  putedPosition: CellPosition,
  putedColor: CellColor
): OthelloState => {
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

  return {
    ...state,
    board: {
      ...state.board,
      cells: newCells,
    },
  };
};

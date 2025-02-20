import { Board, Player } from "./othelloSlice";

export type OthelloState = {
  board: Board;
  currentPlayerIndex: number;
  players: Player[];
};

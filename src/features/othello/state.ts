import { Board, Player, Result } from "./othelloSlice";

export type OthelloState = {
  board: Board;
  currentPlayerIndex: number;
  players: Player[];
  result?: Result;
};

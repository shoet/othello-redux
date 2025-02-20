import { CellColor, CellPosition } from "./othelloSlice";

export type OthelloAction =
  | { type: "put"; position: CellPosition; color: CellColor }
  | { type: "reverse"; position: CellPosition }
  | { type: "reset"; action: {} }
  | { type: "term" }
  | {
      type: "reverseSandwitchedCells";
      putedPosition: CellPosition;
      putedColor: CellColor;
    };

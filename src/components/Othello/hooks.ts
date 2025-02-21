import { useContext } from "react";
import { OthelloContext } from "../OthelloContextProvider";
import { CellColor, CellPosition } from "../../features/othello/othelloSlice";

export const useOthello = () => {
  const { state, dispatcher } = useContext(OthelloContext);

  const handlePutCell = (position: CellPosition, color: CellColor): void => {
    dispatcher({
      type: "put",
      color: color,
      position: position,
    });
    dispatcher({
      type: "reverseSandwitchedCells",
      putedPosition: position,
      putedColor: color,
    });
    dispatcher({ type: "calcScore" });
    dispatcher({ type: "term" });
  };

  return { state, handlePutCell };
};

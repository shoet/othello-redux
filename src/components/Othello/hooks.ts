import { useContext } from "react";
import { OthelloContext } from "../OthelloContextProvider";
import { CellColor, CellPosition } from "../../features/othello/othelloSlice";
import { OthelloAction } from "../../features/othello/actions";

export const useOthello = () => {
  const { state, dispatcher } = useContext(OthelloContext);

  const handlePutCell = (position: CellPosition, color: CellColor): void => {
    const putAction: OthelloAction = {
      type: "put",
      color: color,
      position: position,
    };
    dispatcher(putAction);
    dispatcher({
      type: "reverseSandwitchedCells",
      putedPosition: position,
      putedColor: color,
    });
    dispatcher({ type: "term" });
  };

  const handleReverseCell = (
    position: CellPosition,
    color: CellColor
  ): void => {
    const reverseAction: OthelloAction = {
      type: "reverse",
      position: position,
    };
    dispatcher(reverseAction);
    dispatcher({
      type: "reverseSandwitchedCells",
      putedPosition: position,
      putedColor: color,
    });
    dispatcher({ type: "term" });
  };

  return { state, handlePutCell, handleReverseCell };
};

import { Board } from "../Board";
import { useOthello } from "./hooks";
import { StatusBar } from "../StatusBar";
import { Cell, Player } from "../../othello";

export const Othello = () => {
  const { state, handlePutCell } = useOthello();

  const handleCliekCell = (cell: Cell, player: Player) => {
    if (cell.color == undefined) {
      handlePutCell(cell.position, player.cellColor);
    }
  };

  return (
    <div>
      <StatusBar
        currentPlayer={state.players[state.currentPlayerIndex]}
        result={state.result}
      />
      <Board
        cells={state.board.cells}
        handleClickCell={(cell) =>
          handleCliekCell(cell, state.players[state.currentPlayerIndex])
        }
      />
    </div>
  );
};

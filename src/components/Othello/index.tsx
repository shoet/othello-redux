import { Board } from "../Board";
import { Cell, Player } from "../../features/othello/othelloSlice";
import { useOthello } from "./hooks";
import { StatusBar } from "../StatusBar";

export const Othello = () => {
  const { state, handlePutCell } = useOthello();

  const handleCliekCell = (cell: Cell, player: Player) => {
    if (cell.color == undefined) {
      handlePutCell(cell.position, player.cellColor);
    }
  };

  return (
    <div>
      <StatusBar currentPlayer={state.players[state.currentPlayerIndex]} />
      <Board
        cells={state.board.cells}
        handleClickCell={(cell) =>
          handleCliekCell(cell, state.players[state.currentPlayerIndex])
        }
      />
    </div>
  );
};

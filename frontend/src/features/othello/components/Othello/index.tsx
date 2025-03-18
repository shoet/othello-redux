import { Board } from "../Board";
import { useOthello } from "./hooks";
import { Cell, Player } from "../../othello";
import styles from "./index.module.scss";
import { CSSProperties } from "react";
import { theme } from "../../../../theme";
import { OthelloHeader } from "../OthelloHeader";

export const Othello = () => {
  const { state, handlePutCell } = useOthello();

  const handleCliekCell = (cell: Cell, player: Player) => {
    if (cell.color == undefined) {
      handlePutCell(cell.position, player.cellColor);
    }
  };

  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;

  return (
    <div className={styles.othello} style={style}>
      <OthelloHeader turnPlayer={state.players[state.currentPlayerIndex]} />
      <div className={styles.board}>
        <Board
          cells={state.board.cells}
          handleClickCell={(cell) =>
            handleCliekCell(cell, state.players[state.currentPlayerIndex])
          }
        />
      </div>
    </div>
  );
};

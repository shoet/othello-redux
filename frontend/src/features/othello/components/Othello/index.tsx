import { Board } from "../Board";
import { useOthello } from "./hooks";
import { Cell, Player } from "../../othello";
import styles from "./index.module.scss";
import { CSSProperties, useEffect } from "react";
import { theme } from "../../../../theme";
import { OthelloHeader } from "../OthelloHeader";
import { startGame } from "../../../../services/startGame";
import { DEFAULT_BOARD_SIZE } from "../../othelloSlice";

export const Othello = () => {
  const {
    clientID,
    roomID,
    gameStatus,
    board,
    players,
    currentPlayerIndex,
    handlePutCell,
  } = useOthello();

  const handleCliekCell = (cell: Cell, player: Player) => {
    if (player.clientID !== clientID) {
      return;
    }
    if (cell.cellColor == undefined) {
      handlePutCell(cell.position, player.cellColor);
    }
  };

  useEffect(() => {
    if (clientID && roomID) {
      const boardSize = DEFAULT_BOARD_SIZE;
      startGame(clientID, roomID, boardSize);
    }
  }, []);

  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;

  return (
    <div className={styles.othello} style={style}>
      <OthelloHeader
        status={gameStatus}
        turnPlayer={players && players[currentPlayerIndex]}
      />
      <div className={styles.board}>
        <Board
          cells={board.cells}
          handleClickCell={(cell) => {
            if (players) {
              const player = players[currentPlayerIndex];
              handleCliekCell(cell, player);
            }
          }}
        />
      </div>
    </div>
  );
};

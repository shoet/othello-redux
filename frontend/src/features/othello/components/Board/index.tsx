import { CSSProperties } from "react";
import { Cell, Cells } from "../../othello";
import css from "./index.module.scss";
import { Disk } from "../Disk";
import { theme } from "../../../../theme";

type Props = {
  cells: Cells;
  handleClickCell: (cell: Cell) => void;
};

export const Board = (props: Props) => {
  const { handleClickCell, cells } = props;

  const style = {
    "--columns": cells.length,
    "--boardBackgroundColor": theme.othello.boardBackgroundColor,
    "--boardForegroundColor": theme.othello.boardForegroundColor,
  } as CSSProperties;

  return (
    <div className={css.boardContainer}>
      <div className={css.board} style={style}>
        {cells.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              className={css.cell}
              key={`${rowIdx}-${colIdx}`}
              onClick={() => handleClickCell(cell)}
            >
              {cell.color ? <Disk color={cell.color} /> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

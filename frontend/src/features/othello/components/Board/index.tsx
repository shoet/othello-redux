import { CSSProperties } from "react";
import { Cell, Cells } from "../../othello";
import css from "./index.module.scss";

type Props = {
  cells: Cells;
  handleClickCell: (cell: Cell) => void;
};

export const Board = (props: Props) => {
  const { handleClickCell, cells } = props;

  const style = {
    "--columns": cells.length,
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
              {cell.color}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

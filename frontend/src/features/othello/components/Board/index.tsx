import { Cell, Cells } from "../../othello";
import css from "./index.module.scss";

type Props = {
  cells: Cells;
  handleClickCell: (cell: Cell) => void;
};

export const Board = (props: Props) => {
  const { handleClickCell, cells } = props;

  return (
    <div className={css.board}>
      <div className={css.column}>
        {cells.map((row, idx) => {
          return (
            <div className={css.row} key={idx}>
              {row.map((cell, idx) => {
                return (
                  <div
                    className={css.cell}
                    onClick={() => handleClickCell(cell)}
                    key={idx}
                  >
                    {cell.color}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { Cell, Cells } from "../../features/othello/othelloSlice";
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
        {cells.map((row) => {
          return (
            <div className={css.row}>
              {row.map((cell) => {
                return (
                  <div
                    className={css.cell}
                    onClick={() => handleClickCell(cell)}
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

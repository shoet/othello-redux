import { CSSProperties } from "react";
import { Cell, CellColor, Cells } from "../../othello";
import css from "./index.module.scss";
import { OthelloDiskIcon } from "../../../../components/Icons";

type Props = {
  cells: Cells;
  handleClickCell: (cell: Cell) => void;
};

export const Disk = (props: { color: CellColor }) => {
  const color = props.color == "black" ? "#333" : "white";
  return (
    <div className={css.disk}>
      <OthelloDiskIcon backgroundColor={color} size={40} />
    </div>
  );
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
              {cell.color ? <Disk color={cell.color} /> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

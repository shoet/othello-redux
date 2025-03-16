import { BoardDTO, BoardID, Cell, CellColor, Position, RoomID } from "./types";

enum CellDirection {
  Up = 0,
  UpRight = 45,
  Right = 90,
  DownRight = 135,
  Down = 180,
  DownLeft = 225,
  Left = 270,
  UpLeft = 315,
}

const directions = {
  [CellDirection.Up]: { dx: 0, dy: -1 },
  [CellDirection.UpRight]: { dx: 1, dy: -1 },
  [CellDirection.Right]: { dx: 1, dy: 0 },
  [CellDirection.DownRight]: { dx: 1, dy: 1 },
  [CellDirection.Down]: { dx: 0, dy: 1 },
  [CellDirection.DownLeft]: { dx: -1, dy: 1 },
  [CellDirection.Left]: { dx: -1, dy: 0 },
  [CellDirection.UpLeft]: { dx: -1, dy: -1 },
} as const;

export type Cells = Cell[][];

export class Board {
  boardID: BoardID;
  boardSize: number;
  cells: Cell[][];

  constructor(boardID: BoardID, boardSize: number, cells: Cell[][]) {
    this.boardID = boardID;
    this.boardSize = boardSize;
    this.cells = cells;
  }

  static fromJSON(boardID: BoardID, boardSize: number, body: string): Board {
    const rows = JSON.parse(body);
    if (!Array.isArray(rows))
      throw new Error("invalid board contents: not an array");
    for (let row of rows) {
      if (!Array.isArray(row))
        throw new Error("invalid board contents: row is not an array");
      for (let cell of row) {
        if (!Board.isCell(cell)) throw new Error("invalid cell contents");
      }
    }
    return new Board(boardID, boardSize, rows);
  }

  static isCell(cell: any): cell is Cell {
    return (
      typeof cell === "object" &&
      cell !== null &&
      typeof cell.position === "object" &&
      typeof cell.position.x === "number" &&
      typeof cell.position.y === "number" &&
      (cell.cellColor === "white" || cell.cellColor === "black")
    );
  }

  static fromEmpty(boardID: BoardID, boardSize: number): Board {
    const cells = Array.from({ length: boardSize }, (_, y) =>
      Array.from({ length: boardSize }, (_, x) => ({
        position: { x, y },
        cellColor: null,
      }))
    );
    return new Board(boardID, boardSize, cells);
  }

  toDTO(): BoardDTO {
    return {
      boardID: this.boardID,
      boardSize: this.boardSize,
      data: JSON.stringify(this.cells),
    };
  }

  /**
   * putCell はボード上のpositionにcolorで指定した石を配置して裏返す
   */
  putCell(position: Position, color: CellColor): void {
    this.cells[position.y][position.x] = {
      position: position,
      cellColor: color,
    };
    this.reverceCell(position, color);
  }

  /**
   * putManyCell は、Board上のcellsに、putCellsを配置する。
   */
  private putManyCell(putCells: Cell[], cellColor: CellColor): void {
    putCells.forEach((cell) => {
      this.cells[cell.position.y][cell.position.x] = {
        cellColor: cellColor,
        position: cell.position,
      };
    });
  }

  /**
   * reverceCell は、石が配置されたことによって、裏返し対象となったセルを裏返す。
   */
  private reverceCell(putedPosition: Position, putedColor: CellColor): void {
    // 裏返し対象のセルを取得
    const targetCells = this.getAroundSandwitchedCells(
      putedPosition,
      putedColor
    )
      .map((directionWithCells) => {
        return directionWithCells.cells;
      })
      .flat();
    // 対象のセルを指定された色に変更する
    this.putManyCell(targetCells, putedColor);
  }

  /**
   * getDirectionCells は、指定された位置から指定された方向に向かって、指定された色のセルで挟まれたセルを取得する。
   */
  private getDirectionCells(
    x: number,
    y: number,
    cellColor: CellColor,
    direction: CellDirection
  ): Cell[] {
    let cells: Cell[] = [];

    const { dx, dy } = directions[direction];
    let foundSameColor = false;

    while (true) {
      x += dx;
      y += dy;

      if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
        break;
      }

      const cell = this.cells[y][x];
      if (cell.cellColor === null) {
        return [];
      } else if (cell.cellColor == cellColor) {
        foundSameColor = true;
        break;
      } else {
        cells.push(cell);
      }
    }
    // 同じ色が見つからずに終了した場合はリセットして返す
    if (!foundSameColor) {
      return [];
    }
    return cells;
  }

  /**
   * getAroundSandwitchedCells は、指定された位置のセルに対して、指定された色で挟まれたセルを取得する。
   * 返り値は、挟まれたセルの方向とセルの配列のリストを返す。
   */
  private getAroundSandwitchedCells(
    position: Position,
    color: CellColor
  ): { direction: CellDirection; cells: Cell[] }[] {
    const aroundDirections = [
      CellDirection.Up,
      CellDirection.UpRight,
      CellDirection.Right,
      CellDirection.DownRight,
      CellDirection.Down,
      CellDirection.DownLeft,
      CellDirection.Left,
      CellDirection.UpLeft,
    ];

    return aroundDirections.map((direction) => {
      const directionCells = this.getDirectionCells(
        position.x,
        position.y,
        color,
        direction
      );
      return {
        direction: direction,
        cells: directionCells,
      };
    });
  }
}
